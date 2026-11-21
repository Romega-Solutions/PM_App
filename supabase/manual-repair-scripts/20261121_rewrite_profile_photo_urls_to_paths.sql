-- ===================================================================
-- Ticket #46: one-time rewrite of profiles.photos public URLs to paths
-- ===================================================================
-- DO NOT run on production without Duane's OK.
-- Run in this order, in the Supabase SQL editor (service role), AFTER
-- migration 20261121120000_private_profile_photos.sql is applied.
--
-- The app (from the ticket #46 PR on) reads both forms (dual-read), so this
-- rewrite is cleanup, not a hard requirement for the bucket flip. It makes the
-- data match the new contract: profiles.photos holds storage paths only.
--
-- Rollback: section 4 restores every changed row from the backup table.
-- ===================================================================


-- -------------------------------------------------------------------
-- SECTION 1: PREVIEW (read-only). Paste the counts in the PR / ticket.
-- -------------------------------------------------------------------
SELECT
  COUNT(*) AS profiles_with_photos,
  COUNT(*) FILTER (
    WHERE EXISTS (
      SELECT 1 FROM unnest(p.photos) AS photo(value)
      WHERE photo.value ~* '^https?://[^/]+/storage/v1/object/'
    )
  ) AS profiles_with_url_entries,
  SUM((
    SELECT COUNT(*) FROM unnest(p.photos) AS photo(value)
    WHERE public.profile_photo_storage_path(photo.value) IS NULL
  )) AS entries_that_are_not_profile_photo_paths
FROM public.profiles p
WHERE cardinality(COALESCE(p.photos, ARRAY[]::TEXT[])) > 0;

-- Entries that will be DROPPED (not a profile-photos path or URL, or another
-- member's folder). Review these by hand before section 2.
SELECT p.id, photo.value
FROM public.profiles p
CROSS JOIN LATERAL unnest(p.photos) AS photo(value)
WHERE public.profile_photo_storage_path(photo.value) IS NULL
   OR split_part(public.profile_photo_storage_path(photo.value), '/', 1) <> p.id::TEXT;


-- -------------------------------------------------------------------
-- SECTION 2: BACKUP + REWRITE (one transaction)
-- -------------------------------------------------------------------
BEGIN;

CREATE TABLE IF NOT EXISTS public.profile_photos_url_backup_20261121 (
  profile_id UUID PRIMARY KEY,
  photos TEXT[],
  backed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.profile_photos_url_backup_20261121 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profile_photos_url_backup_20261121 FROM PUBLIC, anon, authenticated;

INSERT INTO public.profile_photos_url_backup_20261121 (profile_id, photos)
SELECT p.id, p.photos
FROM public.profiles p
WHERE cardinality(COALESCE(p.photos, ARRAY[]::TEXT[])) > 0
ON CONFLICT (profile_id) DO NOTHING;

WITH rewritten AS (
  SELECT
    p.id,
    COALESCE(
      (
        SELECT array_agg(path ORDER BY first_position)
        FROM (
          SELECT
            public.profile_photo_storage_path(photo.value) AS path,
            MIN(photo.position) AS first_position
          FROM unnest(p.photos) WITH ORDINALITY AS photo(value, position)
          WHERE public.profile_photo_storage_path(photo.value) IS NOT NULL
            AND split_part(public.profile_photo_storage_path(photo.value), '/', 1) = p.id::TEXT
          GROUP BY 1
        ) AS own_paths
      ),
      ARRAY[]::TEXT[]
    ) AS new_photos
  FROM public.profiles p
  WHERE cardinality(COALESCE(p.photos, ARRAY[]::TEXT[])) > 0
)
UPDATE public.profiles p
SET
  photos = rewritten.new_photos[1:6],
  photos_completed = cardinality(rewritten.new_photos) > 0
FROM rewritten
WHERE rewritten.id = p.id
  AND p.photos IS DISTINCT FROM rewritten.new_photos[1:6];

-- Expect 0: no URL left.
SELECT COUNT(*) AS remaining_url_entries
FROM public.profiles p
CROSS JOIN LATERAL unnest(p.photos) AS photo(value)
WHERE photo.value ~* '^https?://';

COMMIT;  -- or ROLLBACK; if the counts look wrong


-- -------------------------------------------------------------------
-- SECTION 3: CHECK objects exist for every stored path (read-only)
-- -------------------------------------------------------------------
SELECT p.id, photo.value AS missing_path
FROM public.profiles p
CROSS JOIN LATERAL unnest(p.photos) AS photo(value)
LEFT JOIN storage.objects o
  ON o.bucket_id = 'profile-photos'
 AND o.name = photo.value
WHERE o.id IS NULL;


-- -------------------------------------------------------------------
-- SECTION 4: ROLLBACK (only if needed)
-- -------------------------------------------------------------------
-- UPDATE public.profiles p
-- SET photos = b.photos,
--     photos_completed = cardinality(COALESCE(b.photos, ARRAY[]::TEXT[])) > 0
-- FROM public.profile_photos_url_backup_20261121 b
-- WHERE b.profile_id = p.id;
--
-- After the PR is accepted and the app is stable, drop the backup:
-- DROP TABLE public.profile_photos_url_backup_20261121;
