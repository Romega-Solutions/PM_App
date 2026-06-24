-- PinayMate verification reviewer and evidence-retention hardening.
--
-- Purpose:
-- - Require profile verification review decisions to come from an active
--   moderation reviewer registry entry.
-- - Prevent authenticated users from deleting verification evidence while the
--   submitted profile verification is still pending review.
-- - Keep these changes append-only so older launch migrations remain auditable.

BEGIN;

CREATE OR REPLACE FUNCTION public.review_profile_verification(
  profile_id UUID,
  status TEXT,
  reviewer_note TEXT DEFAULT '',
  reviewer_id UUID DEFAULT NULL,
  mismatch_reasons TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS TABLE (
  id UUID,
  verification_status TEXT,
  is_verified BOOLEAN,
  verified_at TIMESTAMPTZ,
  verification_reviewed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile_id UUID := profile_id;
  v_status TEXT := LOWER(BTRIM(COALESCE(status, '')));
  v_reviewer_note TEXT := LEFT(BTRIM(COALESCE(reviewer_note, '')), 1000);
  v_mismatch_reasons TEXT[] := COALESCE(mismatch_reasons, ARRAY[]::TEXT[]);
  v_selfie_path TEXT;
  v_document_path TEXT;
  v_current_status TEXT;
  v_verification_completed BOOLEAN;
  v_selfie_exists BOOLEAN;
  v_document_exists BOOLEAN;
BEGIN
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Profile ID is required' USING ERRCODE = '22023';
  END IF;

  IF reviewer_id IS NULL THEN
    RAISE EXCEPTION 'Reviewer ID is required' USING ERRCODE = '22023';
  END IF;

  IF v_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid profile verification status' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.moderation_reviewers mr
    WHERE mr.id = reviewer_id
      AND mr.active
  ) THEN
    RAISE EXCEPTION 'Reviewer is not authorized' USING ERRCODE = '22023';
  END IF;

  SELECT
    BTRIM(COALESCE(p.verification_selfie, '')),
    BTRIM(COALESCE(p.verification_document, '')),
    COALESCE(p.verification_status, ''),
    COALESCE(p.verification_completed, FALSE)
  INTO
    v_selfie_path,
    v_document_path,
    v_current_status,
    v_verification_completed
  FROM public.profiles p
  WHERE p.id = v_profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = '22023';
  END IF;

  IF NOT v_verification_completed OR v_current_status <> 'pending' THEN
    RAISE EXCEPTION 'Profile verification is not pending review'
      USING ERRCODE = '22023';
  END IF;

  IF v_selfie_path = ''
    OR v_document_path = ''
    OR split_part(v_selfie_path, '/', 1) <> v_profile_id::TEXT
    OR split_part(v_document_path, '/', 1) <> v_profile_id::TEXT
  THEN
    RAISE EXCEPTION 'Profile verification evidence paths are invalid'
      USING ERRCODE = '22023';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'verification-docs'
      AND name = v_selfie_path
  )
  INTO v_selfie_exists;

  SELECT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'verification-docs'
      AND name = v_document_path
  )
  INTO v_document_exists;

  IF NOT v_selfie_exists OR NOT v_document_exists THEN
    RAISE EXCEPTION 'Profile verification evidence objects are missing'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles p
  SET
    verification_status = v_status,
    is_verified = (v_status = 'approved'),
    verified_at = CASE
      WHEN v_status = 'approved' THEN NOW()
      ELSE NULL
    END,
    verification_reviewer_id = reviewer_id,
    verification_reviewer_note = v_reviewer_note,
    verification_reviewed_at = NOW(),
    verification_mismatch_reasons = CASE
      WHEN v_status = 'rejected' THEN v_mismatch_reasons
      ELSE ARRAY[]::TEXT[]
    END,
    updated_at = NOW()
  WHERE p.id = v_profile_id
  RETURNING
    p.id,
    p.verification_status,
    p.is_verified,
    p.verified_at,
    p.verification_reviewed_at
  INTO
    id,
    verification_status,
    is_verified,
    verified_at,
    verification_reviewed_at;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.review_profile_verification(UUID, TEXT, TEXT, UUID, TEXT[])
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_profile_verification(UUID, TEXT, TEXT, UUID, TEXT[])
  TO service_role;

CREATE OR REPLACE FUNCTION public.can_delete_verification_document(
  p_object_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_object_name TEXT := BTRIM(COALESCE(p_object_name, ''));
BEGIN
  IF v_user_id IS NULL OR v_object_name = '' THEN
    RETURN FALSE;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = v_user_id
      AND COALESCE(p.verification_completed, FALSE)
      AND COALESCE(p.verification_status, '') = 'pending'
      AND (
        BTRIM(COALESCE(p.verification_selfie, '')) = v_object_name
        OR BTRIM(COALESCE(p.verification_document, '')) = v_object_name
      )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.can_delete_verification_document(TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_delete_verification_document(TEXT)
  TO authenticated;

DROP POLICY IF EXISTS "Pending verification docs cannot be deleted" ON storage.objects;
CREATE POLICY "Pending verification docs cannot be deleted"
ON storage.objects
AS RESTRICTIVE
FOR DELETE
TO authenticated
USING (
  bucket_id <> 'verification-docs'
  OR public.can_delete_verification_document(name)
);

COMMIT;