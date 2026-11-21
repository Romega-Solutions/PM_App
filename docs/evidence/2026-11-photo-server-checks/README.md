# Ticket #46: server-side photo checks (evidence)

Date: 2026-11-21
Owner: Kirk Gamo. Reviewer: Duane Vargas.
Scope: closed beta. Nothing here was run against production (`prxykmkexfovbiatylue`).
All proof ran on a local Supabase stack (CLI 3.2.0, Postgres 17, storage-api v1.96.0, edge-runtime v1.79.1),
built from `main` + PR #28 (rebuild fixes, needed for a clean local rebuild) + this branch.

## 1. Shared photo rules

| Rule | Value | Where it is enforced on the server |
|---|---|---|
| Max size | 10 MB = 10485760 bytes per photo | Edge Function (Content-Length + streamed byte count), bucket `file_size_limit` |
| Types | JPEG, PNG, WebP, HEIC (`image/jpeg`, `image/png`, `image/webp`, `image/heic`) | Edge Function (magic bytes, not the declared type), bucket `allowed_mime_types` |
| EXIF / GPS | removed on ingest | Edge Function (`supabase/functions/_shared/photoMetadata.ts`) |
| Links | private bucket, signed URL, 1 hour (same as chat images) | bucket `public = false`, Storage SELECT policy, client `profilePhotoUrls.ts` |

Declared types the function accepts as input: the four above plus `image/jpg`, `image/heif` and
`application/octet-stream`. The stored type always comes from the file bytes. HEIF/HEIC is stored as
`image/heic` with a `.heic` extension.

Client caps are Belle's mobile task (they are still 6 MB at `fc903cc`). The server does not depend on them.

## 2. What changed

- `supabase/migrations/20261121120000_private_profile_photos.sql`
  - `profile-photos`: `public = false`, `file_size_limit = 10485760`, `allowed_mime_types` = the four types.
  - Drops every PERMISSIVE storage policy that names `profile-photos` (known names plus any drift, for example
    `Anyone can view profile photos` / `Users can update own profile photos` from `04_production_core_hardening.sql`,
    which a local rebuild creates). RESTRICTIVE policies (PR #30's upload rate limit) are kept.
  - Members can no longer INSERT or UPDATE objects in `profile-photos`. The Edge Function is the only writer.
  - `Users can delete own profile photos` (own folder) is recreated.
  - `Members can view visible profile photos` (SELECT, authenticated) uses `public.can_view_profile_photo(name)`:
    own photos; or a photo that is listed in the owner's `profiles.photos` when the owner is discoverable
    (active + verified + `profile_visible`, same as `discoverable_profiles`) or a mutual match (same as
    `get_user_conversations`); never across a block either way.
  - `public.profile_photo_storage_path(text)`: path / public URL / signed URL to a storage path, or NULL.
  - `public.claim_profile_photo_ingest(uuid)` (service role only): uploads per member, using the
    `storage_upload:profile-photos` rows from PR #30's `rate_limit_rules` if that table exists, else 20 per hour.
  - Trigger `enforce_profile_photo_paths` on `profiles.photos` (client writes only): every entry must be in the
    member's own folder, at most 6, a newly added path must exist as an object, and entries are stored as paths.
    Service role / SQL editor writes are not checked.
  - New functions: 4 (`profile_photo_storage_path`, `can_view_profile_photo`, `claim_profile_photo_ingest`,
    `enforce_profile_photo_paths`), all `search_path = ''`, anon has no EXECUTE.
- `supabase/functions/profile-photo-ingest/index.ts` (+ `config.toml`: `verify_jwt = true`)
  - POST raw image bytes. Checks sign-in, size, real type, strips metadata (fails closed), rate limit, then stores
    `<user id>/<ms timestamp>-<uuid>.<jpg|png|webp|heic>` with the service role and returns `{ path }`.
  - Errors: 401 not signed in, 413 too large, 415 type not allowed, 422 cannot be processed safely, 429 rate limited.
- `supabase/functions/_shared/photoMetadata.ts`: dependency-free sniff + strip (no re-encode, see section 3).
- App: `src/features/profile/api/profilePhotoUrls.ts` is the one read path. Discover, Likes, Matches, match
  modal, Messages, the profile screen, Edit Profile and account setup all go through it.
  `uploadProfilePhoto` calls the Edge Function. Writes store paths.
- `supabase/manual-repair-scripts/20261121_rewrite_profile_photo_urls_to_paths.sql`: one-time URL to path rewrite.
- `scripts/backfill-profile-photo-metadata.mjs`: one-time EXIF strip for photos uploaded before this PR.
- `supabase/functions/ocr/index.ts`: document cap 6 MB → 10 MB to match the shared rule (Belle's #45 raises the
  verification client cap). Local check: 11 MB → 413 `Document must be between 1 byte and 10 MB.`

## 3. How EXIF / GPS is removed (and why not re-encode)

Supabase Free Edge Functions have a 2 s CPU limit, and we do not use paid image transforms. Decoding and re-encoding
a 12 MP phone photo (HEIC in particular) does not fit reliably. So the function removes the metadata containers
without touching the image data:

| Format | Removed | Kept |
|---|---|---|
| JPEG | APP1 (EXIF, XMP), APP2 MPF, APP3-APP13, APP15, COM, everything after the first EOI (extra preview/depth/gain-map images with their own EXIF) | APP0 JFIF, APP2 ICC profile, APP14 Adobe, image data. If Orientation was not 1, a new 34-byte EXIF block with only Orientation is written back so the photo does not turn sideways. |
| PNG | `eXIf`, `tEXt`, `zTXt`, `iTXt`, `tIME`, data after `IEND` | everything else |
| WebP | `EXIF`, `XMP ` chunks; VP8X EXIF/XMP flags cleared; RIFF size fixed; trailing data | image, alpha, ICC, animation chunks |
| HEIC | every Exif item is overwritten in place with an empty EXIF block (0 tags) + zero bytes; every XMP item (`mime` `application/rdf+xml`) with zero bytes. File size and byte offsets do not change. | image items; orientation (it lives in `irot`/`imir`, not EXIF). Output stays HEIC. HEIC sequences (`msf1`/`hevc`) and AVIF are rejected. |

After stripping, the function re-scans the output and refuses the upload (422) if any metadata block is left.
HEIC note for Belle: the server keeps HEIC as HEIC (`image/heic`, `.heic`). Browsers other than Safari cannot show
HEIC, so the app should keep converting to JPEG on the phone before upload where it can.

## 4. Local proof

Results: [proof-local.out](proof-local.out) (22/22), [db-tests-local.out](db-tests-local.out),
[backfill-local.out](backfill-local.out), [url-rewrite-local.out](url-rewrite-local.out).
Test photos: 640x480, fake Manila GPS 14.5994 N, 120.9775 E, made with `sharp` ([make-fixtures.cjs](make-fixtures.cjs)).
GPS was read back with `exifr` 7.1.3 (independent of our stripper).

| Check | Result |
|---|---|
| Bucket | `public=false`, `file_size_limit=10485760`, MIME = 4 types |
| 11 MB JPEG | 413 `too_large` |
| `image/gif` | 415 `unsupported_type`; GIF bytes sent as `image/jpeg` also 415 (magic bytes) |
| No sign-in | 401 |
| Direct member upload to `profile-photos` (around the function) | `new row violates row-level security policy` |
| GPS JPEG / PNG / WebP | GPS before 14.5994,120.9775, after none; still decodes 640x480; JPEG orientation 6 kept |
| Old public URL after the flip | 400 `Bucket not found` |
| `profiles.photos` | old public URL saved as a path; other member's path, missing object and external URL rejected (`Invalid profile photo`) |
| Signing | discoverable owner: viewer gets a link that loads (200 image/jpeg); photo not on the profile, blocked member, hidden profile without match: `Object not found`; hidden profile with mutual match: allowed; owner: allowed |
| Expiry | 3-second signed URL: 200, then after 6 s 400 `InvalidJWT` (`"exp" claim timestamp check failed`) |
| Delete own photo | works |
| Rate limit (SQL) | `{"allowed": true}`, then after 20 uploads in the hour `{"allowed": false, "limit": 20, "window_seconds": 3600, "retry_after_seconds": 3000}`; authenticated and anon cannot execute the helpers |
| 04 safety smoke test / 05 preflight | PASS / PASS on the rebuilt DB |
| Backfill (legacy GPS JPEG put in storage by service role) | dry run lists it, `--apply` strips it (GPS gone, orientation 6 kept), re-run reports all clean |
| URL rewrite SQL | 1 profile with URLs; external demo URL listed for review; 1 row updated; 0 URLs left; 0 missing objects; backup table holds the old array |

Not proven here:
- A real iPhone HEIC file (none on this machine). HEIC is covered by unit tests on a built HEIF structure
  (`supabase/functions/_shared/__tests__/photoMetadata.test.ts`). Needs one real HEIC run before Belle ships HEIC uploads.
- The app UI against the local stack (Discover/Likes/Messages rendering signed links). Covered by unit tests on
  the shared hydration path plus the HTTP signing checks above.
- Production. Nothing was applied there.

### Re-run it

```
supabase start              # local stack with edge runtime
npm i --no-save exifr@7.1.3
node docs/evidence/2026-11-photo-server-checks/make-fixtures.cjs
# API_URL, ANON_KEY, SERVICE_ROLE_KEY from `supabase status -o env` (local demo keys only)
node docs/evidence/2026-11-photo-server-checks/proof-local.mjs
```

The proof script refuses any URL that is not `http://127.0.0.1` or `http://localhost`.

## 5. How to test signed URLs (staging or local)

1. Sign in as member A, upload a photo in Edit Profile. In the network tab the upload is
   `POST /functions/v1/profile-photo-ingest` and the response is `{ "path": "<A id>/<ts>-<uuid>.jpg", ... }`.
2. `select photos from profiles where id = '<A id>'` shows the path, not a URL.
3. Images load from `.../storage/v1/object/sign/profile-photos/<path>?token=...`.
4. Open `.../storage/v1/object/public/profile-photos/<path>`: 400 `Bucket not found`.
5. As member B (A is verified + active), Discover shows A's photo. Block A as B: B's next load cannot sign A's photo.
6. Expiry: `supabase.storage.from('profile-photos').createSignedUrl(path, 5)` as B, open the link (200), wait 10 s, open it again: 400 `InvalidJWT`.

## 6. Rollout order and dual-read

Dual-read, not migrated: the app in this PR reads both stored paths and the old public URLs, and signs both.
Existing rows keep their public URLs until the one-time rewrite runs. New uploads store paths.

Order:
1. Ship the app change (this PR) to testers first (web deploy + an app update).
2. Deploy the function: `supabase functions deploy profile-photo-ingest`.
3. Apply the migration (bucket goes private).
4. With Duane's OK: run the backfill dry run, then `--apply`; run the URL rewrite SQL section 1, check, then section 2.

App builds older than this PR stop showing profile photos after step 3 (they load the public URL) and cannot upload
(direct uploads are closed). That is expected for a private bucket; testers need the update.

## 7. Rollback

- App/function problem only: redeploy the previous web build / app; the bucket can stay private.
- Full rollback (makes photos public again, only if needed):

```sql
BEGIN;
UPDATE storage.buckets SET public = TRUE, file_size_limit = NULL, allowed_mime_types = NULL WHERE id = 'profile-photos';
DROP POLICY IF EXISTS "Members can view visible profile photos" ON storage.objects;
CREATE POLICY "Authenticated users can view profile photos" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'profile-photos');
CREATE POLICY "Users can upload own profile photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));
CREATE POLICY "Users can replace own profile photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text))
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));
DROP TRIGGER IF EXISTS enforce_profile_photo_paths ON public.profiles;
COMMIT;
```

  Paths in `profiles.photos` keep working with the app in this PR after a rollback (it signs them). If the URL
  rewrite already ran, section 4 of the rewrite script restores the old URL arrays from
  `profile_photos_url_backup_20261121`. Stripped EXIF cannot be restored (by design).

## 8. Open questions for Duane

1. OK to apply on production in the order in section 6? Who ships the app update first (web + mobile)?
2. Keep the 1-hour signed URL expiry (same as chat images)?
3. Beta upload limit: 20 profile photos per member per hour (PR #30 uses the same number). OK?
4. OK to run the backfill and URL rewrite on production after the flip?
5. `chat-images` and `verification-docs` have no bucket size/MIME limits or EXIF strip on the server yet
   (Belle's #45 strips EXIF on the phone). Same server treatment as a follow-up ticket?
6. The OCR Edge Function cap is now 10 MB (was 6 MB) to match #45. Which OCR.space plan do we have, and what file
   size does it accept? If it's lower, larger ID photos fail at the provider with the generic OCR error.
