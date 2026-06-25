-- PinayMate report reviewer and waitlist burst-control hardening.
--
-- Purpose:
-- - Require reviewer identity for service-role report review decisions.
-- - Require reviewer identity to be registered as an active moderation reviewer.
-- - Route reviewer registry changes through service-role RPCs with actor/reason.
-- - Prevent finalized report review decisions from being overwritten.
-- - Add a broader waitlist source/platform burst throttle so unique-email bot
--   storms cannot create unlimited rows through the public RPC.
-- - Keep the public waitlist response generic so callers cannot infer whether
--   an email address was already waitlisted, blocked, or unsubscribed.

BEGIN;

CREATE TABLE IF NOT EXISTS public.moderation_reviewers (
  id UUID PRIMARY KEY,
  display_name TEXT NOT NULL DEFAULT '',
  reviewer_role TEXT NOT NULL DEFAULT 'safety',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT moderation_reviewers_role_check
    CHECK (reviewer_role IN ('safety', 'support', 'admin'))
);

COMMENT ON TABLE public.moderation_reviewers IS
  'Service-role managed registry of active safety/support reviewers allowed to make moderation decisions.';

ALTER TABLE public.moderation_reviewers ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.moderation_reviewers
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.moderation_reviewers
  TO service_role;

CREATE TABLE IF NOT EXISTS public.moderation_reviewer_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL,
  action TEXT NOT NULL,
  changed_by_role TEXT NOT NULL DEFAULT CURRENT_USER,
  changed_by_subject UUID,
  change_reason TEXT NOT NULL DEFAULT '',
  old_record JSONB,
  new_record JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT moderation_reviewer_audit_action_check
    CHECK (action IN ('insert', 'update', 'delete'))
);

COMMENT ON TABLE public.moderation_reviewer_audit_log IS
  'Append-only audit log for service-role reviewer registry changes.';

ALTER TABLE public.moderation_reviewer_audit_log ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.moderation_reviewer_audit_log FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.moderation_reviewer_audit_log
  TO service_role;

CREATE OR REPLACE FUNCTION public.log_moderation_reviewer_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_subject TEXT := NULLIF(current_setting('pinaymate.audit.actor_id', TRUE), '');
  v_reason TEXT := LEFT(
    BTRIM(COALESCE(current_setting('pinaymate.audit.reason', TRUE), '')),
    500
  );
  v_subject_uuid UUID;
BEGIN
  BEGIN
    v_subject_uuid := v_subject::UUID;
  EXCEPTION
    WHEN invalid_text_representation THEN
      v_subject_uuid := NULL;
  END;

  INSERT INTO public.moderation_reviewer_audit_log (
    reviewer_id,
    action,
    changed_by_role,
    changed_by_subject,
    change_reason,
    old_record,
    new_record
  )
  VALUES (
    COALESCE(NEW.id, OLD.id),
    LOWER(TG_OP),
    CURRENT_USER,
    v_subject_uuid,
    COALESCE(NULLIF(v_reason, ''), 'not provided'),
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.log_moderation_reviewer_change()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.log_moderation_reviewer_change()
  TO service_role;

DROP TRIGGER IF EXISTS trg_log_moderation_reviewer_change
  ON public.moderation_reviewers;
CREATE TRIGGER trg_log_moderation_reviewer_change
AFTER INSERT OR UPDATE OR DELETE ON public.moderation_reviewers
FOR EACH ROW
EXECUTE FUNCTION public.log_moderation_reviewer_change();

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

CREATE INDEX IF NOT EXISTS idx_waitlist_signups_recent_source_platform
  ON public.waitlist_signups(source, platform, created_at DESC);

CREATE OR REPLACE FUNCTION public.submit_waitlist_signup(
  p_email TEXT,
  p_platform TEXT DEFAULT 'unknown',
  p_source TEXT DEFAULT 'pm_web'
)
RETURNS TABLE (
  id UUID,
  email_normalized TEXT,
  platform TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email TEXT := LOWER(BTRIM(COALESCE(p_email, '')));
  v_platform TEXT := LOWER(BTRIM(COALESCE(p_platform, 'unknown')));
  v_source TEXT := LOWER(BTRIM(COALESCE(p_source, 'pm_web')));
  v_existing public.waitlist_signups%ROWTYPE;
  v_waitlist_row public.waitlist_signups%ROWTYPE;
  v_recent_source_count INTEGER;
BEGIN
  IF LENGTH(v_email) < 6
    OR LENGTH(v_email) > 254
    OR v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  THEN
    RAISE EXCEPTION 'A valid email address is required' USING ERRCODE = '22023';
  END IF;

  IF v_platform NOT IN ('ios', 'android', 'web', 'unknown') THEN
    v_platform := 'unknown';
  END IF;

  IF v_source NOT IN ('pm_web', 'pm_app') THEN
    v_source := 'pm_web';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtext('waitlist-source:' || v_source || ':' || v_platform)
  );
  PERFORM pg_advisory_xact_lock(
    hashtext('waitlist-email:' || v_email || ':' || v_platform)
  );

  SELECT *
  INTO v_existing
  FROM public.waitlist_signups
  WHERE public.waitlist_signups.email_normalized = v_email
    AND public.waitlist_signups.platform = v_platform
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing.status IN ('unsubscribed', 'blocked')
      OR v_existing.last_submitted_at >= NOW() - INTERVAL '10 minutes'
    THEN
      id := NULL;
      email_normalized := v_email;
      platform := v_platform;
      status := 'accepted';
      created_at := NOW();
      RETURN NEXT;
      RETURN;
    END IF;

    UPDATE public.waitlist_signups
    SET
      source = v_source,
      status = 'new',
      submission_count = CASE
        WHEN submission_count >= 2147483647 THEN 2147483647
        ELSE submission_count + 1
      END,
      last_submitted_at = NOW(),
      updated_at = NOW()
    WHERE public.waitlist_signups.id = v_existing.id
    RETURNING *
    INTO v_waitlist_row;
  ELSE
    SELECT COUNT(*)
    INTO v_recent_source_count
    FROM public.waitlist_signups
    WHERE public.waitlist_signups.source = v_source
      AND public.waitlist_signups.platform = v_platform
      AND public.waitlist_signups.created_at >= NOW() - INTERVAL '1 minute';

    IF v_recent_source_count >= 30 THEN
      RAISE EXCEPTION 'Waitlist is receiving too many requests; try again later'
        USING ERRCODE = '22023';
    END IF;

    INSERT INTO public.waitlist_signups (
      email,
      platform,
      source,
      status,
      submission_count,
      last_submitted_at
    )
    VALUES (
      v_email,
      v_platform,
      v_source,
      'new',
      1,
      NOW()
    )
    RETURNING *
    INTO v_waitlist_row;
  END IF;

  id := NULL;
  email_normalized := v_email;
  platform := v_platform;
  status := 'accepted';
  created_at := NOW();

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_waitlist_signup(TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_waitlist_signup(TEXT, TEXT, TEXT)
  TO anon, authenticated;

COMMIT;
