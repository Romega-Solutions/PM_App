-- =============================================================================
-- 0004 · MESSAGING domain
--   conversations : exactly one per match (1-to-1)
--   messages      : recipient is DERIVED from the conversation (not stored)
--   message_deletions : per-user "delete for me" (junction)
-- =============================================================================

create table public.conversations (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null unique references public.matches (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()   -- bumped on each new message
);
create index idx_conversations_match on public.conversations (match_id);

create trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- Auto-create a conversation when a match is created --------------------------
create or replace function public.create_conversation_for_match()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.conversations (match_id)
  values (new.id)
  on conflict (match_id) do nothing;
  return new;
end;
$$;
create trigger trg_create_conversation_for_match
  after insert on public.matches
  for each row execute function public.create_conversation_for_match();

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  kind            public.message_kind   not null default 'text',
  body            text,                          -- text content (null for media-only)
  image_path      text,                          -- path within the 'chat-images' bucket
  status          public.message_status not null default 'sent',
  read_at         timestamptz,                   -- set when the recipient reads it
  edited_at       timestamptz,
  deleted_at      timestamptz,                   -- "delete for everyone"
  created_at      timestamptz not null default now(),
  constraint body_or_media check (body is not null or image_path is not null)
);
create index idx_messages_conversation on public.messages (conversation_id, created_at desc);
create index idx_messages_sender       on public.messages (sender_id);
create index idx_messages_unread       on public.messages (conversation_id) where read_at is null;

-- Bump conversation.updated_at on new message (inbox ordering) -----------------
create or replace function public.touch_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$;
create trigger trg_touch_conversation_on_message
  after insert on public.messages
  for each row execute function public.touch_conversation_on_message();

-- Per-user "delete for me" ----------------------------------------------------
create table public.message_deletions (
  message_id uuid not null references public.messages (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  deleted_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

-- Helper: is the user a participant of a conversation? (used by RLS) ----------
create or replace function public.is_conversation_participant(p_conversation_id uuid, p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.conversations c
      join public.matches m on m.id = c.match_id
     where c.id = p_conversation_id
       and (m.profile_a_id = p_user or m.profile_b_id = p_user)
  );
$$;

-- Row Level Security ----------------------------------------------------------
alter table public.conversations     enable row level security;
alter table public.messages          enable row level security;
alter table public.message_deletions enable row level security;

create policy "participants read conversations" on public.conversations
  for select to authenticated
  using (public.is_conversation_participant(id, (select auth.uid())));

create policy "participants read messages" on public.messages
  for select to authenticated
  using (public.is_conversation_participant(conversation_id, (select auth.uid())));
create policy "participants send messages" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_participant(conversation_id, (select auth.uid()))
  );
create policy "participants update messages" on public.messages
  for update to authenticated
  using (public.is_conversation_participant(conversation_id, (select auth.uid())))
  with check (public.is_conversation_participant(conversation_id, (select auth.uid())));

create policy "owner manages own deletions" on public.message_deletions
  for all to authenticated
  using (profile_id = (select auth.uid())) with check (profile_id = (select auth.uid()));
