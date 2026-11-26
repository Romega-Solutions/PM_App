-- Make every public view read-only for app roles.
--
-- A view that still grants INSERT, UPDATE, DELETE or TRUNCATE to an app role
-- is a path around row security: discoverable_profiles uses
-- security_invoker = false, so a write through it would run with the view
-- owner's rights instead of the caller's.
--
-- Every migration that recreates public.discoverable_profiles runs
-- REVOKE ALL ... FROM PUBLIC, anon and GRANT SELECT ... TO authenticated, but
-- none revokes from authenticated. Supabase's default privileges grant ALL on
-- new relations in public to anon, authenticated and service_role, so after
-- each CREATE VIEW the authenticated role kept INSERT, UPDATE, DELETE,
-- TRUNCATE, REFERENCES and TRIGGER on the view. GRANT SELECT does not remove
-- them.
--
-- This migration:
--   1. Revokes every non-SELECT privilege on every view and materialized view
--      in public from PUBLIC, anon and authenticated. SELECT is not touched
--      here, so an unexpected live-only view keeps its current read access
--      until it is reviewed.
--   2. Re-asserts the intended discoverable_profiles grants: no access for
--      PUBLIC or anon, SELECT only for authenticated.
--
-- It only changes grants. It does not change any view definition and does
-- not change discoverable_profiles' security_invoker = false, which is
-- intentional (the view enforces privacy flags itself).

BEGIN;

DO $$
DECLARE
  v_view RECORD;
BEGIN
  FOR v_view IN
    SELECT c.oid::regclass AS relation
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind IN ('v', 'm')
  LOOP
    EXECUTE format(
      'REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON %s FROM PUBLIC, anon, authenticated',
      v_view.relation
    );
  END LOOP;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.discoverable_profiles') IS NOT NULL THEN
    REVOKE ALL ON public.discoverable_profiles FROM PUBLIC, anon, authenticated;
    GRANT SELECT ON public.discoverable_profiles TO authenticated;
  END IF;
END;
$$;

COMMIT;
