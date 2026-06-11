-- PinayMate production security hardening
-- Purpose:
-- - Stop anonymous profile browsing.
-- - Move discovery reads to a safe profile-card view.
-- - Prevent clients from self-approving identity verification.
-- - Require authenticated conversation participants for chat RPCs and media.

BEGIN;

-- -------------------------------------------------------------------
-- Schema drift guardrails
-- -------------------------------------------------------------------
-- These columns are used by the current app code and appear in the
-- checked schema snapshot, but not all older setup scripts create them.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_coordinates JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_selfie TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_document TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_extracted_first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_extracted_last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_extracted_age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_mismatch_reasons TEXT[];

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS text TEXT;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text'
  CHECK (type IN ('text', 'image', 'voice', 'video', 'file'));
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interested_in TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_min INTEGER DEFAULT 18;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_max INTEGER DEFAULT 70;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_distance_km INTEGER DEFAULT 50;

-- -------------------------------------------------------------------
-- Safety and moderation primitives
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  source TEXT DEFAULT 'app',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT user_reports_not_self CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON public.user_reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported ON public.user_reports(reported_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status, created_at DESC);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_reports FROM PUBLIC, anon;
GRANT SELECT, INSERT ON public.user_reports TO authenticated;

DROP POLICY IF EXISTS "Users can create own reports" ON public.user_reports;
CREATE POLICY "Users can create own reports"
  ON public.user_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = (SELECT auth.uid())
    AND reporter_id <> reported_user_id
  );

DROP POLICY IF EXISTS "Users can read own reports" ON public.user_reports;
CREATE POLICY "Users can read own reports"
  ON public.user_reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()));

CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (blocker_id, blocked_user_id),
  CONSTRAINT user_blocks_not_self CHECK (blocker_id <> blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON public.user_blocks(blocked_user_id, blocker_id);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_blocks FROM PUBLIC, anon;
GRANT SELECT, INSERT, DELETE ON public.user_blocks TO authenticated;

DROP POLICY IF EXISTS "Users can read own blocks" ON public.user_blocks;
CREATE POLICY "Users can read own blocks"
  ON public.user_blocks
  FOR SELECT
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own blocks" ON public.user_blocks;
CREATE POLICY "Users can create own blocks"
  ON public.user_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    blocker_id = (SELECT auth.uid())
    AND blocker_id <> blocked_user_id
  );

DROP POLICY IF EXISTS "Users can delete own blocks" ON public.user_blocks;
CREATE POLICY "Users can delete own blocks"
  ON public.user_blocks
  FOR DELETE
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

-- -------------------------------------------------------------------
-- Profile read model
-- -------------------------------------------------------------------

REVOKE SELECT ON public.profiles FROM anon;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can discover active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Conversation participants can read profile cards" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE OR REPLACE VIEW public.discoverable_profiles
WITH (security_invoker = true) AS
SELECT
  id,
  first_name,
  age,
  gender,
  user_type,
  photos,
  bio,
  country,
  city,
  height_cm,
  body_type,
  education,
  occupation,
  relationship_goal,
  languages,
  interests,
  looking_for_gender,
  age_preference_min,
  age_preference_max,
  distance_preference_km,
  is_verified,
  is_active,
  is_premium,
  created_at,
  last_active_at
FROM public.profiles
WHERE is_active = TRUE
  AND id <> (SELECT auth.uid())
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_blocks b
    WHERE (
      b.blocker_id = (SELECT auth.uid())
      AND b.blocked_user_id = public.profiles.id
    )
    OR (
      b.blocker_id = public.profiles.id
      AND b.blocked_user_id = (SELECT auth.uid())
    )
  );

REVOKE ALL ON public.discoverable_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.discoverable_profiles TO authenticated;

CREATE OR REPLACE FUNCTION public.get_user_conversations(
  p_user_id UUID
)
RETURNS TABLE (
  id UUID,
  participant_1_id UUID,
  participant_2_id UUID,
  last_message_id UUID,
  last_message_text TEXT,
  last_message_sender_id UUID,
  last_message_at TIMESTAMPTZ,
  participant_1_unread_count INTEGER,
  participant_2_unread_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  other_user_id UUID,
  other_user_first_name TEXT,
  other_user_photos TEXT[],
  other_user_is_active BOOLEAN,
  other_user_last_active_at TIMESTAMPTZ,
  unread_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_user_id <> v_current_user THEN
    RAISE EXCEPTION 'Cannot read conversations for another user' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.participant_1_id,
    c.participant_2_id,
    c.last_message_id,
    c.last_message_text,
    c.last_message_sender_id,
    c.last_message_at,
    COALESCE(c.participant_1_unread_count, 0),
    COALESCE(c.participant_2_unread_count, 0),
    c.created_at,
    c.updated_at,
    p.id,
    p.first_name,
    p.photos,
    COALESCE(p.is_active, FALSE),
    p.last_active_at,
    CASE
      WHEN c.participant_1_id = v_current_user THEN COALESCE(c.participant_1_unread_count, 0)
      ELSE COALESCE(c.participant_2_unread_count, 0)
    END
  FROM public.conversations c
  JOIN public.profiles p
    ON p.id = CASE
      WHEN c.participant_1_id = v_current_user THEN c.participant_2_id
      ELSE c.participant_1_id
    END
  WHERE c.participant_1_id = v_current_user
     OR c.participant_2_id = v_current_user
  ORDER BY c.updated_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_conversations(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_conversations(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.unmatch_user(
  p_other_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_other_user_id IS NULL OR p_other_user_id = v_current_user THEN
    RAISE EXCEPTION 'A different member is required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.likes
  SET
    is_match = FALSE,
    matched_at = NULL
  WHERE is_match = TRUE
    AND (
      (from_user_id = v_current_user AND to_user_id = p_other_user_id)
      OR (from_user_id = p_other_user_id AND to_user_id = v_current_user)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.unmatch_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unmatch_user(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.block_user(
  p_blocked_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_blocked_user_id IS NULL OR p_blocked_user_id = v_current_user THEN
    RAISE EXCEPTION 'A different member is required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_blocks (blocker_id, blocked_user_id)
  VALUES (v_current_user, p_blocked_user_id)
  ON CONFLICT (blocker_id, blocked_user_id) DO NOTHING;

  PERFORM public.unmatch_user(p_blocked_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.block_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.block_user(UUID) TO authenticated;

-- -------------------------------------------------------------------
-- Profile update permissions
-- -------------------------------------------------------------------
-- RLS decides which row a user can update; column grants decide what a
-- browser/mobile client is allowed to update. Keep verification approval
-- fields out of the client-writable column set.

REVOKE UPDATE ON public.profiles FROM anon;
REVOKE UPDATE ON public.profiles FROM authenticated;

GRANT UPDATE (
  first_name,
  last_name,
  age,
  gender,
  user_type,
  occupation,
  education,
  photos,
  basic_info_completed,
  photos_completed,
  location_type,
  location_name,
  location_coordinates,
  location_timestamp,
  location_completed,
  interested_in,
  age_min,
  age_max,
  max_distance_km,
  relationship_goal,
  preferences_completed,
  verification_selfie,
  verification_document,
  verification_extracted_first_name,
  verification_extracted_last_name,
  verification_extracted_age,
  verification_mismatch_reasons,
  verification_completed,
  updated_at
) ON public.profiles TO authenticated;

DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;

  IF to_regprocedure('public.manual_verify_user(text)') IS NOT NULL THEN
    ALTER FUNCTION public.manual_verify_user(TEXT) SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.manual_verify_user(TEXT) FROM PUBLIC, anon, authenticated;
  END IF;
END;
$$;

-- -------------------------------------------------------------------
-- Chat RPC authorization
-- -------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_conversation_id UUID;
  v_participant_1_id UUID;
  v_participant_2_id UUID;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_user1_id IS NULL OR p_user2_id IS NULL OR p_user1_id = p_user2_id THEN
    RAISE EXCEPTION 'A conversation requires two different users' USING ERRCODE = '22023';
  END IF;

  IF v_current_user <> p_user1_id AND v_current_user <> p_user2_id THEN
    RAISE EXCEPTION 'Cannot create a conversation for another user' USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_blocks b
    WHERE (
      b.blocker_id = p_user1_id
      AND b.blocked_user_id = p_user2_id
    )
    OR (
      b.blocker_id = p_user2_id
      AND b.blocked_user_id = p_user1_id
    )
  ) THEN
    RAISE EXCEPTION 'Conversation is blocked by a member safety setting' USING ERRCODE = '42501';
  END IF;

  IF p_user1_id < p_user2_id THEN
    v_participant_1_id := p_user1_id;
    v_participant_2_id := p_user2_id;
  ELSE
    v_participant_1_id := p_user2_id;
    v_participant_2_id := p_user1_id;
  END IF;

  SELECT id INTO v_conversation_id
  FROM public.conversations
  WHERE participant_1_id = v_participant_1_id
    AND participant_2_id = v_participant_2_id;

  IF v_conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (v_participant_1_id, v_participant_2_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_or_create_conversation(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.reset_unread_count(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_user_id <> v_current_user THEN
    RAISE EXCEPTION 'Cannot reset unread count for another user' USING ERRCODE = '42501';
  END IF;

  UPDATE public.conversations
  SET
    participant_1_unread_count = CASE
      WHEN participant_1_id = v_current_user THEN 0
      ELSE participant_1_unread_count
    END,
    participant_2_unread_count = CASE
      WHEN participant_2_id = v_current_user THEN 0
      ELSE participant_2_unread_count
    END,
    updated_at = NOW()
  WHERE id = p_conversation_id
    AND (
      participant_1_id = v_current_user
      OR participant_2_id = v_current_user
    );
END;
$$;

REVOKE ALL ON FUNCTION public.reset_unread_count(UUID, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reset_unread_count(UUID, UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE public.conversations
    SET
      last_message_id = NEW.id,
      last_message_text = COALESCE(NEW.text, NEW.content, ''),
      last_message_sender_id = NEW.sender_id,
      last_message_at = NEW.created_at,
      updated_at = NOW(),
      participant_1_unread_count = CASE
        WHEN participant_1_id = NEW.recipient_id THEN participant_1_unread_count + 1
        ELSE participant_1_unread_count
      END,
      participant_2_unread_count = CASE
        WHEN participant_2_id = NEW.recipient_id THEN participant_2_unread_count + 1
        ELSE participant_2_unread_count
      END
    WHERE id = NEW.conversation_id;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.update_conversation_on_message() FROM PUBLIC, anon, authenticated;

-- -------------------------------------------------------------------
-- Message mutation hardening
-- -------------------------------------------------------------------

REVOKE UPDATE ON public.messages FROM anon;
REVOKE UPDATE ON public.messages FROM authenticated;
GRANT UPDATE (
  status,
  read_at,
  is_deleted,
  deleted_by,
  updated_at
) ON public.messages TO authenticated;

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
    AND sender_id <> recipient_id
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = public.messages.conversation_id
        AND (
          (
            c.participant_1_id = public.messages.sender_id
            AND c.participant_2_id = public.messages.recipient_id
          )
          OR (
            c.participant_1_id = public.messages.recipient_id
            AND c.participant_2_id = public.messages.sender_id
          )
        )
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks b
      WHERE (
        b.blocker_id = public.messages.sender_id
        AND b.blocked_user_id = public.messages.recipient_id
      )
      OR (
        b.blocker_id = public.messages.recipient_id
        AND b.blocked_user_id = public.messages.sender_id
      )
    )
  );

DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Conversation participants can update message state"
  ON public.messages
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = sender_id
    OR (SELECT auth.uid()) = recipient_id
  )
  WITH CHECK (
    (SELECT auth.uid()) = sender_id
    OR (SELECT auth.uid()) = recipient_id
  );

-- -------------------------------------------------------------------
-- Private chat media
-- -------------------------------------------------------------------

UPDATE storage.buckets
SET public = FALSE
WHERE id = 'chat-images';

DROP POLICY IF EXISTS "Users can upload chat images" ON storage.objects;
CREATE POLICY "Users can upload chat images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chat-images'
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (
          c.participant_1_id = (SELECT auth.uid())
          OR c.participant_2_id = (SELECT auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Users can view chat images" ON storage.objects;
CREATE POLICY "Users can view chat images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id::text = (storage.foldername(name))[1]
        AND (
          c.participant_1_id = (SELECT auth.uid())
          OR c.participant_2_id = (SELECT auth.uid())
        )
    )
  );

DROP POLICY IF EXISTS "Users can delete own chat images" ON storage.objects;
CREATE POLICY "Users can delete own chat images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chat-images'
    AND owner = (SELECT auth.uid())
  );

COMMIT;
