-- =============================================================================
-- 0004 · MESSAGING — messages (sender/recipient, live column shape) +
--        conversations (participant pair + per-side unread counters).
--        A BEFORE-INSERT trigger on messages derives/maintains the conversation
--        and back-fills messages.conversation_id; the inbox reads conversations.
-- =============================================================================

-- conversations : exactly one row per ordered participant pair ----------------
create table public.conversations (
  id                         uuid primary key default uuid_generate_v4(),
  participant_1_id           uuid not null references public.profiles (id) on delete cascade,
  participant_2_id           uuid not null references public.profiles (id) on delete cascade,
  participant_1_unread_count integer not null default 0,
  participant_2_unread_count integer not null default 0,
  last_message               text,
  last_message_at            timestamptz,
  created_at                 timestamptz default now(),
  updated_at                 timestamptz default now(),
  constraint conversations_ordered_pair check (participant_1_id < participant_2_id),
  constraint conversations_unique_pair  unique (participant_1_id, participant_2_id)
);
-- Column names give Postgres the default FK names the app's embedded select
-- relies on: conversations_participant_1_id_fkey / _participant_2_id_fkey.
create index idx_conversations_p1      on public.conversations (participant_1_id);
create index idx_conversations_p2      on public.conversations (participant_2_id);
create index idx_conversations_updated on public.conversations (updated_at desc);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.handle_updated_at();

-- messages : live column shape + conversation_id (filled by the trigger) ------
create table public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references public.conversations (id) on delete cascade,
  sender_id       uuid not null references public.profiles (id) on delete cascade,
  recipient_id    uuid not null references public.profiles (id) on delete cascade,
  text            text,
  type            text not null default 'text',
  image_url       text,
  status          text not null default 'sent',
  delivery_method text default 'database',
  read_at         timestamptz,
  is_deleted      boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- indexes reproduced from the live DB (+ a conversation_id index) -------------
create index idx_messages_sender on public.messages (sender_id, created_at desc) where (is_deleted = false);
create index idx_messages_recipient on public.messages (recipient_id, created_at desc) where (is_deleted = false);
create index idx_messages_conversation on public.messages (sender_id, recipient_id, created_at desc) where (is_deleted = false);
create index idx_messages_conversation_reverse on public.messages (recipient_id, sender_id, created_at desc) where (is_deleted = false);
create index idx_messages_unread on public.messages (recipient_id, status) where ((is_deleted = false) and (status <> 'read'));
create index idx_messages_delivery_method on public.messages (delivery_method, created_at desc) where (is_deleted = false);
create index idx_messages_read_at on public.messages (recipient_id, read_at) where ((is_deleted = false) and (read_at is not null));
create index idx_messages_conversation_id on public.messages (conversation_id, created_at desc) where (is_deleted = false);

create trigger messages_updated_at
  before update on public.messages
  for each row execute function public.handle_updated_at();

-- Derive + maintain the conversation for each new message ----------------------
create or replace function public.handle_message_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p1 uuid := least(new.sender_id, new.recipient_id);
  p2 uuid := greatest(new.sender_id, new.recipient_id);
  v_conversation_id uuid;
begin
  -- find-or-create the conversation for this ordered pair, refreshing preview
  insert into public.conversations as c
    (participant_1_id, participant_2_id, last_message, last_message_at, updated_at)
  values (p1, p2, new.text, coalesce(new.created_at, now()), coalesce(new.created_at, now()))
  on conflict (participant_1_id, participant_2_id) do update
    set last_message    = excluded.last_message,
        last_message_at = excluded.last_message_at,
        updated_at      = excluded.updated_at
  returning c.id into v_conversation_id;

  new.conversation_id := v_conversation_id;

  -- bump the RECIPIENT's unread counter
  if new.recipient_id = p1 then
    update public.conversations
       set participant_1_unread_count = participant_1_unread_count + 1
     where id = v_conversation_id;
  else
    update public.conversations
       set participant_2_unread_count = participant_2_unread_count + 1
     where id = v_conversation_id;
  end if;

  return new;
end;
$$;

create trigger trg_message_conversation
  before insert on public.messages
  for each row execute function public.handle_message_conversation();

-- Find (or create) the conversation for a pair. The app calls this before
-- sending a message so it can pass conversation_id on the insert; the BEFORE
-- INSERT trigger above then keeps everything consistent either way.
create or replace function public.get_or_create_conversation(p_user1_id uuid, p_user2_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  p1 uuid := least(p_user1_id, p_user2_id);
  p2 uuid := greatest(p_user1_id, p_user2_id);
  v_id uuid;
begin
  insert into public.conversations (participant_1_id, participant_2_id)
  values (p1, p2)
  on conflict (participant_1_id, participant_2_id) do nothing
  returning id into v_id;

  if v_id is null then
    select id into v_id
      from public.conversations
     where participant_1_id = p1 and participant_2_id = p2;
  end if;

  return v_id;
end;
$$;

-- Reset a participant's unread counter (app calls this when opening a chat) ----
create or replace function public.reset_unread_count(p_conversation_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set participant_1_unread_count =
           case when participant_1_id = p_user_id then 0 else participant_1_unread_count end,
         participant_2_unread_count =
           case when participant_2_id = p_user_id then 0 else participant_2_unread_count end
   where id = p_conversation_id;
end;
$$;

-- Row Level Security ----------------------------------------------------------
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- conversations: participants read only. All writes happen inside the
-- SECURITY DEFINER trigger / RPC above, so clients need no write policy.
create policy "participants read conversations" on public.conversations
  for select to authenticated
  using (participant_1_id = (select auth.uid()) or participant_2_id = (select auth.uid()));

-- messages: reproduced from the live policies (sender/recipient scoped) --------
create policy "Users can view their own messages" on public.messages
  for select to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy "Users can insert their own messages" on public.messages
  for insert to authenticated
  with check (sender_id = (select auth.uid()));
create policy "Users can update their own messages" on public.messages
  for update to authenticated
  using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()))
  with check (
    (sender_id = (select auth.uid()) and status = any (array['sending', 'sent', 'delivered']))
    or (recipient_id = (select auth.uid()) and (status = 'read' or read_at is not null))
    or (sender_id = (select auth.uid()) and is_deleted = true)
  );

-- Realtime: the chat screen subscribes to postgres_changes on messages.
-- replica identity full => UPDATE payloads carry the full row (read-status).
alter table public.messages replica identity full;
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages;
  else
    create publication supabase_realtime for table public.messages;
  end if;
exception
  when duplicate_object then null;  -- already a member of the publication
end $$;
