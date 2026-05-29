-- =============================================================================
-- 0003 · MATCHING domain — swipes + matches
--   swipes : one directional action per (swiper, swipee)
--   matches: a distinct entity, stored with ordered participants (a < b)
-- =============================================================================

create table public.swipes (
  id         uuid primary key default gen_random_uuid(),
  swiper_id  uuid not null references public.profiles (id) on delete cascade,
  swipee_id  uuid not null references public.profiles (id) on delete cascade,
  direction  public.swipe_direction not null,
  created_at timestamptz not null default now(),
  unique (swiper_id, swipee_id),
  constraint no_self_swipe check (swiper_id <> swipee_id)
);
create index idx_swipes_swiper on public.swipes (swiper_id);
create index idx_swipes_swipee on public.swipes (swipee_id);
create index idx_swipes_incoming_likes on public.swipes (swipee_id, swiper_id)
  where direction in ('like', 'superlike');

create table public.matches (
  id           uuid primary key default gen_random_uuid(),
  profile_a_id uuid not null references public.profiles (id) on delete cascade,
  profile_b_id uuid not null references public.profiles (id) on delete cascade,
  is_active    boolean not null default true,           -- false after an unmatch
  created_at   timestamptz not null default now(),
  unique (profile_a_id, profile_b_id),
  constraint match_pair_ordered check (profile_a_id < profile_b_id)
);
create index idx_matches_a on public.matches (profile_a_id) where is_active;
create index idx_matches_b on public.matches (profile_b_id) where is_active;

-- Create a match when a like/superlike completes a mutual like -----------------
create or replace function public.create_match_on_mutual_like()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_a uuid;
  v_b uuid;
begin
  if new.direction in ('like', 'superlike')
     and exists (
       select 1 from public.swipes s
        where s.swiper_id = new.swipee_id
          and s.swipee_id = new.swiper_id
          and s.direction in ('like', 'superlike')
     )
  then
    v_a := least(new.swiper_id, new.swipee_id);
    v_b := greatest(new.swiper_id, new.swipee_id);
    insert into public.matches (profile_a_id, profile_b_id)
    values (v_a, v_b)
    on conflict (profile_a_id, profile_b_id) do update set is_active = true;
  end if;
  return new;
end;
$$;

create trigger trg_create_match_on_mutual_like
  after insert on public.swipes
  for each row execute function public.create_match_on_mutual_like();

-- Row Level Security ----------------------------------------------------------
alter table public.swipes  enable row level security;
alter table public.matches enable row level security;

create policy "read own swipes" on public.swipes
  for select to authenticated using (swiper_id = (select auth.uid()));
create policy "create own swipes" on public.swipes
  for insert to authenticated with check (swiper_id = (select auth.uid()));

-- matches are created by the (security definer) trigger, so no client INSERT policy.
create policy "read own matches" on public.matches
  for select to authenticated
  using (profile_a_id = (select auth.uid()) or profile_b_id = (select auth.uid()));
create policy "unmatch own matches" on public.matches
  for update to authenticated
  using (profile_a_id = (select auth.uid()) or profile_b_id = (select auth.uid()))
  with check (profile_a_id = (select auth.uid()) or profile_b_id = (select auth.uid()));
