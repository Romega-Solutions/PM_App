-- Repair moderation reviewer upsert conflict target.
--
-- The RETURNS TABLE output column named id shadows unqualified SQL identifiers
-- inside PL/pgSQL. Use the table primary-key constraint as the conflict target.

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

COMMIT;
