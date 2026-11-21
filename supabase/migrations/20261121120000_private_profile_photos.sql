-- Ticket #46: server-side photo checks and private profile photos.
--
-- Before: `profile-photos` was a public bucket, any signed-in member could
-- upload straight into their folder with any size/type, and profiles.photos
-- held public URLs that anyone on the internet could open.
--
-- After:
-- 1. `profile-photos` is private, max 10 MB per object (10485760 bytes), and
--    only image/jpeg, image/png, image/webp and image/heic are accepted.
--    (HEIF photos are stored as image/heic by the ingest function.)
-- 2. Members can no longer INSERT or UPDATE objects in `profile-photos`. The
--    only writer is the `profile-photo-ingest` Edge Function (service role),
--    which checks size and real file type and strips EXIF/GPS first.
--    Members can still DELETE objects in their own folder.
-- 3. Members can SELECT (and therefore createSignedUrl) only:
--    - their own photos, or
--    - photos that are listed in another member's profiles.photos when that
--      member is visible to them the same way the app already shows them
--      (discoverable: active + verified + profile_visible, or a mutual match
--      for Messages), and neither member has blocked the other.
--    Photo links are short-lived signed URLs (the app uses 1 hour, same as
--    chat images).
-- 4. profiles.photos accepts storage paths (`<user id>/<ts>-<uuid>.<ext>`)
--    and, for the dual-read period, the old public URLs. Client writes are
--    normalised to paths, must stay in the member's own folder, at most 6,
--    and a newly added path must be an existing object (so it went through
--    the ingest function).
--
-- Existing public URLs are NOT rewritten here. The one-time rewrite is
-- supabase/manual-repair-scripts/20261121_rewrite_profile_photo_urls_to_paths.sql
-- and runs on production only with Duane's OK.
--
-- Rollback: see the PR / docs/evidence/2026-11-photo-server-checks/README.md.

BEGIN;

-- -------------------------------------------------------------------
-- Bucket: private + size and MIME limits
-- -------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-photos',
  'profile-photos',
  FALSE,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE
SET
  public = FALSE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

-- -------------------------------------------------------------------
-- Helpers
-- -------------------------------------------------------------------

-- Returns the storage path for a profiles.photos entry, or NULL.
-- Accepts a bare path, a Supabase public URL, or a signed URL
-- (.../storage/v1/object/(public|sign|authenticated)/profile-photos/<path>).
CREATE OR REPLACE FUNCTION public.profile_photo_storage_path(p_photo TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE
    WHEN candidate.path ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/[0-9]+-[a-z0-9-]+\.(jpg|png|webp|heic)$'
      THEN candidate.path
    ELSE NULL
  END
  FROM (
    SELECT split_part(
      split_part(
        CASE
          WHEN btrim(COALESCE(p_photo, '')) ~* '^https?://[^/]+/storage/v1/object/(public/|sign/|authenticated/)?profile-photos/'
            THEN regexp_replace(
              btrim(p_photo),
              '^https?://[^/]+/storage/v1/object/(public/|sign/|authenticated/)?profile-photos/',
              '',
              'i'
            )
          ELSE btrim(COALESCE(p_photo, ''))
        END,
        '?',
        1
      ),
      '#',
      1
    ) AS path
  ) AS candidate;
$$;

REVOKE ALL ON FUNCTION public.profile_photo_storage_path(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.profile_photo_storage_path(TEXT) TO authenticated, service_role;

COMMENT ON FUNCTION public.profile_photo_storage_path(TEXT) IS
  'Ticket #46: normalises a profiles.photos entry (path, public URL or signed URL) to a profile-photos storage path, or NULL.';

-- Storage SELECT rule for profile photos. Runs as the definer so it can read
-- profiles/likes/blocks, but always decides for auth.uid().
CREATE OR REPLACE FUNCTION public.can_view_profile_photo(p_object_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_viewer UUID := auth.uid();
  v_owner UUID;
BEGIN
  IF v_viewer IS NULL OR p_object_name IS NULL THEN
    RETURN FALSE;
  END IF;

  IF split_part(p_object_name, '/', 1) !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' THEN
    RETURN FALSE;
  END IF;

  v_owner := split_part(p_object_name, '/', 1)::UUID;

  IF v_owner = v_viewer THEN
    RETURN TRUE;
  END IF;

  -- Only photos the owner currently shows on their profile.
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    CROSS JOIN LATERAL unnest(COALESCE(p.photos, ARRAY[]::TEXT[])) AS photo(value)
    WHERE p.id = v_owner
      AND public.profile_photo_storage_path(photo.value) = p_object_name
  ) THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_blocks b
    WHERE (b.blocker_id = v_viewer AND b.blocked_user_id = v_owner)
       OR (b.blocker_id = v_owner AND b.blocked_user_id = v_viewer)
  ) THEN
    RETURN FALSE;
  END IF;

  -- Discover / Likes / Matches read model (same rule as discoverable_profiles).
  IF EXISTS (
    SELECT 1
    FROM public.profiles p
    LEFT JOIN public.user_privacy_settings s
      ON s.user_id = p.id
    WHERE p.id = v_owner
      AND p.is_active = TRUE
      AND p.is_verified = TRUE
      AND COALESCE(s.profile_visible, TRUE) = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  -- Messages read model (get_user_conversations): mutual match.
  RETURN EXISTS (
    SELECT 1
    FROM public.likes l1
    JOIN public.likes l2
      ON l2.from_user_id = v_owner
     AND l2.to_user_id = v_viewer
     AND l2.is_match = TRUE
    WHERE l1.from_user_id = v_viewer
      AND l1.to_user_id = v_owner
      AND l1.is_match = TRUE
  );
END;
$$;

REVOKE ALL ON FUNCTION public.can_view_profile_photo(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_view_profile_photo(TEXT) TO authenticated;

COMMENT ON FUNCTION public.can_view_profile_photo(TEXT) IS
  'Ticket #46: storage SELECT rule for profile-photos. Own photos, or listed photos of a discoverable or mutually matched member, never across a block.';

-- Per-member upload limit for the ingest function (service role only).
-- Uses the storage_upload:profile-photos rows from public.rate_limit_rules
-- when that table exists (PR #30), otherwise 20 uploads per hour.
CREATE OR REPLACE FUNCTION public.claim_profile_photo_ingest(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rule RECORD;
  v_count INTEGER;
  v_oldest TIMESTAMPTZ;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN jsonb_build_object('allowed', FALSE, 'retry_after_seconds', 60);
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('profile_photo_ingest:' || p_user_id::TEXT, 0));

  FOR v_rule IN EXECUTE
    CASE
      WHEN to_regclass('public.rate_limit_rules') IS NOT NULL THEN
        'SELECT window_seconds, max_count FROM public.rate_limit_rules '
        || 'WHERE action = ''storage_upload:profile-photos'' AND enabled ORDER BY window_seconds'
      ELSE
        'SELECT 3600 AS window_seconds, 20 AS max_count'
    END
  LOOP
    SELECT COUNT(*)::INTEGER, MIN(o.created_at)
    INTO v_count, v_oldest
    FROM storage.objects o
    WHERE o.bucket_id = 'profile-photos'
      AND (storage.foldername(o.name))[1] = p_user_id::TEXT
      AND o.created_at >= NOW() - make_interval(secs => v_rule.window_seconds);

    IF v_count >= v_rule.max_count THEN
      RETURN jsonb_build_object(
        'allowed', FALSE,
        'limit', v_rule.max_count,
        'window_seconds', v_rule.window_seconds,
        'retry_after_seconds', GREATEST(
          1,
          CEIL(EXTRACT(EPOCH FROM (COALESCE(v_oldest, NOW()) + make_interval(secs => v_rule.window_seconds) - NOW())))::INTEGER
        )
      );
    END IF;
  END LOOP;

  RETURN jsonb_build_object('allowed', TRUE);
END;
$$;

REVOKE ALL ON FUNCTION public.claim_profile_photo_ingest(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_profile_photo_ingest(UUID) TO service_role;

COMMENT ON FUNCTION public.claim_profile_photo_ingest(UUID) IS
  'Ticket #46: upload rate limit for the profile-photo-ingest Edge Function. Service role only.';

-- profiles.photos write rule (client writes only; service role / SQL editor
-- writes, e.g. the one-time URL rewrite, are not checked).
CREATE OR REPLACE FUNCTION public.enforce_profile_photo_paths()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_photo TEXT;
  v_path TEXT;
  v_paths TEXT[] := ARRAY[]::TEXT[];
  v_old_paths TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF auth.uid() IS NULL OR NEW.photos IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.photos IS NOT NULL THEN
    SELECT COALESCE(array_agg(public.profile_photo_storage_path(old_photo.value)), ARRAY[]::TEXT[])
    INTO v_old_paths
    FROM unnest(OLD.photos) AS old_photo(value);
  END IF;

  FOREACH v_photo IN ARRAY NEW.photos
  LOOP
    IF v_photo IS NULL OR btrim(v_photo) = '' THEN
      CONTINUE;
    END IF;

    v_path := public.profile_photo_storage_path(v_photo);

    IF v_path IS NULL OR split_part(v_path, '/', 1) <> NEW.id::TEXT THEN
      RAISE EXCEPTION 'Invalid profile photo'
        USING ERRCODE = '22023',
              DETAIL = 'Profile photos must be storage paths in the member''s own profile-photos folder.';
    END IF;

    IF NOT (v_path = ANY (v_old_paths))
      AND NOT EXISTS (
        SELECT 1
        FROM storage.objects o
        WHERE o.bucket_id = 'profile-photos'
          AND o.name = v_path
      )
    THEN
      RAISE EXCEPTION 'Invalid profile photo'
        USING ERRCODE = '22023',
              DETAIL = 'Profile photo object does not exist. Upload through profile-photo-ingest first.';
    END IF;

    IF NOT (v_path = ANY (v_paths)) THEN
      v_paths := array_append(v_paths, v_path);
    END IF;
  END LOOP;

  IF cardinality(v_paths) > 6 THEN
    RAISE EXCEPTION 'Too many profile photos'
      USING ERRCODE = '22023',
            DETAIL = 'A profile can have at most 6 photos.';
  END IF;

  NEW.photos := v_paths;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_profile_photo_paths() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_profile_photo_paths ON public.profiles;
CREATE TRIGGER enforce_profile_photo_paths
  BEFORE INSERT OR UPDATE OF photos ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_profile_photo_paths();

COMMENT ON FUNCTION public.enforce_profile_photo_paths() IS
  'Ticket #46: client writes to profiles.photos are stored as own-folder storage paths (max 6); new paths must exist in profile-photos.';

-- -------------------------------------------------------------------
-- Storage policies
-- -------------------------------------------------------------------

-- Direct member uploads/overwrites are closed; profile-photo-ingest is the
-- only writer. Known names from earlier migrations:
DROP POLICY IF EXISTS "Users can upload own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can replace own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Members can view visible profile photos" ON storage.objects;

-- Any other PERMISSIVE policy that names this bucket (drift between the
-- repo and production, e.g. policies from 04_production_core_hardening.sql
-- or ones added in the dashboard) would widen access, so drop those too.
-- RESTRICTIVE policies (such as the PR #30 upload rate limit) only narrow
-- access and are kept.
DO $$
DECLARE
  v_policy RECORD;
BEGIN
  FOR v_policy IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND permissive = 'PERMISSIVE'
      AND (
        COALESCE(qual, '') LIKE '%profile-photos%'
        OR COALESCE(with_check, '') LIKE '%profile-photos%'
      )
  LOOP
    RAISE NOTICE 'Dropping storage policy % (profile-photos)', v_policy.policyname;
    EXECUTE format('DROP POLICY %I ON storage.objects', v_policy.policyname);
  END LOOP;
END;
$$;
CREATE POLICY "Members can view visible profile photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND public.can_view_profile_photo(name)
  );

-- Delete own photos stays as before (recreated after the sweep above).
CREATE POLICY "Users can delete own profile photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

COMMIT;
