-- =============================================================================
-- 0006 · GRANTS — expose objects to the Supabase API roles. Runs last so it
--        covers every table/sequence/function created in 0002–0004.
--        RLS still gates which ROWS each role can touch.
-- =============================================================================

-- authenticated gets row-level CRUD (RLS gates the rows); TRUNCATE is withheld
-- because it bypasses RLS. service_role (server-side only) gets everything.
grant select, insert, update, delete on all tables    in schema public to authenticated;
grant all                            on all tables    in schema public to service_role;
grant usage, select                  on all sequences in schema public to authenticated;
grant all                            on all sequences in schema public to service_role;
grant execute on all functions in schema public to authenticated, service_role;

-- Cover objects created later, too.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
alter default privileges in schema public
  grant all on sequences to service_role;
alter default privileges in schema public
  grant execute on functions to authenticated, service_role;
