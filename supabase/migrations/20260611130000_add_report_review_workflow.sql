-- PinayMate report review workflow.
--
-- Purpose:
-- - Give safety/support operations a controlled backend path to review and
--   resolve user reports.
-- - Keep moderation decisions out of direct app-client table writes.
-- - Preserve minimal reviewer/action metadata for launch support evidence.

BEGIN;

ALTER TABLE public.user_reports
  ADD COLUMN IF NOT EXISTS severity TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS action_taken TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS reviewer_id UUID,
  ADD COLUMN IF NOT EXISTS reviewer_note TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

UPDATE public.user_reports
SET
  severity = COALESCE(NULLIF(BTRIM(severity), ''), 'medium'),
  action_taken = COALESCE(NULLIF(BTRIM(action_taken), ''), 'none'),
  reviewer_note = COALESCE(reviewer_note, '');

ALTER TABLE public.user_reports
  ALTER COLUMN severity SET NOT NULL,
  ALTER COLUMN action_taken SET NOT NULL,
  ALTER COLUMN reviewer_note SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_reports_severity_check'
  ) THEN
    ALTER TABLE public.user_reports
      ADD CONSTRAINT user_reports_severity_check
      CHECK (severity IN ('critical', 'high', 'medium', 'low'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_reports_action_taken_check'
  ) THEN
    ALTER TABLE public.user_reports
      ADD CONSTRAINT user_reports_action_taken_check
      CHECK (
        action_taken IN (
          'none',
          'warned',
          'restricted',
          'blocked',
          'unmatched',
          'escalated',
          'suspended',
          'dismissed'
        )
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_user_reports_review_queue
  ON public.user_reports(status, severity, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_reports_reviewer
  ON public.user_reports(reviewer_id, reviewed_at DESC)
  WHERE reviewer_id IS NOT NULL;

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
BEGIN
  IF p_report_id IS NULL THEN
    RAISE EXCEPTION 'Report ID is required' USING ERRCODE = '22023';
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
  RETURNING
    r.id,
    r.status,
    r.severity,
    r.action_taken,
    r.reviewed_at
  INTO
    id,
    status,
    severity,
    action_taken,
    reviewed_at;

  IF id IS NULL THEN
    RAISE EXCEPTION 'Report not found' USING ERRCODE = '22023';
  END IF;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.review_user_report(UUID, TEXT, TEXT, TEXT, TEXT, UUID)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.review_user_report(UUID, TEXT, TEXT, TEXT, TEXT, UUID)
  TO service_role;

COMMIT;
