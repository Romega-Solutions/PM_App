-- PinayMate report abuse and discovery read-model hardening.
--
-- Purpose:
-- - Keep repeated report submissions from filling the moderation queue with
--   duplicate open rows.
-- - Preserve the privileged discovery view as a narrow profile-card read model
--   and make sensitive-column exposure a release-gate failure.

BEGIN;

CREATE INDEX IF NOT EXISTS idx_user_reports_open_report_dedupe
  ON public.user_reports (
    reporter_id,
    reported_user_id,
    source,
    COALESCE(conversation_id, '00000000-0000-0000-0000-000000000000'::UUID),
    status,
    created_at DESC
  )
  WHERE status IN ('pending', 'reviewing');

COMMENT ON VIEW public.discoverable_profiles IS
  'Privileged app-facing discovery read model. Exposes only profile-card fields; release gates forbid private verification evidence, reviewer metadata, contact data, auth data, privacy rows, and moderation fields.';

CREATE OR REPLACE FUNCTION public.submit_user_report(
  p_reported_user_id UUID,
  p_reason TEXT,
  p_details TEXT DEFAULT '',
  p_conversation_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'app'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_reason TEXT := LEFT(BTRIM(COALESCE(p_reason, '')), 120);
  v_details TEXT := LEFT(BTRIM(COALESCE(p_details, '')), 800);
  v_source TEXT := LOWER(BTRIM(COALESCE(p_source, 'app')));
  v_report_id UUID;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_reported_user_id IS NULL OR p_reported_user_id = v_current_user THEN
    RAISE EXCEPTION 'Choose a different member to report' USING ERRCODE = '22023';
  END IF;

  IF v_reason = '' THEN
    RAISE EXCEPTION 'Report reason is required' USING ERRCODE = '22023';
  END IF;

  IF v_source NOT IN ('chat', 'profile', 'likes', 'discovery', 'app') THEN
    v_source := 'app';
  END IF;

  IF p_conversation_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = p_conversation_id
        AND (
          (
            c.participant_1_id = v_current_user
            AND c.participant_2_id = p_reported_user_id
          )
          OR (
            c.participant_1_id = p_reported_user_id
            AND c.participant_2_id = v_current_user
          )
        )
    )
  THEN
    RAISE EXCEPTION 'Report conversation does not match this member' USING ERRCODE = '42501';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtext(
      v_current_user::TEXT
      || ':'
      || p_reported_user_id::TEXT
      || ':'
      || COALESCE(p_conversation_id::TEXT, 'none')
      || ':'
      || v_source
    )
  );

  SELECT r.id
  INTO v_report_id
  FROM public.user_reports r
  WHERE r.reporter_id = v_current_user
    AND r.reported_user_id = p_reported_user_id
    AND r.source = v_source
    AND COALESCE(r.conversation_id, '00000000-0000-0000-0000-000000000000'::UUID)
      = COALESCE(p_conversation_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND r.status IN ('pending', 'reviewing')
  ORDER BY r.created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_report_id IS NOT NULL THEN
    UPDATE public.user_reports
    SET
      reason = v_reason,
      details = CASE
        WHEN v_details <> '' THEN v_details
        ELSE details
      END,
      updated_at = NOW()
    WHERE id = v_report_id;

    RETURN;
  END IF;

  SELECT r.id
  INTO v_report_id
  FROM public.user_reports r
  WHERE r.reporter_id = v_current_user
    AND r.reported_user_id = p_reported_user_id
    AND r.source = v_source
    AND COALESCE(r.conversation_id, '00000000-0000-0000-0000-000000000000'::UUID)
      = COALESCE(p_conversation_id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND r.created_at >= NOW() - INTERVAL '10 minutes'
  ORDER BY r.created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF v_report_id IS NOT NULL THEN
    UPDATE public.user_reports
    SET
      reason = v_reason,
      details = CASE
        WHEN v_details <> '' THEN v_details
        ELSE details
      END,
      updated_at = NOW()
    WHERE id = v_report_id;

    RETURN;
  END IF;

  INSERT INTO public.user_reports (
    reporter_id,
    reported_user_id,
    conversation_id,
    reason,
    details,
    source
  )
  VALUES (
    v_current_user,
    p_reported_user_id,
    p_conversation_id,
    v_reason,
    v_details,
    v_source
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_user_report(UUID, TEXT, TEXT, UUID, TEXT)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_user_report(UUID, TEXT, TEXT, UUID, TEXT)
  TO authenticated;

COMMIT;
