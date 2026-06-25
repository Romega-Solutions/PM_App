-- Repair moderation reviewer RPC return handling.
--
-- The original functions returned TABLE columns named like real table columns.
-- PL/pgSQL treats those output columns as variables, which made RETURNING ... INTO
-- ambiguous on live smoke tests. Store results in row variables and return them
-- explicitly.

BEGIN;

CREATE OR REPLACE FUNCTION public.upsert_moderation_reviewer(
  p_reviewer_id UUID,
  p_display_name TEXT,
  p_reviewer_role TEXT DEFAULT 'safety',
  p_active BOOLEAN DEFAULT TRUE,
  p_operator_id UUID DEFAULT NULL,
  p_change_reason TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  reviewer_role TEXT,
  active BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_display_name TEXT := LEFT(BTRIM(COALESCE(p_display_name, '')), 120);
  v_reviewer_role TEXT := LOWER(BTRIM(COALESCE(p_reviewer_role, 'safety')));
  v_change_reason TEXT := LEFT(BTRIM(COALESCE(p_change_reason, '')), 500);
  v_reviewer public.moderation_reviewers%ROWTYPE;
BEGIN
  IF p_reviewer_id IS NULL THEN
    RAISE EXCEPTION 'Reviewer ID is required' USING ERRCODE = '22023';
  END IF;

  IF p_operator_id IS NULL THEN
    RAISE EXCEPTION 'Operator ID is required' USING ERRCODE = '22023';
  END IF;

  IF LENGTH(v_display_name) < 2 THEN
    RAISE EXCEPTION 'Reviewer display name is required' USING ERRCODE = '22023';
  END IF;

  IF v_reviewer_role NOT IN ('safety', 'support', 'admin') THEN
    RAISE EXCEPTION 'Invalid reviewer role' USING ERRCODE = '22023';
  END IF;

  IF LENGTH(v_change_reason) < 5 THEN
    RAISE EXCEPTION 'Reviewer change reason is required' USING ERRCODE = '22023';
  END IF;

  PERFORM set_config('pinaymate.audit.actor_id', p_operator_id::TEXT, TRUE);
  PERFORM set_config('pinaymate.audit.reason', v_change_reason, TRUE);

  INSERT INTO public.moderation_reviewers (
    id,
    display_name,
    reviewer_role,
    active
  )
  VALUES (
    p_reviewer_id,
    v_display_name,
    v_reviewer_role,
    COALESCE(p_active, TRUE)
  )
  ON CONFLICT ON CONSTRAINT moderation_reviewers_pkey DO UPDATE
  SET
    display_name = EXCLUDED.display_name,
    reviewer_role = EXCLUDED.reviewer_role,
    active = EXCLUDED.active,
    updated_at = NOW()
  RETURNING *
  INTO v_reviewer;

  RETURN QUERY
  SELECT
    v_reviewer.id,
    v_reviewer.display_name,
    v_reviewer.reviewer_role,
    v_reviewer.active,
    v_reviewer.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_moderation_reviewer(UUID, TEXT, TEXT, BOOLEAN, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_moderation_reviewer(UUID, TEXT, TEXT, BOOLEAN, UUID, TEXT)
  TO service_role;

CREATE OR REPLACE FUNCTION public.deactivate_moderation_reviewer(
  p_reviewer_id UUID,
  p_operator_id UUID,
  p_change_reason TEXT DEFAULT ''
)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  reviewer_role TEXT,
  active BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_change_reason TEXT := LEFT(BTRIM(COALESCE(p_change_reason, '')), 500);
  v_reviewer public.moderation_reviewers%ROWTYPE;
BEGIN
  IF p_reviewer_id IS NULL THEN
    RAISE EXCEPTION 'Reviewer ID is required' USING ERRCODE = '22023';
  END IF;

  IF p_operator_id IS NULL THEN
    RAISE EXCEPTION 'Operator ID is required' USING ERRCODE = '22023';
  END IF;

  IF LENGTH(v_change_reason) < 5 THEN
    RAISE EXCEPTION 'Reviewer change reason is required' USING ERRCODE = '22023';
  END IF;

  PERFORM set_config('pinaymate.audit.actor_id', p_operator_id::TEXT, TRUE);
  PERFORM set_config('pinaymate.audit.reason', v_change_reason, TRUE);

  UPDATE public.moderation_reviewers mr
  SET
    active = FALSE,
    updated_at = NOW()
  WHERE mr.id = p_reviewer_id
  RETURNING mr.*
  INTO v_reviewer;

  IF v_reviewer.id IS NULL THEN
    RAISE EXCEPTION 'Reviewer not found' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    v_reviewer.id,
    v_reviewer.display_name,
    v_reviewer.reviewer_role,
    v_reviewer.active,
    v_reviewer.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.deactivate_moderation_reviewer(UUID, UUID, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_moderation_reviewer(UUID, UUID, TEXT)
  TO service_role;

CREATE OR REPLACE FUNCTION public.review_user_report(
  p_report_id UUID,
  p_status TEXT,
  p_severity TEXT DEFAULT 'medium',
  p_action_taken TEXT DEFAULT 'none',
  p_reviewer_note TEXT DEFAULT '',
  p_reviewer_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  status TEXT,
  severity TEXT,
  action_taken TEXT,
  reviewed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status TEXT := LOWER(BTRIM(COALESCE(p_status, '')));
  v_severity TEXT := LOWER(BTRIM(COALESCE(p_severity, 'medium')));
  v_action_taken TEXT := LOWER(BTRIM(COALESCE(p_action_taken, 'none')));
  v_reviewer_note TEXT := LEFT(BTRIM(COALESCE(p_reviewer_note, '')), 1000);
  v_existing_report public.user_reports%ROWTYPE;
  v_reviewed_report public.user_reports%ROWTYPE;
BEGIN
  IF p_report_id IS NULL THEN
    RAISE EXCEPTION 'Report ID is required' USING ERRCODE = '22023';
  END IF;

  IF p_reviewer_id IS NULL THEN
    RAISE EXCEPTION 'Reviewer ID is required' USING ERRCODE = '22023';
  END IF;

  IF v_status NOT IN ('reviewing', 'resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Invalid report review status' USING ERRCODE = '22023';
  END IF;

  IF v_severity NOT IN ('critical', 'high', 'medium', 'low') THEN
    RAISE EXCEPTION 'Invalid report severity' USING ERRCODE = '22023';
  END IF;

  IF v_action_taken NOT IN (
    'none',
    'warned',
    'restricted',
    'blocked',
    'unmatched',
    'escalated',
    'suspended',
    'dismissed'
  ) THEN
    RAISE EXCEPTION 'Invalid report action' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.moderation_reviewers mr
    WHERE mr.id = p_reviewer_id
      AND mr.active
  ) THEN
    RAISE EXCEPTION 'Reviewer is not authorized' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_existing_report
  FROM public.user_reports r
  WHERE r.id = p_report_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Report not found' USING ERRCODE = '22023';
  END IF;

  IF v_existing_report.status IN ('resolved', 'dismissed') THEN
    RAISE EXCEPTION 'Report already has final review decision'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.user_reports r
  SET
    status = v_status,
    severity = v_severity,
    action_taken = v_action_taken,
    reviewer_note = v_reviewer_note,
    reviewer_id = p_reviewer_id,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE r.id = p_report_id
  RETURNING r.*
  INTO v_reviewed_report;

  IF v_reviewed_report.id IS NULL THEN
    RAISE EXCEPTION 'Report not found' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    v_reviewed_report.id,
    v_reviewed_report.status,
    v_reviewed_report.severity,
    v_reviewed_report.action_taken,
    v_reviewed_report.reviewed_at;
END;
$$;

REVOKE ALL ON FUNCTION public.review_user_report(UUID, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_user_report(UUID, TEXT, TEXT, TEXT, TEXT, UUID)
  TO service_role;

COMMIT;
