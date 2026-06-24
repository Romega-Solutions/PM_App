-- PinayMate launch hardening: keep public-schema function execution explicit.
--
-- Supabase exposes the public schema through the Data API by default. PostgreSQL
-- functions can inherit EXECUTE through PUBLIC unless revoked, which is risky
-- for SECURITY DEFINER RPCs and helper functions. This migration removes that
-- inherited path without touching explicit authenticated/service_role grants.
--
-- Ordering note: this migration is intentionally timestamped after the other
-- timestamped launch migrations. It is safe if applied after those earlier
-- launch migrations in an already-progressed environment because it revokes
-- EXECUTE on all existing public functions as well as changing future default
-- privileges for functions created by the migration role.

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
REVOKE EXECUTE ON FUNCTIONS FROM anon;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
