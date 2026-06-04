-- =============================================================================
-- 0003 · MATCHING — likes (with an is_match flag) + passes.
--        A "match" is mutual likes flipped to is_match = true; the app
--        (matchingApi) detects mutuality and flips both rows, so no server
--        trigger is required here.
-- =============================================================================

create table public.likes (
  id           uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id   uuid not null references public.profiles (id) on delete cascade,
  is_match     boolean not null default false,
  matched_at   timestamptz,
  created_at   timestamptz default now(),
  constraint likes_unique_pair unique (from_user_id, to_user_id)
);
create index idx_likes_from  on public.likes (from_user_id);
create index idx_likes_to    on public.likes (to_user_id);
create index idx_likes_match on public.likes (is_match) where is_match;

create table public.passes (
  id           uuid primary key default uuid_generate_v4(),
  from_user_id uuid not null references public.profiles (id) on delete cascade,
  to_user_id   uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz default now(),
  constraint passes_unique_pair unique (from_user_id, to_user_id)
);
create index idx_passes_from on public.passes (from_user_id);

-- Row Level Security ----------------------------------------------------------
alter table public.likes  enable row level security;
alter table public.passes enable row level security;

-- likes: see rows involving you; create only your own; update rows involving
-- you (so a mutual like can flip is_match on both your row and theirs).
create policy "read likes involving you" on public.likes
  for select to authenticated
  using (from_user_id = (select auth.uid()) or to_user_id = (select auth.uid()));
create policy "insert own likes" on public.likes
  for insert to authenticated
  with check (from_user_id = (select auth.uid()));
create policy "update likes involving you" on public.likes
  for update to authenticated
  using (from_user_id = (select auth.uid()) or to_user_id = (select auth.uid()))
  with check (from_user_id = (select auth.uid()) or to_user_id = (select auth.uid()));

-- passes: private to the actor
create policy "read own passes" on public.passes
  for select to authenticated
  using (from_user_id = (select auth.uid()));
create policy "insert own passes" on public.passes
  for insert to authenticated
  with check (from_user_id = (select auth.uid()));
