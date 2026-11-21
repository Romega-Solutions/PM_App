/**
 * Profile photo references and signed display URLs (ticket #46).
 *
 * The `profile-photos` bucket is private. profiles.photos stores storage
 * paths (`<user id>/<timestamp>-<uuid>.<ext>`). Older rows can still hold the
 * previous public URLs until the one-time rewrite runs, so every reader goes
 * through this one module, which accepts both (dual-read):
 *
 * - path              -> signed URL (1 hour)
 * - old public URL    -> signed URL for its path (falls back to the public URL
 *                        only if signing fails, which still works while the
 *                        bucket is public)
 * - signed URL        -> re-used if still cached, otherwise re-signed
 * - anything else     -> returned unchanged (demo photos, local file:// URIs)
 *
 * Writers call toProfilePhotoStoragePath() so a display URL handed back by the
 * UI is stored as a path again.
 */

import { supabase } from "@/src/config/supabase";

export const PROFILE_PHOTOS_BUCKET = "profile-photos";
/** Same expiry the chat images use. */
export const PROFILE_PHOTO_SIGNED_URL_TTL_SECONDS = 60 * 60;
/** Re-sign a cached link when less than this is left. */
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

const PROFILE_PHOTO_PATH_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\/[0-9]+-[a-z0-9-]+\.(?:jpg|png|webp|heic)$/i;
const STORAGE_URL_PATTERN =
  /^https?:\/\/[^/]+\/storage\/v1\/object\/(?:public\/|sign\/|authenticated\/)?profile-photos\/(.+)$/i;

type CachedUrl = { url: string; expiresAt: number };
const signedUrlCache = new Map<string, CachedUrl>();

/** Test helper. */
export function clearProfilePhotoUrlCache(): void {
  signedUrlCache.clear();
}

/**
 * Returns the storage path for a profiles.photos entry or display URL, or
 * null when the value is not a profile-photos reference.
 */
export function toProfilePhotoStoragePath(value: string | null | undefined): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) return null;

  let candidate = trimmed;
  const urlMatch = trimmed.match(STORAGE_URL_PATTERN);
  if (urlMatch) {
    try {
      candidate = decodeURIComponent(urlMatch[1].split("?")[0].split("#")[0]);
    } catch {
      return null;
    }
  }

  candidate = candidate.replace(/^\/+/, "");
  if (candidate.includes("..") || candidate.includes("\\")) return null;

  return PROFILE_PHOTO_PATH_PATTERN.test(candidate) ? candidate : null;
}

export function isOwnProfilePhoto(value: string, userId: string): boolean {
  const path = toProfilePhotoStoragePath(value);
  return Boolean(path && path.startsWith(`${userId}/`));
}

function getCached(path: string): string | null {
  const cached = signedUrlCache.get(path);
  if (cached && cached.expiresAt - REFRESH_MARGIN_MS > Date.now()) {
    return cached.url;
  }
  signedUrlCache.delete(path);
  return null;
}

/**
 * Resolve profile photo references to URLs an <Image> can load.
 * Keeps order; drops entries that are profile-photos paths but could not be
 * signed (for example a removed photo).
 */
export async function resolveProfilePhotoUrls(
  values: (string | null | undefined)[] | null | undefined,
): Promise<string[]> {
  if (!Array.isArray(values) || values.length === 0) return [];

  const entries = values
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => ({ original: value.trim(), path: toProfilePhotoStoragePath(value) }));

  const toSign = Array.from(
    new Set(entries.flatMap((entry) => (entry.path && !getCached(entry.path) ? [entry.path] : []))),
  );

  if (toSign.length > 0) {
    try {
      const { data, error } = await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .createSignedUrls(toSign, PROFILE_PHOTO_SIGNED_URL_TTL_SECONDS);

      if (error) {
        console.warn("Unable to sign profile photo URLs.");
      }

      const expiresAt = Date.now() + PROFILE_PHOTO_SIGNED_URL_TTL_SECONDS * 1000;
      for (const item of data ?? []) {
        if (item?.path && item.signedUrl && !item.error) {
          signedUrlCache.set(item.path, { url: item.signedUrl, expiresAt });
        }
      }
    } catch {
      console.warn("Unable to sign profile photo URLs.");
    }
  }

  return entries.flatMap((entry) => {
    if (!entry.path) return [entry.original];

    const signed = getCached(entry.path);
    if (signed) return [signed];

    // Dual-read: an old public URL still works while the bucket is public.
    if (/\/storage\/v1\/object\/public\/profile-photos\//i.test(entry.original)) {
      return [entry.original];
    }

    return [];
  });
}

export async function resolveProfilePhotoUrl(value: string | null | undefined): Promise<string | null> {
  const [url] = await resolveProfilePhotoUrls([value]);
  return url ?? null;
}

/** Returns a copy of the profile with display-ready `photos`. */
export async function withSignedProfilePhotos<T extends { photos?: string[] | null }>(
  profile: T,
): Promise<T> {
  if (!profile || !Array.isArray(profile.photos)) return profile;
  return { ...profile, photos: await resolveProfilePhotoUrls(profile.photos) };
}

/** Signs every profile's photos with one storage request. */
export async function withSignedProfilePhotosList<T extends { photos?: string[] | null }>(
  profiles: T[] | null | undefined,
): Promise<T[]> {
  if (!Array.isArray(profiles) || profiles.length === 0) return [];

  const all = profiles.flatMap((profile) => (Array.isArray(profile.photos) ? profile.photos : []));
  // Warm the cache in one call, then map each profile from the cache.
  await resolveProfilePhotoUrls(all);

  return Promise.all(profiles.map((profile) => withSignedProfilePhotos(profile)));
}
