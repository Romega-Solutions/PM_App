-- =============================================================================
-- 0006 · STORAGE — buckets + object policies
--   profile-photos    : path = <profile_id>/<file>      (any authenticated read)
--   chat-images       : path = <conversation_id>/<file> (participants only)
--   verification-docs : path = <profile_id>/<file>      (owner only; review via service role)
-- All buckets private; clients fetch via signed URLs or authenticated downloads.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('profile-photos',    'profile-photos',    false),
       ('chat-images',       'chat-images',       false),
       ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

-- profile-photos --------------------------------------------------------------
create policy "auth read profile photos" on storage.objects
  for select to authenticated using (bucket_id = 'profile-photos');
create policy "owner writes profile photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'profile-photos'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owner updates profile photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'profile-photos'
         and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owner deletes profile photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'profile-photos'
         and (storage.foldername(name))[1] = (select auth.uid())::text);

-- chat-images (folder = conversation_id; only participants) -------------------
create policy "participants read chat images" on storage.objects
  for select to authenticated
  using (bucket_id = 'chat-images'
         and public.is_conversation_participant(((storage.foldername(name))[1])::uuid, (select auth.uid())));
create policy "participants upload chat images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-images'
              and public.is_conversation_participant(((storage.foldername(name))[1])::uuid, (select auth.uid())));

-- verification-docs (strictly owner; reviewers use the service role) ----------
create policy "owner reads verification docs" on storage.objects
  for select to authenticated
  using (bucket_id = 'verification-docs'
         and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owner uploads verification docs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'verification-docs'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
