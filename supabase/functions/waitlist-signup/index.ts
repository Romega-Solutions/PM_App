type WaitlistPlatform = "ios" | "android" | "web" | "unknown";

type WaitlistRequestBody = {
  email?: unknown;
  platform?: unknown;
  source?: unknown;
  website?: unknown;
  company?: unknown;
  nickname?: unknown;
  turnstileToken?: unknown;
  token?: unknown;
};

type EdgeQuotaResult = {
  allowed?: boolean;
  retry_after_seconds?: number;
  attempt_count?: number;
};

type WaitlistRpcRow = {
  email_normalized?: string;
  platform?: WaitlistPlatform;
  status?: string;
};

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const DEFAULT_MAX_ATTEMPTS_PER_HOUR = 6;
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const WAITLIST_RPC_PATH = "/rest/v1/rpc/submit_waitlist_signup";
const EDGE_ATTEMPT_RPC_PATH = "/rest/v1/rpc/claim_waitlist_edge_attempt";

class HttpError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function isEnabled(value: string | undefined): boolean {
  return value === "true";
}

function normalizeSupabaseUrl(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, "") ?? "";
}

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizePlatform(value: unknown): WaitlistPlatform {
  if (value === "ios" || value === "android" || value === "web") {
    return value;
  }

  return "unknown";
}

function normalizeSource(value: unknown): "pm_web" | "pm_app" {
  return value === "pm_app" ? "pm_app" : "pm_web";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getAllowedOrigins(): string[] {
  return (Deno.env.get("WAITLIST_ALLOWED_ORIGINS") ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

function getOrigin(req: Request): string {
  return (req.headers.get("origin") ?? "").trim().replace(/\/+$/, "");
}

function isOriginAllowed(req: Request): boolean {
  const origin = getOrigin(req);
  const allowedOrigins = getAllowedOrigins();

  if (!origin) {
    return isEnabled(Deno.env.get("WAITLIST_ALLOW_NO_ORIGIN"));
  }

  return allowedOrigins.includes(origin);
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = getOrigin(req);
  const allowedOrigin = isOriginAllowed(req) && origin ? origin : "null";

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, cf-turnstile-response, x-turnstile-token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function jsonResponse(req: Request, body: unknown, status = 200, retryAfterSeconds?: number): Response {
  const headers: Record<string, string> = {
    ...corsHeaders(req),
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };

  if (retryAfterSeconds && retryAfterSeconds > 0) {
    headers["Retry-After"] = String(retryAfterSeconds);
  }

  return new Response(JSON.stringify(body), { status, headers });
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    forwardedFor ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

function anonymizeIp(ip: string): string {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
  }

  if (ip.includes(":")) {
    return `${ip.split(":").slice(0, 3).join(":")}::/48`;
  }

  return "unknown";
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toHex(signature);
}

function hasHoneypotValue(body: WaitlistRequestBody): boolean {
  return [body.website, body.company, body.nickname].some(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

async function parseRequestBody(req: Request): Promise<WaitlistRequestBody> {
  const contentType = req.headers.get("content-type") ?? "";

  if (!contentType.toLowerCase().includes("application/json")) {
    throw new HttpError("Expected a JSON waitlist request.", 415);
  }

  const payload = await req.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    throw new HttpError("Invalid waitlist request.", 400);
  }

  return payload as WaitlistRequestBody;
}

async function verifyTurnstile(req: Request, body: WaitlistRequestBody, clientIp: string): Promise<void> {
  const secret = Deno.env.get("WAITLIST_TURNSTILE_SECRET_KEY")?.trim() ?? "";
  const requiresTurnstile = isEnabled(Deno.env.get("WAITLIST_REQUIRE_TURNSTILE")) || Boolean(secret);

  if (!requiresTurnstile) {
    return;
  }

  if (!secret) {
    console.error("Waitlist Turnstile is required but WAITLIST_TURNSTILE_SECRET_KEY is missing.");
    throw new HttpError("Waitlist temporarily unavailable. Please use the email path.", 503);
  }

  const token =
    (typeof body.turnstileToken === "string" && body.turnstileToken.trim()) ||
    (typeof body.token === "string" && body.token.trim()) ||
    req.headers.get("cf-turnstile-response")?.trim() ||
    req.headers.get("x-turnstile-token")?.trim() ||
    "";

  if (!token) {
    throw new HttpError("Complete the waitlist challenge before submitting.", 403);
  }

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  if (clientIp !== "unknown") {
    formData.append("remoteip", clientIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    console.error(`Waitlist Turnstile verification failed with status ${response.status}.`);
    throw new HttpError("Waitlist challenge could not be verified. Please try again.", 503);
  }

  const result = await response.json().catch(() => null) as { success?: boolean } | null;

  if (!result?.success) {
    throw new HttpError("Waitlist challenge failed. Please try again.", 403);
  }
}

async function callSupabaseRpc(path: string, body: Record<string, unknown>): Promise<unknown> {
  const supabaseUrl = normalizeSupabaseUrl(Deno.env.get("SUPABASE_URL"));
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim() ?? "";

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Waitlist edge function missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
    throw new HttpError("Waitlist temporarily unavailable. Please use the email path.", 503);
  }

  const response = await fetch(`${supabaseUrl}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error(`Waitlist RPC ${path} failed with status ${response.status}.`);
    throw new HttpError("Waitlist temporarily unavailable. Please use the email path.", 503);
  }

  return await response.json();
}

async function claimEdgeAttempt(input: {
  fingerprint: string;
  ipPrefix: string;
  platform: WaitlistPlatform;
  source: "pm_web" | "pm_app";
}): Promise<void> {
  const payload = await callSupabaseRpc(EDGE_ATTEMPT_RPC_PATH, {
    p_client_fingerprint: input.fingerprint,
    p_ip_prefix: input.ipPrefix,
    p_platform: input.platform,
    p_source: input.source,
    p_max_per_hour: parsePositiveInt(
      Deno.env.get("WAITLIST_MAX_ATTEMPTS_PER_HOUR"),
      DEFAULT_MAX_ATTEMPTS_PER_HOUR,
    ),
  });

  const result = Array.isArray(payload)
    ? (payload[0] as EdgeQuotaResult | undefined)
    : (payload as EdgeQuotaResult | null);

  if (!result?.allowed) {
    throw new HttpError(
      "Too many waitlist attempts. Please try again later or use the email path.",
      429,
      result?.retry_after_seconds ?? 3600,
    );
  }
}

function acceptedRows(email: string, platform: WaitlistPlatform): WaitlistRpcRow[] {
  return [
    {
      email_normalized: email,
      platform,
      status: "accepted",
    },
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (!isOriginAllowed(req)) {
    return jsonResponse(req, { error: "Waitlist origin is not allowed." }, 403);
  }

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed." }, 405);
  }

  try {
    const body = await parseRequestBody(req);
    const email = normalizeEmail(body.email);
    const platform = normalizePlatform(body.platform);
    const source = normalizeSource(body.source);

    if (!isValidEmail(email)) {
      return jsonResponse(req, { error: "A valid email address is required." }, 400);
    }

    if (hasHoneypotValue(body)) {
      return jsonResponse(req, acceptedRows(email, platform));
    }

    const clientIp = getClientIp(req);
    const ipPrefix = anonymizeIp(clientIp);
    const userAgent = req.headers.get("user-agent")?.slice(0, 300) ?? "unknown";
    const salt = Deno.env.get("WAITLIST_RATE_LIMIT_SALT")?.trim() ?? "";

    if (salt.length < 24) {
      console.error("WAITLIST_RATE_LIMIT_SALT must be set to a high-entropy value before public capture is enabled.");
      throw new HttpError("Waitlist temporarily unavailable. Please use the email path.", 503);
    }

    await verifyTurnstile(req, body, clientIp);

    const fingerprint = await hmacSha256Hex(
      salt,
      [ipPrefix, userAgent, source, platform].join("|"),
    );

    await claimEdgeAttempt({ fingerprint, ipPrefix, platform, source });

    const payload = await callSupabaseRpc(WAITLIST_RPC_PATH, {
      p_email: email,
      p_platform: platform,
      p_source: source,
    });

    const rows = Array.isArray(payload) ? (payload as WaitlistRpcRow[]) : [];
    const firstRow = rows[0];

    if (!firstRow?.email_normalized || !firstRow.platform || !firstRow.status) {
      throw new HttpError("Waitlist response was incomplete. Please use the email path.", 503);
    }

    return jsonResponse(req, rows);
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse(
        req,
        { error: error.message },
        error.status,
        error.retryAfterSeconds,
      );
    }

    console.error("Unexpected waitlist edge failure.", error);
    return jsonResponse(req, { error: "Waitlist request failed. Please use the email path." }, 502);
  }
});