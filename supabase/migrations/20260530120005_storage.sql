-- =============================================================================
-- 0005 · STORAGE — public buckets the app reads via getPublicUrl().
--   profile-photos : path = <userId>/<file>          (owner writes · public read)
--   chat-images    : path = <conversationId>/<file>  (auth writes · public read)
-- Both buckets are PUBLIC because the app resolves images with getPublicUrl();
-- a private bucket would return non-resolving URLs.
-- =============================================================================

insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true),
       ('chat-images',    'chat-images',    true)
on conflict (id) do update set public = excluded.public;

-- profile-photos --------------------------------------------------------------
create policy "public read profile photos" on storage.objects
  for select using (bucket_id = 'profile-photos');
create policy "owner uploads profile photos" on storage.objects
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

-- chat-images (folder = conversation_id, not the uploader) --------------------
create policy "public read chat images" on storage.objects
  for select using (bucket_id = 'chat-images');
create policy "auth uploads chat images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'chat-images');
create policy "owner deletes chat images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'chat-images' and owner = (select auth.uid()));
