-- Restore least privilege after late-applying the primitive restore migration.
--
-- 20260610090000_restore_legacy_security_primitives.sql is ordered before the
-- final hardening migration for fresh rebuilds, but beta already had the final
-- hardening applied. Revoke direct writes again so app clients keep using RPCs.

BEGIN;

REVOKE ALL ON public.user_reports FROM authenticated;
GRANT SELECT ON public.user_reports TO authenticated;

REVOKE ALL ON public.user_blocks FROM authenticated;
GRANT SELECT ON public.user_blocks TO authenticated;

COMMIT;
