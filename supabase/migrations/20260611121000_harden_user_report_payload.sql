-- Keep report payload hygiene enforced in the database, not only in the app.
-- This preserves private moderation context while preventing oversized or
-- unknown-source report payloads from being stored.

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

REVOKE ALL ON FUNCTION public.submit_user_report(UUID, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_user_report(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;
