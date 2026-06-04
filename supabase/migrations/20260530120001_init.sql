-- =============================================================================
-- 0001 · INIT — extensions + shared trigger helper + schema grants
-- PinayMate backend · APP-DRIVEN schema: reproduces the live working DB the app
-- queries (profiles-flat / likes / passes / messages) plus the objects the app
-- expects (conversations + unread counters + reset_unread_count). Run first.
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists "uuid-ossp";   -- uuid_generate_v4() (live profiles.id default)
create extension if not exists pgcrypto;       -- gen_random_uuid()

-- Shared trigger: keep updated_at current on UPDATE ---------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Expose the public schema to Supabase's API roles (RLS still gates rows).
grant usage on schema public to anon, authenticated, service_role;
