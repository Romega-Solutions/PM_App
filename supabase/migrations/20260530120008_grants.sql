-- =============================================================================
-- 0008 · GRANTS — table/view/routine privileges for the API roles.
-- RLS still gates which ROWS are visible; these grants gate TABLE access.
-- anon is intentionally NOT granted: the app requires authentication.
-- =============================================================================

grant all on all tables    in schema public to authenticated, service_role;
grant all on all sequences in schema public to authenticated, service_role;
grant all on all routines   in schema public to authenticated, service_role;

-- Apply the same defaults to objects created by future migrations.
alter default privileges in schema public grant all on tables    to authenticated, service_role;
alter default privileges in schema public grant all on sequences to authenticated, service_role;
alter default privileges in schema public grant all on routines   to authenticated, service_role;
