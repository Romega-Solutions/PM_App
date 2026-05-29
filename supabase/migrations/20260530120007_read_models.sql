-- =============================================================================
-- 0007 · READ MODELS — views + a discovery RPC.
-- Derived values (age, is_online, is_verified, unread counts, last message) are
-- COMPUTED here, never stored, so the base tables stay in 3NF.
-- Views use security_invoker so the caller's RLS still applies.
-- =============================================================================

-- profiles_extended : base profile + derived display fields -------------------
create or replace view public.profiles_extended
with (security_invoker = on) as
select
  p.*,
  case when p.date_of_birth is null then null
       else date_part('year', age(p.date_of_birth))::int end          as age,
  (p.last_seen_at > now() - interval '5 minutes')                      as is_online,
  exists (select 1 from public.verifications v
            where v.profile_id = p.id and v.status = 'approved')       as is_verified
from public.profiles p;

-- conversation_list : one row per conversation for the current user -----------
create or replace view public.conversation_list
with (security_invoker = on) as
select
  c.id                  as conversation_id,
  c.match_id,
  c.updated_at,
  other.id              as other_profile_id,
  other.first_name      as other_first_name,
  lm.body               as last_message_body,
  lm.kind               as last_message_kind,
  lm.created_at         as last_message_at,
  lm.sender_id          as last_message_sender_id,
  (select count(*) from public.messages m
     where m.conversation_id = c.id
       and m.sender_id <> (select auth.uid())
       and m.read_at is null
       and m.deleted_at is null)                                       as unread_count
from public.conversations c
join public.matches mt on mt.id = c.match_id
join public.profiles other
  on other.id = case when mt.profile_a_id = (select auth.uid())
                     then mt.profile_b_id else mt.profile_a_id end
left join lateral (
  select m.* from public.messages m
   where m.conversation_id = c.id and m.deleted_at is null
   order by m.created_at desc
   limit 1
) lm on true
where mt.profile_a_id = (select auth.uid()) or mt.profile_b_id = (select auth.uid());

-- get_discover_profiles : candidate profiles for the current user -------------
-- Server-side filtering: opposite-of-preference gender, age window, active,
-- not already swiped, not blocked (either direction), not self.
create or replace function public.get_discover_profiles(p_limit int default 50)
returns setof public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select p.*
    from public.profiles p
    join public.match_preferences me on me.profile_id = auth.uid()
   where p.id <> auth.uid()
     and p.is_active
     and p.gender = me.interested_in
     and (
       p.date_of_birth is null
       or date_part('year', age(p.date_of_birth))::int between me.min_age and me.max_age
     )
     and not exists (select 1 from public.swipes s
                      where s.swiper_id = auth.uid() and s.swipee_id = p.id)
     and not exists (select 1 from public.blocked_users b
                      where (b.blocker_id = auth.uid() and b.blocked_id = p.id)
                         or (b.blocker_id = p.id and b.blocked_id = auth.uid()))
   order by p.last_seen_at desc
   limit greatest(p_limit, 0);
$$;

grant execute on function public.get_discover_profiles(int) to authenticated;
