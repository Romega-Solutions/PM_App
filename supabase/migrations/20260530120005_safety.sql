-- =============================================================================
-- 0005 · SAFETY — blocks + reports (standard for dating apps)
-- =============================================================================

create table public.blocked_users (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);
create index idx_blocked_by on public.blocked_users (blocked_id);

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  reason      public.report_reason not null,
  details     text,
  status      public.report_status not null default 'open',
  created_at  timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint no_self_report check (reporter_id <> reported_id)
);
create index idx_reports_reported on public.reports (reported_id);
create index idx_reports_open     on public.reports (status) where status = 'open';

alter table public.blocked_users enable row level security;
alter table public.reports       enable row level security;

create policy "owner manages blocks" on public.blocked_users
  for all to authenticated
  using (blocker_id = (select auth.uid())) with check (blocker_id = (select auth.uid()));

create policy "reporter creates report" on public.reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "reporter reads own reports" on public.reports
  for select to authenticated using (reporter_id = (select auth.uid()));
