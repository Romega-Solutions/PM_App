/**
 * profile-photo-ingest
 *
 * The only way a profile photo gets into the private `profile-photos` bucket.
 * Members can no longer upload to that bucket directly (see migration
 * 20261121120000_private_profile_photos.sql), so a modified client cannot skip
 * these checks:
 *
 * 1. Signed-in member only (verify_jwt + /auth/v1/user lookup).
 * 2. Size: at most 10 MB (10485760 bytes), checked on Content-Length and again
 *    while reading the body. Larger requests get HTTP 413.
 * 3. Type: the real type comes from the file's magic bytes. JPEG, PNG, WebP and
 *    HEIC only. GIF, AVIF, HEIC sequences, video and unknown data get HTTP 415.
 *    A declared Content-Type outside the allowed list also gets 415.
 * 4. EXIF / GPS / XMP / IPTC are removed (see ../_shared/photoMetadata.ts). If
 *    the file cannot be parsed safely the upload is refused (HTTP 422); the
 *    original bytes are never stored.
 * 5. Upload rate limit per member (public.claim_profile_photo_ingest).
 * 6. Stored as `<user id>/<timestamp>-<uuid>.<jpg|png|webp|heic>` with the
 *    service role. The response returns the storage path; the app saves the
 *    path in profiles.photos and signs it at read time.
 *
 * Request:  POST, body = raw image bytes, Content-Type = image MIME type.
 * Response: 200 { path, contentType, bytes, removedMetadata[] }
 *           4xx/5xx { error, code }
 */

import {
  PhotoMetadataError,
  PROFILE_PHOTO_DECLARED_TYPES,
  PROFILE_PHOTO_EXTENSIONS,
  PROFILE_PHOTO_MAX_BYTES,
  findProfilePhotoMetadata,
  sniffProfilePhotoType,
  stripProfilePhotoMetadata,
} from "../_shared/photoMetadata.ts";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const BUCKET = "profile-photos";
const USER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MESSAGES = {
  auth: "Sign in before adding photos.",
  method: "Use POST to upload a photo.",
  empty: "Choose a photo and try again.",
  tooLarge: "Photo is too large. Choose a photo under 10 MB.",
  type: "Photo type is not supported. Use JPEG, PNG, WebP or HEIC.",
  unreadable: "This photo could not be processed. Try a different photo.",
  rateLimited: "Too many photo uploads. Please wait and try again.",
  unavailable: "Photo upload is temporarily unavailable. Please try again.",
} as const;

class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

function jsonResponse(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      ...extraHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function getConfig() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/+$/, "");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("profile-photo-ingest is missing SUPABASE_URL, SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY.");
    throw new HttpError(503, "not_configured", MESSAGES.unavailable);
  }

  return { supabaseUrl, anonKey, serviceRoleKey };
}

async function requireUserId(req: Request, config: ReturnType<typeof getConfig>): Promise<string> {
  const token = (req.headers.get("authorization") || "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) throw new HttpError(401, "auth_required", MESSAGES.auth);

  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: config.anonKey },
  });
  if (!response.ok) throw new HttpError(401, "auth_required", MESSAGES.auth);

  const user = (await response.json().catch(() => null)) as { id?: unknown } | null;
  const userId = typeof user?.id === "string" ? user.id : "";
  if (!USER_ID_PATTERN.test(userId)) throw new HttpError(401, "auth_required", MESSAGES.auth);

  return userId.toLowerCase();
}

function assertDeclaredType(req: Request): void {
  const declared = (req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (declared && !PROFILE_PHOTO_DECLARED_TYPES.includes(declared)) {
    throw new HttpError(415, "unsupported_type", MESSAGES.type);
  }
}

async function readBodyWithLimit(req: Request): Promise<Uint8Array> {
  const declaredLength = Number(req.headers.get("content-length") || "");
  if (Number.isFinite(declaredLength) && declaredLength > PROFILE_PHOTO_MAX_BYTES) {
    throw new HttpError(413, "too_large", MESSAGES.tooLarge);
  }

  if (!req.body) throw new HttpError(400, "empty", MESSAGES.empty);

  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > PROFILE_PHOTO_MAX_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new HttpError(413, "too_large", MESSAGES.tooLarge);
    }
    chunks.push(value);
  }

  if (total === 0) throw new HttpError(400, "empty", MESSAGES.empty);

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

async function claimUpload(config: ReturnType<typeof getConfig>, userId: string): Promise<void> {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/rpc/claim_profile_photo_ingest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.serviceRoleKey}`,
      apikey: config.serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_user_id: userId }),
  });

  if (!response.ok) {
    console.error(`Profile photo rate limit check failed with status ${response.status}.`);
    throw new HttpError(503, "rate_limit_unavailable", MESSAGES.unavailable);
  }

  const result = (await response.json().catch(() => null)) as
    | { allowed?: boolean; retry_after_seconds?: number }
    | null;

  if (!result?.allowed) {
    const retryAfter = Math.max(1, Math.trunc(Number(result?.retry_after_seconds) || 60));
    throw Object.assign(new HttpError(429, "rate_limited", MESSAGES.rateLimited), { retryAfter });
  }
}

async function storePhoto(
  config: ReturnType<typeof getConfig>,
  path: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<void> {
  const response = await fetch(`${config.supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.serviceRoleKey}`,
      apikey: config.serviceRoleKey,
      "Content-Type": contentType,
      "Cache-Control": "max-age=3600",
      "x-upsert": "false",
    },
    body: bytes as unknown as BodyInit,
  });

  if (!response.ok) {
    // Bucket limits (file_size_limit / allowed_mime_types) are a second guard.
    console.error(`Profile photo storage upload failed with status ${response.status}.`);
    if (response.status === 413) throw new HttpError(413, "too_large", MESSAGES.tooLarge);
    throw new HttpError(502, "storage_failed", MESSAGES.unavailable);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") throw new HttpError(405, "method_not_allowed", MESSAGES.method);

    const config = getConfig();
    const userId = await requireUserId(req, config);
    assertDeclaredType(req);
    const original = await readBodyWithLimit(req);

    const sniffed = sniffProfilePhotoType(original);
    if (!sniffed.ok) {
      console.warn(`Rejected profile photo with detected type ${sniffed.detected}.`);
      throw new HttpError(415, "unsupported_type", MESSAGES.type);
    }

    let stripped;
    try {
      stripped = stripProfilePhotoMetadata(original, sniffed.type);
      const leftover = findProfilePhotoMetadata(stripped.bytes, stripped.type);
      if (leftover.length > 0) {
        console.error(`Metadata still present after strip: ${leftover.join(", ")}.`);
        throw new PhotoMetadataError("Metadata still present");
      }
    } catch (error) {
      if (error instanceof PhotoMetadataError) {
        throw new HttpError(422, "unprocessable", MESSAGES.unreadable);
      }
      throw error;
    }

    await claimUpload(config, userId);

    const extension = PROFILE_PHOTO_EXTENSIONS[stripped.type];
    const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    await storePhoto(config, path, stripped.bytes, stripped.type);

    return jsonResponse({
      path,
      contentType: stripped.type,
      bytes: stripped.bytes.byteLength,
      removedMetadata: stripped.removed,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      const retryAfter = (error as HttpError & { retryAfter?: number }).retryAfter;
      return jsonResponse(
        { error: error.message, code: error.code },
        error.status,
        retryAfter ? { "Retry-After": String(retryAfter) } : {},
      );
    }

    console.error("profile-photo-ingest failed unexpectedly.");
    return jsonResponse({ error: MESSAGES.unavailable, code: "internal" }, 500);
  }
});
