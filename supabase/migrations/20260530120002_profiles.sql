-- =============================================================================
-- 0002 · PROFILES domain — identity, preferences, photos, interests, languages,
--        verifications. 3NF: no multi-valued columns, no derived `age`.
-- =============================================================================

-- profiles : 1-to-1 with auth.users -------------------------------------------
create table public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          citext not null unique,                 -- synced from auth.users
  first_name     text   not null default '',
  last_name      text   not null default '',
  user_type      public.user_type not null,
  gender         public.gender    not null,
  date_of_birth  date,                                   -- store DOB; derive age in a view
  bio            text   not null default '',
  height_cm      integer check (height_cm between 100 and 250),
  body_type      public.body_type,
  occupation     text,
  education      text,

  -- location (atomic columns; no jsonb blob)
  country        text,
  city           text,
  latitude       double precision check (latitude between -90 and 90),
  longitude      double precision check (longitude between -180 and 180),

  -- presence / account state (last_seen_at stored; is_online derived in a view)
  last_seen_at   timestamptz not null default now(),
  is_active      boolean not null default true,
  is_premium     boolean not null default false,
  premium_until  timestamptz,

  -- onboarding progress
  basic_info_completed   boolean not null default false,
  photos_completed       boolean not null default false,
  location_completed     boolean not null default false,
  preferences_completed  boolean not null default false,
  verification_completed boolean not null default false,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint dob_adult check (
    date_of_birth is null
    or date_of_birth <= (current_date - interval '18 years')
  )
);

create index idx_profiles_user_type on public.profiles (user_type);
create index idx_profiles_gender    on public.profiles (gender);
create index idx_profiles_active    on public.profiles (is_active) where is_active;
create index idx_profiles_last_seen on public.profiles (last_seen_at desc);
create index idx_profiles_geo       on public.profiles (latitude, longitude)
  where latitude is not null and longitude is not null;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- match_preferences : 1-to-1, "what I'm looking for" --------------------------
create table public.match_preferences (
  profile_id        uuid primary key references public.profiles (id) on delete cascade,
  interested_in     public.gender not null,
  min_age           integer not null default 18  check (min_age >= 18),
  max_age           integer not null default 70  check (max_age <= 120),
  max_distance_km   integer not null default 100 check (max_distance_km > 0),
  relationship_goal public.relationship_goal,
  updated_at        timestamptz not null default now(),
  constraint age_range_valid check (min_age <= max_age)
);

create trigger trg_match_preferences_updated_at
  before update on public.match_preferences
  for each row execute function public.set_updated_at();

-- profile_photos : 1-to-many (replaces the photos[] array) --------------------
create table public.profile_photos (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null,                  -- path within the 'profile-photos' bucket
  position     smallint not null check (position between 0 and 5),
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (profile_id, position)
);
create unique index uq_profile_primary_photo
  on public.profile_photos (profile_id) where is_primary;   -- one primary per profile
create index idx_profile_photos_profile on public.profile_photos (profile_id);

-- interests : lookup + M-N junction -------------------------------------------
create table public.interests (
  id       smallint generated always as identity primary key,
  name     text not null unique,
  category text
);
create table public.profile_interests (
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  interest_id smallint not null references public.interests (id) on delete cascade,
  primary key (profile_id, interest_id)
);
create index idx_profile_interests_interest on public.profile_interests (interest_id);

-- languages : lookup + M-N junction -------------------------------------------
create table public.languages (
  code text primary key,                       -- ISO 639-1/3, e.g. 'en', 'tl', 'ceb'
  name text not null
);
create table public.profile_languages (
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  language_code text not null references public.languages (code) on delete cascade,
  primary key (profile_id, language_code)
);

-- verifications : 1-to-many (a user may resubmit) -----------------------------
create table public.verifications (
  id                      uuid primary key default gen_random_uuid(),
  profile_id              uuid not null references public.profiles (id) on delete cascade,
  selfie_path             text not null,       -- path within 'verification-docs' bucket
  document_path           text not null,
  extracted_first_name    text,
  extracted_last_name     text,
  extracted_date_of_birth date,
  status                  public.verification_status not null default 'pending',
  mismatch_reasons        text[] not null default '{}',
  submitted_at            timestamptz not null default now(),
  reviewed_at             timestamptz,
  reviewed_by             uuid references auth.users (id)
);
create index idx_verifications_profile on public.verifications (profile_id, submitted_at desc);
create index idx_verifications_pending on public.verifications (status) where status = 'pending';

-- Keep profiles.verification_completed in sync when a verification is approved.
create or replace function public.sync_verification_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' then
    update public.profiles set verification_completed = true where id = new.profile_id;
  end if;
  return new;
end;
$$;
create trigger trg_sync_verification_state
  after insert or update of status on public.verifications
  for each row execute function public.sync_verification_state();

-- Create profile + default preferences on signup ------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_type public.user_type;
  v_gender    public.gender;
  v_interest  public.gender;
begin
  begin
    v_user_type := coalesce((new.raw_user_meta_data ->> 'user_type')::public.user_type, 'foreigner');
  exception when others then
    v_user_type := 'foreigner';
  end;

  -- Business rule: filipina => female (seeks male); foreigner => male (seeks female)
  if v_user_type = 'filipina' then
    v_gender := 'female'; v_interest := 'male';
  else
    v_gender := 'male';   v_interest := 'female';
  end if;

  insert into public.profiles (id, email, first_name, user_type, gender)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data ->> 'first_name', ''),
          v_user_type, v_gender)
  on conflict (id) do update
    set email = excluded.email, first_name = excluded.first_name,
        user_type = excluded.user_type, gender = excluded.gender;

  insert into public.match_preferences (profile_id, interested_in)
  values (new.id, v_interest)
  on conflict (profile_id) do nothing;

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
alter table public.profiles          enable row level security;
alter table public.match_preferences enable row level security;
alter table public.profile_photos    enable row level security;
alter table public.interests         enable row level security;
alter table public.profile_interests enable row level security;
alter table public.languages         enable row level security;
alter table public.profile_languages enable row level security;
alter table public.verifications     enable row level security;

-- profiles
create policy "read active profiles" on public.profiles
  for select to authenticated using (is_active or id = (select auth.uid()));
create policy "insert own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- match_preferences (owner only)
create policy "owner reads prefs" on public.match_preferences
  for select to authenticated using (profile_id = (select auth.uid()));
create policy "owner writes prefs" on public.match_preferences
  for all to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

-- profile_photos (readable for active profiles, written by owner)
create policy "read photos of active profiles" on public.profile_photos
  for select to authenticated using (
    exists (select 1 from public.profiles p
             where p.id = profile_id and (p.is_active or p.id = (select auth.uid()))));
create policy "owner writes photos" on public.profile_photos
  for all to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

-- interests / languages (read-only lookups for clients; seeded by service role)
create policy "read interests" on public.interests for select to authenticated using (true);
create policy "read languages" on public.languages for select to authenticated using (true);

-- profile_interests / profile_languages (read for active profiles, write own)
create policy "read profile interests" on public.profile_interests
  for select to authenticated using (
    exists (select 1 from public.profiles p
             where p.id = profile_id and (p.is_active or p.id = (select auth.uid()))));
create policy "owner writes profile interests" on public.profile_interests
  for all to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
create policy "read profile languages" on public.profile_languages
  for select to authenticated using (
    exists (select 1 from public.profiles p
             where p.id = profile_id and (p.is_active or p.id = (select auth.uid()))));
create policy "owner writes profile languages" on public.profile_languages
  for all to authenticated using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));

-- verifications (owner sees/creates own; reviews happen via service role)
create policy "owner reads verifications" on public.verifications
  for select to authenticated using (profile_id = (select auth.uid()));
create policy "owner submits verification" on public.verifications
  for insert to authenticated with check (profile_id = (select auth.uid()));
