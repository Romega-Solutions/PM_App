-- PinayMate moderation audit least-privilege hardening.
--
-- Purpose:
-- - Keep reviewer registry changes routed through the service-role RPCs.
-- - Prevent direct service-role writes to the reviewer audit log, so audit rows
--   are produced only by the registry trigger with operator/reason context.
-- - Force RLS on launch-owned backend control tables as defense in depth.

BEGIN;

ALTER TABLE public.moderation_reviewers
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reviewers
  FORCE ROW LEVEL SECURITY;

ALTER TABLE public.moderation_reviewer_audit_log
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reviewer_audit_log
  FORCE ROW LEVEL SECURITY;

ALTER TABLE public.waitlist_signups
  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_signups
  FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.moderation_reviewer_audit_log
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.moderation_reviewer_audit_log
  TO service_role;

REVOKE ALL ON public.moderation_reviewers
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON public.moderation_reviewers
  TO service_role;

COMMIT;
