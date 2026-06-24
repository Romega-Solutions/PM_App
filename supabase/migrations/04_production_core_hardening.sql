-- ===================================================================
-- PINAYMATE PRODUCTION CORE HARDENING
-- ===================================================================
-- Adds the backend pieces needed for a backend-backed MVP without
-- breaking the existing mobile API shape.
--
-- Run after:
--   00_complete_database_setup.sql
--   02_chat_schema_updates.sql / 03_add_conversations_table.sql
-- ===================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ===================================================================
-- 1. PROFILE HARDENING AND COMPLETION GATES
-- ===================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS app_role TEXT DEFAULT 'member'
    CHECK (app_role IN ('member', 'moderator', 'admin')),
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'discoverable'
    CHECK (profile_visibility IN ('discoverable', 'hidden', 'paused')),
  ADD COLUMN IF NOT EXISTS anonymous_mode BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS show_distance BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS show_read_receipts BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'free'
    CHECK (membership_tier IN ('free', 'gold', 'platinum')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'none'
    CHECK (subscription_status IN ('none', 'trialing', 'active', 'past_due', 'canceled')),
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS revenuecat_app_user_id TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_app_role ON public.profiles(app_role);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON public.profiles(membership_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_discoverable
  ON public.profiles(user_type, gender, age, last_active_at DESC)
  WHERE is_active = TRUE AND profile_visibility = 'discoverable' AND deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT app_role FROM public.profiles WHERE id = auth.uid()),
    'member'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_app_role() IN ('admin', 'moderator');
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_completion_flags()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  photo_count INTEGER;
BEGIN
  photo_count := COALESCE(array_length(NEW.photos, 1), 0);

  NEW.basic_info_completed :=
    COALESCE(NULLIF(trim(NEW.first_name), ''), '') <> ''
    AND NEW.age IS NOT NULL
    AND NEW.gender IS NOT NULL
    AND NEW.user_type IS NOT NULL;

  NEW.photos_completed := photo_count >= 3;

  NEW.location_completed :=
    COALESCE(NULLIF(trim(NEW.country), ''), '') <> ''
    OR COALESCE(NULLIF(trim(NEW.city), ''), '') <> ''
    OR (NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL);

  NEW.preferences_completed :=
    NEW.relationship_goal IS NOT NULL
    AND NEW.looking_for_gender IS NOT NULL
    AND NEW.age_preference_min IS NOT NULL
    AND NEW.age_preference_max IS NOT NULL;

  NEW.profile_completed :=
    NEW.basic_info_completed
    AND NEW.photos_completed
    AND NEW.location_completed
    AND NEW.preferences_completed;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_completion_before_write ON public.profiles;
CREATE TRIGGER sync_profile_completion_before_write
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_completion_flags();

-- ===================================================================
-- 2. INTERESTS AND STRUCTURED PROFILE PHOTOS
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_interests (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES public.interests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, interest_id)
);

CREATE TABLE IF NOT EXISTS public.profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT,
  position INTEGER NOT NULL DEFAULT 0 CHECK (position >= 0),
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, storage_path)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_interest ON public.user_interests(interest_id);
CREATE INDEX IF NOT EXISTS idx_profile_photos_user_position ON public.profile_photos(user_id, position);
CREATE INDEX IF NOT EXISTS idx_profile_photos_moderation ON public.profile_photos(moderation_status);

INSERT INTO public.interests (slug, label, category)
VALUES
  ('travel', 'Travel', 'lifestyle'),
  ('food', 'Food', 'lifestyle'),
  ('family', 'Family', 'values'),
  ('faith', 'Faith', 'values'),
  ('fitness', 'Fitness', 'lifestyle'),
  ('music', 'Music', 'culture'),
  ('movies', 'Movies', 'culture'),
  ('career', 'Career', 'values'),
  ('language-exchange', 'Language exchange', 'culture'),
  ('long-term-commitment', 'Long-term commitment', 'relationship')
ON CONFLICT (slug) DO NOTHING;

-- ===================================================================
-- 3. MATCHING, BLOCKING, REPORTING, AND MODERATION
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (blocker_id, blocked_id),
  CHECK (blocker_id <> blocked_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  resolution_note TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (reporter_id <> reported_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON public.blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON public.blocks(blocked_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON public.reports(reported_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'mutual_like'
    CHECK (source IN ('mutual_like', 'admin_seed', 'import')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'unmatched', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CHECK (user_1_id <> user_2_id),
  UNIQUE (user_1_id, user_2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user_1 ON public.matches(user_1_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_user_2 ON public.matches(user_2_id, status, created_at DESC);

CREATE OR REPLACE FUNCTION public.ordered_match_user_1(p_user_a UUID, p_user_b UUID)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT LEAST(p_user_a, p_user_b);
$$;

CREATE OR REPLACE FUNCTION public.ordered_match_user_2(p_user_a UUID, p_user_b UUID)
RETURNS UUID
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT GREATEST(p_user_a, p_user_b);
$$;

CREATE OR REPLACE FUNCTION public.has_block_between(p_user_a UUID, p_user_b UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocks
    WHERE (blocker_id = p_user_a AND blocked_id = p_user_b)
       OR (blocker_id = p_user_b AND blocked_id = p_user_a)
  );
$$;

CREATE OR REPLACE FUNCTION public.can_view_profile(p_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() = p_profile_id
    OR public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.profiles viewer
      JOIN public.profiles candidate ON candidate.id = p_profile_id
      WHERE viewer.id = auth.uid()
        AND candidate.is_active = TRUE
        AND candidate.deleted_at IS NULL
        AND candidate.profile_visibility = 'discoverable'
        AND viewer.user_type <> candidate.user_type
        AND NOT public.has_block_between(viewer.id, candidate.id)
    );
$$;

CREATE OR REPLACE FUNCTION public.can_message_profile(p_sender_id UUID, p_recipient_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p_sender_id IS NOT NULL
    AND p_recipient_id IS NOT NULL
    AND p_sender_id <> p_recipient_id
    AND NOT public.has_block_between(p_sender_id, p_recipient_id)
    AND EXISTS (
      SELECT 1
      FROM public.matches m
      WHERE m.status = 'active'
        AND m.user_1_id = public.ordered_match_user_1(p_sender_id, p_recipient_id)
        AND m.user_2_id = public.ordered_match_user_2(p_sender_id, p_recipient_id)
    );
$$;

CREATE OR REPLACE FUNCTION public.upsert_match_from_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_1 UUID;
  v_user_2 UUID;
BEGIN
  IF NEW.is_match = TRUE THEN
    v_user_1 := public.ordered_match_user_1(NEW.from_user_id, NEW.to_user_id);
    v_user_2 := public.ordered_match_user_2(NEW.from_user_id, NEW.to_user_id);

    INSERT INTO public.matches (user_1_id, user_2_id, source, status, created_at, updated_at)
    VALUES (v_user_1, v_user_2, 'mutual_like', 'active', COALESCE(NEW.matched_at, NOW()), NOW())
    ON CONFLICT (user_1_id, user_2_id) DO UPDATE
    SET status = 'active',
        updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS upsert_match_after_like ON public.likes;
CREATE TRIGGER upsert_match_after_like
  AFTER INSERT OR UPDATE OF is_match, matched_at ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.upsert_match_from_like();

INSERT INTO public.matches (user_1_id, user_2_id, source, status, created_at, updated_at)
SELECT DISTINCT
  public.ordered_match_user_1(outbound.from_user_id, outbound.to_user_id),
  public.ordered_match_user_2(outbound.from_user_id, outbound.to_user_id),
  'mutual_like',
  'active',
  COALESCE(outbound.matched_at, inbound.matched_at, NOW()),
  NOW()
FROM public.likes outbound
JOIN public.likes inbound
  ON inbound.from_user_id = outbound.to_user_id
 AND inbound.to_user_id = outbound.from_user_id
WHERE outbound.is_match = TRUE
  AND inbound.is_match = TRUE
ON CONFLICT (user_1_id, user_2_id) DO UPDATE
SET status = 'active',
    updated_at = NOW();

-- ===================================================================
-- 4. SUBSCRIPTIONS, VERIFICATION, AND LIFECYCLE EVENTS
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'revenuecat', 'manual')),
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('gold', 'platinum')),
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (provider, provider_subscription_id)
);

CREATE TABLE IF NOT EXISTS public.verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'manual',
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_review', 'approved', 'rejected')),
  document_url TEXT,
  selfie_url TEXT,
  extracted_first_name TEXT,
  extracted_last_name TEXT,
  extracted_age INTEGER,
  mismatch_reasons TEXT[],
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (delivery_status IN ('pending', 'sent', 'failed', 'skipped')),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_verification_events_user_created ON public.verification_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_events_user_type ON public.notification_events(user_id, event_type, created_at DESC);

CREATE OR REPLACE FUNCTION public.sync_profile_membership_from_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('trialing', 'active') THEN
    UPDATE public.profiles
    SET
      membership_tier = NEW.tier,
      subscription_status = NEW.status,
      premium_expires_at = NEW.current_period_end,
      is_premium = TRUE,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF NEW.status IN ('canceled', 'expired', 'past_due') THEN
    UPDATE public.profiles
    SET
      subscription_status = NEW.status,
      is_premium = FALSE,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_membership_after_subscription ON public.subscriptions;
CREATE TRIGGER sync_profile_membership_after_subscription
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_membership_from_subscription();

CREATE OR REPLACE FUNCTION public.sync_profile_verification_from_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    verification_status = CASE
      WHEN NEW.status = 'in_review' THEN 'pending'
      ELSE NEW.status
    END,
    is_verified = NEW.status = 'approved',
    verified_at = CASE WHEN NEW.status = 'approved' THEN COALESCE(NEW.reviewed_at, NOW()) ELSE verified_at END,
    updated_at = NOW()
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_profile_verification_after_event ON public.verification_events;
CREATE TRIGGER sync_profile_verification_after_event
  AFTER INSERT OR UPDATE ON public.verification_events
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_verification_from_event();

-- ===================================================================
-- 5. MESSAGE COMPATIBILITY AND SAFER CHAT POLICIES
-- ===================================================================

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS text TEXT,
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'voice', 'video', 'file')),
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text'
    CHECK (type IN ('text', 'image', 'voice', 'video', 'file')),
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent'
    CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS deleted_by UUID[],
  ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.messages(id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'messages'
      AND column_name = 'receiver_id'
  ) THEN
    UPDATE public.messages
    SET recipient_id = COALESCE(recipient_id, receiver_id);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'messages'
      AND column_name = 'content'
  ) THEN
    UPDATE public.messages
    SET text = COALESCE(text, content);
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'messages'
      AND column_name = 'message_type'
  ) THEN
    UPDATE public.messages
    SET type = COALESCE(type, message_type);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_messages_recipient_status
  ON public.messages(recipient_id, status, created_at DESC)
  WHERE is_deleted = FALSE;

CREATE OR REPLACE FUNCTION public.normalize_message_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.text := COALESCE(NEW.text, NEW.content, '');
  NEW.content := COALESCE(NEW.content, NEW.text, '');
  NEW.type := COALESCE(NEW.type, NEW.message_type, 'text');
  NEW.message_type := COALESCE(NEW.message_type, NEW.type, 'text');
  NEW.type := COALESCE(NEW.type, 'text');
  NEW.status := COALESCE(NEW.status, 'sent');
  NEW.is_deleted := COALESCE(NEW.is_deleted, FALSE);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS normalize_message_before_write ON public.messages;
CREATE TRIGGER normalize_message_before_write
  BEFORE INSERT OR UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_message_columns();

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    (auth.uid() = sender_id OR auth.uid() = recipient_id)
    AND (
      is_deleted = FALSE
      OR deleted_by IS NULL
      OR NOT (auth.uid() = ANY(deleted_by))
    )
  );

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND public.can_message_profile(sender_id, recipient_id)
  );

DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update message status or soft delete" ON public.messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  )
  WITH CHECK (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- ===================================================================
-- 6. STORAGE BUCKETS
-- ===================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('profile-photos', 'profile-photos', true),
  ('chat-images', 'chat-images', false)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public;

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversations
    WHERE id = p_conversation_id
      AND (participant_1_id = p_user_id OR participant_2_id = p_user_id)
  );
$$;

DROP POLICY IF EXISTS "Anyone can view profile photos" ON storage.objects;
CREATE POLICY "Anyone can view profile photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-photos');

DROP POLICY IF EXISTS "Users can upload own profile photos" ON storage.objects;
CREATE POLICY "Users can upload own profile photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-photos'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own profile photos" ON storage.objects;
CREATE POLICY "Users can update own profile photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own profile photos" ON storage.objects;
CREATE POLICY "Users can delete own profile photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view chat images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own chat images" ON storage.objects;
DROP POLICY IF EXISTS "Conversation participants can upload chat images" ON storage.objects;
CREATE POLICY "Conversation participants can upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images'
    AND auth.role() = 'authenticated'
    AND public.is_conversation_participant(((storage.foldername(name))[1])::uuid, auth.uid())
  );

DROP POLICY IF EXISTS "Conversation participants can view chat images" ON storage.objects;
CREATE POLICY "Conversation participants can view chat images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-images'
    AND public.is_conversation_participant(((storage.foldername(name))[1])::uuid, auth.uid())
  );

DROP POLICY IF EXISTS "Conversation participants can delete chat images" ON storage.objects;
CREATE POLICY "Conversation participants can delete chat images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-images'
    AND public.is_conversation_participant(((storage.foldername(name))[1])::uuid, auth.uid())
  );

-- ===================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ===================================================================

ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view safe profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view safe profiles" ON public.profiles
  FOR SELECT USING (public.can_view_profile(id));

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Everyone can view interests" ON public.interests;
CREATE POLICY "Everyone can view interests" ON public.interests
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Users manage own interests" ON public.user_interests;
CREATE POLICY "Users manage own interests" ON public.user_interests
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view approved profile photos" ON public.profile_photos;
CREATE POLICY "Users view approved profile photos" ON public.profile_photos
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_admin()
    OR (
      moderation_status = 'approved'
      AND public.can_view_profile(user_id)
    )
  );

DROP POLICY IF EXISTS "Users manage own profile photos" ON public.profile_photos;
CREATE POLICY "Users manage own profile photos" ON public.profile_photos
  FOR ALL USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users view own matches" ON public.matches;
CREATE POLICY "Users view own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can unmatch own matches" ON public.matches;
CREATE POLICY "Users can unmatch own matches" ON public.matches
  FOR UPDATE USING (auth.uid() = user_1_id OR auth.uid() = user_2_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_1_id OR auth.uid() = user_2_id OR public.is_admin());

DROP POLICY IF EXISTS "Users manage their blocks" ON public.blocks;
CREATE POLICY "Users manage their blocks" ON public.blocks
  FOR ALL USING (auth.uid() = blocker_id OR public.is_admin())
  WITH CHECK (auth.uid() = blocker_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can view own reports and admins view all" ON public.reports;
CREATE POLICY "Users can view own reports and admins view all" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins resolve reports" ON public.reports;
CREATE POLICY "Admins resolve reports" ON public.reports
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage subscriptions" ON public.subscriptions
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users view own verification events" ON public.verification_events;
CREATE POLICY "Users view own verification events" ON public.verification_events
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users submit verification events" ON public.verification_events;
CREATE POLICY "Users submit verification events" ON public.verification_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins review verification events" ON public.verification_events;
CREATE POLICY "Admins review verification events" ON public.verification_events
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users view own notifications" ON public.notification_events;
CREATE POLICY "Users view own notifications" ON public.notification_events
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Tighten existing swipe tables where they exist.
DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
CREATE POLICY "Users can create likes" ON public.likes
  FOR INSERT WITH CHECK (
    auth.uid() = from_user_id
    AND from_user_id <> to_user_id
    AND public.can_view_profile(to_user_id)
  );

DROP POLICY IF EXISTS "Users can create passes" ON public.passes;
CREATE POLICY "Users can create passes" ON public.passes
  FOR INSERT WITH CHECK (
    auth.uid() = from_user_id
    AND from_user_id <> to_user_id
    AND public.can_view_profile(to_user_id)
  );

-- ===================================================================
-- 8. GRANTS
-- ===================================================================

REVOKE SELECT ON public.profiles FROM anon;

GRANT SELECT ON public.interests TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_interests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_photos TO authenticated;
GRANT SELECT, UPDATE ON public.matches TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.reports TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.verification_events TO authenticated;
GRANT SELECT ON public.notification_events TO authenticated;

GRANT EXECUTE ON FUNCTION public.current_app_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_block_between(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_message_profile(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ordered_match_user_1(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ordered_match_user_2(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(UUID, UUID) TO authenticated;

-- ===================================================================
-- DONE
-- ===================================================================
