-- =============================================================================
-- 0001 · INIT — extensions, enum types, shared trigger helpers
-- PinayMate backend · normalized (3NF) schema · run order: 0001 first
-- =============================================================================

-- Extensions ------------------------------------------------------------------
create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- case-insensitive email

-- Enum types (closed/fixed domains; extensible sets use lookup tables) ---------
create type public.user_type          as enum ('filipina', 'foreigner');
create type public.gender             as enum ('male', 'female', 'other');
create type public.relationship_goal  as enum ('dating', 'long_term', 'marriage', 'friendship');
create type public.body_type          as enum ('slim', 'athletic', 'average', 'curvy', 'plus_size');
create type public.verification_status as enum ('pending', 'approved', 'rejected');
create type public.swipe_direction    as enum ('like', 'pass', 'superlike');
create type public.message_kind       as enum ('text', 'image', 'voice', 'video', 'file');
create type public.message_status     as enum ('sending', 'sent', 'delivered', 'read', 'failed');
create type public.report_reason      as enum ('spam', 'harassment', 'inappropriate', 'fake_profile', 'underage', 'other');
create type public.report_status      as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- Shared trigger: maintain updated_at -----------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Make the public schema usable by Supabase's API roles (RLS still gates rows).
grant usage on schema public to anon, authenticated, service_role;
