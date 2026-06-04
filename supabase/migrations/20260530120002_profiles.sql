-- =============================================================================
-- 0002 · PROFILES — flat/denormalized profile, matching the live schema the app
--        reads & writes. Columns mirror the live DB dump + `last_active_at`
--        (read by matching + inbox). Closed domains are plain text (the app
--        sends strings: 'filipina'/'foreigner', 'male'/'female', etc.).
-- =============================================================================

create table public.profiles (
  id                                uuid primary key default uuid_generate_v4()
                                       references auth.users (id) on delete cascade,
  email                             text not null,
  first_name                        text not null,
  last_name                         text,
  user_type                         text not null,            -- 'filipina' | 'foreigner'
  gender                            text,                     -- 'male' | 'female' | 'other'
  age                               integer,

  -- onboarding progress flags
  basic_info_completed              boolean default false,
  photos_completed                  boolean default false,
  location_completed                boolean default false,
  verification_completed            boolean default false,
  preferences_completed             boolean default false,

  -- media
  photos                            text[] default '{}',
  profile_photo                     text,

  -- location
  location_type                     text,
  location_name                     text,
  location_coordinates              jsonb,
  location_timestamp                timestamptz,

  -- verification (OCR is mocked client-side; these store its output)
  verification_selfie               text,
  verification_document             text,
  verification_extracted_first_name text,
  verification_extracted_last_name  text,
  verification_extracted_age        integer,
  is_verified                       boolean default false,
  verified_at                       timestamptz,
  verification_mismatch_reasons     text[],

  -- match preferences (kept inline; the app reads them off profiles)
  interested_in                     text,
  age_min                           integer default 18,
  age_max                           integer default 70,
  max_distance_km                   integer default 50,
  relationship_goal                 text,

  -- presence / activity
  is_online                         boolean default false,
  is_active                         boolean default true,
  last_seen                         timestamptz default now(),
  last_active_at                    timestamptz default now(),

  created_at                        timestamptz default now(),
  updated_at                        timestamptz default now()
);

create index idx_profiles_user_type   on public.profiles (user_type);
create index idx_profiles_is_active    on public.profiles (is_active) where is_active;
create index idx_profiles_last_active  on public.profiles (last_active_at desc);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create a profile when a new auth user signs up. Mirrors the app's own
-- deep-link insert (id, email, first_name, user_type, gender) so the two never
-- fight; ON CONFLICT DO NOTHING + a catch-all keeps signup from ever blocking.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_type text := coalesce(new.raw_user_meta_data ->> 'user_type', 'foreigner');
  v_gender    text := case when coalesce(new.raw_user_meta_data ->> 'user_type', 'foreigner') = 'filipina'
                           then 'female' else 'male' end;
begin
  insert into public.profiles (id, email, first_name, user_type, gender)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data ->> 'first_name', ''),
          v_user_type, v_gender)
  on conflict (id) do nothing;
  return new;
exception when others then
  raise log 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;   -- never block signup
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security ----------------------------------------------------------
alter table public.profiles enable row level security;

create policy "read active profiles" on public.profiles
  for select to authenticated
  using (is_active or id = (select auth.uid()));
create policy "insert own profile" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
