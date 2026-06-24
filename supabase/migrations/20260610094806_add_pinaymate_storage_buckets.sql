-- PinayMate storage buckets and RLS policies.
--
-- Profile photos are public because the current client stores and renders
-- public URLs in profile/discovery flows. Upload, overwrite, and delete remain
-- restricted to the authenticated user's own folder.
--
-- Verification documents are private. Users can upload and read their own
-- selfie/document evidence; moderators/admin workflows should use privileged
-- server access or signed URLs instead of exposing the bucket publicly.

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-photos', 'profile-photos', TRUE),
  ('verification-docs', 'verification-docs', FALSE)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

DROP POLICY IF EXISTS "Users can upload own profile photos" ON storage.objects;
CREATE POLICY "Users can upload own profile photos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Authenticated users can view profile photos" ON storage.objects;
CREATE POLICY "Authenticated users can view profile photos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
  );

DROP POLICY IF EXISTS "Users can replace own profile photos" ON storage.objects;
CREATE POLICY "Users can replace own profile photos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  )
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can delete own profile photos" ON storage.objects;
CREATE POLICY "Users can delete own profile photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can upload own verification documents" ON storage.objects;
CREATE POLICY "Users can upload own verification documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'verification-docs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can read own verification documents" ON storage.objects;
CREATE POLICY "Users can read own verification documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verification-docs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

DROP POLICY IF EXISTS "Users can delete own verification documents" ON storage.objects;
CREATE POLICY "Users can delete own verification documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'verification-docs'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );
