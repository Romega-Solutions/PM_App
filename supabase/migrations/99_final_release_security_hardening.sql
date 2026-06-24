-- PinayMate final release hardening.
--
-- This migration intentionally runs after the older setup/fix scripts. Some
-- earlier scripts grant broad table access or recreate permissive policies for
-- local repair work; this file reasserts the production contract that the app
-- should ship with.

BEGIN;

-- -------------------------------------------------------------------
-- Profile access
-- -------------------------------------------------------------------
-- Direct profile reads stay row-scoped to the signed-in user's own row.
-- Public discovery uses the discoverable_profiles view below, which exposes
-- only safe card fields.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.profiles FROM authenticated;
GRANT SELECT ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can discover active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Conversation participants can read profile cards" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

DO $$
DECLARE
  v_insert_columns TEXT;
  v_update_columns TEXT;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
  INTO v_insert_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = ANY (ARRAY[
      'id',
      'email',
      'first_name',
      'last_name',
      'age',
      'gender',
      'user_type',
      'occupation',
      'education',
      'photos',
      'bio',
      'country',
      'city',
      'latitude',
      'longitude',
      'height_cm',
      'body_type',
      'relationship_goal',
      'languages',
      'interests',
      'looking_for_gender',
      'age_preference_min',
      'age_preference_max',
      'distance_preference_km',
      'basic_info_completed',
      'photos_completed',
      'location_name',
      'location_address',
      'location_latitude',
      'location_longitude',
      'location_place_id',
      'location_type',
      'location_coordinates',
      'location_timestamp',
      'location_completed',
      'interested_in',
      'age_min',
      'age_max',
      'max_distance_km',
      'preferences_completed',
      'created_at',
      'updated_at'
    ]);

  IF v_insert_columns IS NOT NULL THEN
    EXECUTE format('GRANT INSERT (%s) ON public.profiles TO authenticated', v_insert_columns);
  END IF;

  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
  INTO v_update_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = ANY (ARRAY[
      'first_name',
      'last_name',
      'age',
      'occupation',
      'education',
      'photos',
      'bio',
      'country',
      'city',
      'latitude',
      'longitude',
      'height_cm',
      'body_type',
      'relationship_goal',
      'languages',
      'interests',
      'looking_for_gender',
      'age_preference_min',
      'age_preference_max',
      'distance_preference_km',
      'basic_info_completed',
      'photos_completed',
      'location_name',
      'location_address',
      'location_latitude',
      'location_longitude',
      'location_place_id',
      'location_type',
      'location_coordinates',
      'location_timestamp',
      'location_completed',
      'interested_in',
      'age_min',
      'age_max',
      'max_distance_km',
      'preferences_completed',
      'updated_at'
    ]);

  IF v_update_columns IS NOT NULL THEN
    EXECUTE format('GRANT UPDATE (%s) ON public.profiles TO authenticated', v_update_columns);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_verification(
  p_selfie_uri TEXT,
  p_document_uri TEXT,
  p_extracted_first_name TEXT DEFAULT NULL,
  p_extracted_last_name TEXT DEFAULT NULL,
  p_extracted_age INTEGER DEFAULT NULL,
  p_mismatch_reasons TEXT[] DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_selfie_path TEXT;
  v_document_path TEXT;
  v_selfie_exists BOOLEAN;
  v_document_exists BOOLEAN;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  v_selfie_path := BTRIM(COALESCE(p_selfie_uri, ''));
  v_document_path := BTRIM(COALESCE(p_document_uri, ''));

  IF v_selfie_path = ''
    OR v_document_path = ''
  THEN
    RAISE EXCEPTION 'Selfie and document are required' USING ERRCODE = '22023';
  END IF;

  IF split_part(v_selfie_path, '/', 1) <> v_current_user::TEXT
    OR split_part(v_document_path, '/', 1) <> v_current_user::TEXT
  THEN
    RAISE EXCEPTION 'Verification files must belong to the authenticated user'
      USING ERRCODE = '42501';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'verification-docs'
      AND name = v_selfie_path
  )
  INTO v_selfie_exists;

  SELECT EXISTS (
    SELECT 1
    FROM storage.objects
    WHERE bucket_id = 'verification-docs'
      AND name = v_document_path
  )
  INTO v_document_exists;

  IF NOT v_selfie_exists OR NOT v_document_exists THEN
    RAISE EXCEPTION 'Verification files must be uploaded before submission'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET
    verification_selfie = v_selfie_path,
    verification_document = v_document_path,
    verification_extracted_first_name = p_extracted_first_name,
    verification_extracted_last_name = p_extracted_last_name,
    verification_extracted_age = p_extracted_age,
    verification_mismatch_reasons = p_mismatch_reasons,
    verification_completed = TRUE,
    verification_status = 'pending',
    is_verified = FALSE,
    verified_at = NULL,
    updated_at = NOW()
  WHERE id = v_current_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_verification_submission()
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

  UPDATE public.profiles
  SET
    verification_selfie = NULL,
    verification_document = NULL,
    verification_extracted_first_name = NULL,
    verification_extracted_last_name = NULL,
    verification_extracted_age = NULL,
    verification_mismatch_reasons = NULL,
    verification_completed = FALSE,
    verification_status = 'pending',
    is_verified = FALSE,
    verified_at = NULL,
    updated_at = NOW()
  WHERE id = v_current_user;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_verification(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.clear_verification_submission() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_verification(TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clear_verification_submission() TO authenticated;

DROP VIEW IF EXISTS public.discoverable_profiles;
CREATE VIEW public.discoverable_profiles
WITH (security_invoker = false) AS
SELECT
  p.id,
  p.first_name,
  p.age,
  p.gender,
  p.user_type,
  p.photos,
  p.bio,
  p.country,
  p.city,
  p.height_cm,
  p.body_type,
  p.education,
  p.occupation,
  p.relationship_goal,
  p.languages,
  p.interests,
  p.looking_for_gender,
  p.age_preference_min,
  p.age_preference_max,
  p.distance_preference_km,
  p.is_verified,
  CASE
    WHEN COALESCE(privacy_settings.show_online_status, FALSE)
      THEN COALESCE(p.is_active, FALSE)
    ELSE FALSE
  END AS is_active,
  p.is_premium,
  p.created_at,
  CASE
    WHEN COALESCE(privacy_settings.show_online_status, FALSE)
      THEN p.last_active_at
    ELSE NULL
  END AS last_active_at
FROM public.profiles p
LEFT JOIN public.user_privacy_settings privacy_settings
  ON privacy_settings.user_id = p.id
WHERE p.is_active = TRUE
  AND p.is_verified = TRUE
  AND COALESCE(privacy_settings.profile_visible, TRUE) = TRUE
  AND p.id <> (SELECT auth.uid())
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_blocks b
    WHERE (
      b.blocker_id = (SELECT auth.uid())
      AND b.blocked_user_id = p.id
    )
    OR (
      b.blocker_id = p.id
      AND b.blocked_user_id = (SELECT auth.uid())
    )
  );

REVOKE ALL ON public.discoverable_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.discoverable_profiles TO authenticated;

-- -------------------------------------------------------------------
-- Reports
-- -------------------------------------------------------------------
-- Report creation goes through an RPC so conversation-scoped reports cannot
-- attach arbitrary conversation IDs.

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_reports FROM anon;
REVOKE ALL ON public.user_reports FROM authenticated;
GRANT SELECT ON public.user_reports TO authenticated;

DROP POLICY IF EXISTS "Users can create own reports" ON public.user_reports;
DROP POLICY IF EXISTS "Users can read own reports" ON public.user_reports;

CREATE POLICY "Users can read own reports"
  ON public.user_reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.submit_user_report(
  p_reported_user_id UUID,
  p_reason TEXT,
  p_details TEXT DEFAULT '',
  p_conversation_id UUID DEFAULT NULL,
  p_source TEXT DEFAULT 'app'
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

  IF p_reported_user_id IS NULL OR p_reported_user_id = v_current_user THEN
    RAISE EXCEPTION 'Choose a different member to report' USING ERRCODE = '22023';
  END IF;

  IF COALESCE(NULLIF(trim(p_reason), ''), '') = '' THEN
    RAISE EXCEPTION 'Report reason is required' USING ERRCODE = '22023';
  END IF;

  IF p_conversation_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.conversations c
      WHERE c.id = p_conversation_id
        AND (
          (
            c.participant_1_id = v_current_user
            AND c.participant_2_id = p_reported_user_id
          )
          OR (
            c.participant_1_id = p_reported_user_id
            AND c.participant_2_id = v_current_user
          )
        )
    )
  THEN
    RAISE EXCEPTION 'Report conversation does not match this member' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_reports (
    reporter_id,
    reported_user_id,
    conversation_id,
    reason,
    details,
    source
  )
  VALUES (
    v_current_user,
    p_reported_user_id,
    p_conversation_id,
    trim(p_reason),
    COALESCE(trim(p_details), ''),
    COALESCE(NULLIF(trim(p_source), ''), 'app')
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_user_report(UUID, TEXT, TEXT, UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_user_report(UUID, TEXT, TEXT, UUID, TEXT) TO authenticated;

-- -------------------------------------------------------------------
-- Likes and matches
-- -------------------------------------------------------------------
-- Clients may read their own like graph, but match state is written only by
-- the SECURITY DEFINER RPC. This prevents forged is_match updates.

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.likes FROM anon;
REVOKE ALL ON public.likes FROM authenticated;
GRANT SELECT ON public.likes TO authenticated;

DROP POLICY IF EXISTS "Users can view their likes" ON public.likes;
DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
DROP POLICY IF EXISTS "Users can update their likes" ON public.likes;

CREATE POLICY "Users can view their likes"
  ON public.likes
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = from_user_id
    OR (SELECT auth.uid()) = to_user_id
  );

CREATE OR REPLACE FUNCTION public.like_profile(
  p_to_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  is_match BOOLEAN,
  matched_profile JSONB,
  error TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_like_id UUID;
  v_mutual_like_id UUID;
  v_matched_at TIMESTAMPTZ := NOW();
  v_matched_profile JSONB;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_to_user_id IS NULL OR p_to_user_id = v_current_user THEN
    RAISE EXCEPTION 'A different member is required' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.user_blocks b
    WHERE (
      b.blocker_id = v_current_user
      AND b.blocked_user_id = p_to_user_id
    )
    OR (
      b.blocker_id = p_to_user_id
      AND b.blocked_user_id = v_current_user
    )
  ) THEN
    RAISE EXCEPTION 'This member is unavailable because of a safety setting' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.likes (
    from_user_id,
    to_user_id,
    is_match,
    matched_at
  )
  VALUES (
    v_current_user,
    p_to_user_id,
    FALSE,
    NULL
  )
  ON CONFLICT (from_user_id, to_user_id) DO NOTHING
  RETURNING id INTO v_like_id;

  IF v_like_id IS NULL THEN
    SELECT id
    INTO v_like_id
    FROM public.likes
    WHERE from_user_id = v_current_user
      AND to_user_id = p_to_user_id;
  END IF;

  SELECT id
  INTO v_mutual_like_id
  FROM public.likes
  WHERE from_user_id = p_to_user_id
    AND to_user_id = v_current_user;

  IF v_mutual_like_id IS NOT NULL THEN
    UPDATE public.likes
    SET
      is_match = TRUE,
      matched_at = COALESCE(matched_at, v_matched_at)
    WHERE id IN (v_like_id, v_mutual_like_id);

    SELECT to_jsonb(dp)
    INTO v_matched_profile
    FROM public.discoverable_profiles dp
    WHERE dp.id = p_to_user_id;

    RETURN QUERY SELECT TRUE, TRUE, v_matched_profile, NULL::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, FALSE, NULL::JSONB, NULL::TEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.like_profile(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.like_profile(UUID) TO authenticated;

-- -------------------------------------------------------------------
-- Passes
-- -------------------------------------------------------------------

ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.passes FROM anon;
REVOKE ALL ON public.passes FROM authenticated;
GRANT SELECT, DELETE ON public.passes TO authenticated;

DROP POLICY IF EXISTS "Users can view their passes" ON public.passes;
DROP POLICY IF EXISTS "Users can create passes" ON public.passes;
DROP POLICY IF EXISTS "Users can delete own passes" ON public.passes;

CREATE POLICY "Users can view their passes"
  ON public.passes
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = from_user_id);

CREATE POLICY "Users can create passes"
  ON public.passes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = from_user_id
    AND from_user_id <> to_user_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks b
      WHERE (
        b.blocker_id = from_user_id
        AND b.blocked_user_id = to_user_id
      )
      OR (
        b.blocker_id = to_user_id
        AND b.blocked_user_id = from_user_id
      )
    )
  );

CREATE POLICY "Users can delete own passes"
  ON public.passes
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = from_user_id);

CREATE OR REPLACE FUNCTION public.pass_profile(p_to_user_id UUID)
RETURNS BOOLEAN
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

  IF p_to_user_id IS NULL THEN
    RAISE EXCEPTION 'Profile is required' USING ERRCODE = '22023';
  END IF;

  IF p_to_user_id = v_current_user THEN
    RAISE EXCEPTION 'Cannot pass yourself' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.discoverable_profiles dp
    WHERE dp.id = p_to_user_id
  ) THEN
    RAISE EXCEPTION 'Profile is not available for passing' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.passes (from_user_id, to_user_id)
  VALUES (v_current_user, p_to_user_id)
  ON CONFLICT (from_user_id, to_user_id) DO NOTHING;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.pass_profile(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pass_profile(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.undo_last_swipe()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_like_id UUID;
  v_like_to_user_id UUID;
  v_like_created_at TIMESTAMPTZ;
  v_pass_id UUID;
  v_pass_created_at TIMESTAMPTZ;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT id, to_user_id, created_at
  INTO v_like_id, v_like_to_user_id, v_like_created_at
  FROM public.likes
  WHERE from_user_id = v_current_user
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT id, created_at
  INTO v_pass_id, v_pass_created_at
  FROM public.passes
  WHERE from_user_id = v_current_user
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_like_id IS NULL AND v_pass_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF v_like_id IS NOT NULL
    AND (
      v_pass_id IS NULL
      OR v_like_created_at >= v_pass_created_at
    )
  THEN
    DELETE FROM public.likes
    WHERE id = v_like_id
      AND from_user_id = v_current_user;

    UPDATE public.likes
    SET
      is_match = FALSE,
      matched_at = NULL
    WHERE from_user_id = v_like_to_user_id
      AND to_user_id = v_current_user;

    RETURN TRUE;
  END IF;

  DELETE FROM public.passes
  WHERE id = v_pass_id
    AND from_user_id = v_current_user;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.undo_last_swipe() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.undo_last_swipe() TO authenticated;

-- -------------------------------------------------------------------
-- Conversation and message safety after blocks
-- -------------------------------------------------------------------

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.conversations FROM anon;
REVOKE ALL ON public.conversations FROM authenticated;
GRANT SELECT ON public.conversations TO authenticated;

DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    (
      participant_1_id = (SELECT auth.uid())
      OR participant_2_id = (SELECT auth.uid())
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks b
      WHERE (
        b.blocker_id = public.conversations.participant_1_id
        AND b.blocked_user_id = public.conversations.participant_2_id
      )
      OR (
        b.blocker_id = public.conversations.participant_2_id
        AND b.blocked_user_id = public.conversations.participant_1_id
      )
    )
  );

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
    CASE
      WHEN COALESCE(privacy_settings.show_online_status, FALSE)
        THEN COALESCE(p.is_active, FALSE)
      ELSE FALSE
    END,
    CASE
      WHEN COALESCE(privacy_settings.show_online_status, FALSE)
        THEN p.last_active_at
      ELSE NULL
    END,
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
  LEFT JOIN public.user_privacy_settings privacy_settings
    ON privacy_settings.user_id = p.id
  WHERE c.last_message_id IS NOT NULL
    AND (
      c.participant_1_id = v_current_user
      OR c.participant_2_id = v_current_user
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks b
      WHERE (
        b.blocker_id = c.participant_1_id
        AND b.blocked_user_id = c.participant_2_id
      )
      OR (
        b.blocker_id = c.participant_2_id
          AND b.blocked_user_id = c.participant_1_id
        )
    )
    AND EXISTS (
      SELECT 1
      FROM public.likes l1
      JOIN public.likes l2
        ON l2.from_user_id = p.id
       AND l2.to_user_id = v_current_user
       AND l2.is_match = TRUE
      WHERE l1.from_user_id = v_current_user
        AND l1.to_user_id = p.id
        AND l1.is_match = TRUE
    )
  ORDER BY c.updated_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_user_conversations(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_conversations(UUID) TO authenticated;

COMMENT ON FUNCTION public.get_user_conversations(UUID) IS
  'App-facing conversation list; hides empty rows and returns only matched, unblocked conversations with a real last message.';

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

  IF NOT EXISTS (
    SELECT 1
    FROM public.likes l1
    JOIN public.likes l2
      ON l2.from_user_id = p_user2_id
     AND l2.to_user_id = p_user1_id
     AND l2.is_match = TRUE
    WHERE l1.from_user_id = p_user1_id
      AND l1.to_user_id = p_user2_id
      AND l1.is_match = TRUE
  ) THEN
    RAISE EXCEPTION 'Conversation requires a mutual match' USING ERRCODE = '42501';
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

-- This helper is intentionally private to SECURITY DEFINER message creation.
-- Direct app-client execution can create empty visible conversation rows for
-- matched members without sending a message.
REVOKE ALL ON FUNCTION public.get_or_create_conversation(UUID, UUID)
  FROM PUBLIC, anon, authenticated, service_role;

COMMENT ON FUNCTION public.get_or_create_conversation(UUID, UUID) IS
  'Private helper for send_message; direct client execution is denied to prevent empty conversation creation.';

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.messages FROM anon;
REVOKE ALL ON public.messages FROM authenticated;
GRANT SELECT ON public.messages TO authenticated;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    (
      (SELECT auth.uid()) = sender_id
      OR (SELECT auth.uid()) = recipient_id
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
    AND EXISTS (
      SELECT 1
      FROM public.likes l1
      JOIN public.likes l2
        ON l2.from_user_id = public.messages.recipient_id
       AND l2.to_user_id = public.messages.sender_id
       AND l2.is_match = TRUE
      WHERE l1.from_user_id = public.messages.sender_id
        AND l1.to_user_id = public.messages.recipient_id
        AND l1.is_match = TRUE
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

DROP POLICY IF EXISTS "Conversation participants can update message state" ON public.messages;
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE OR REPLACE FUNCTION public.mark_messages_read(
  p_message_ids UUID[]
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

  IF p_message_ids IS NULL OR cardinality(p_message_ids) = 0 THEN
    RETURN;
  END IF;

  UPDATE public.messages m
  SET
    status = 'read',
    read_at = COALESCE(m.read_at, NOW()),
    updated_at = NOW()
  WHERE m.id = ANY(p_message_ids)
    AND m.recipient_id = v_current_user
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks b
      WHERE (
        b.blocker_id = m.sender_id
        AND b.blocked_user_id = m.recipient_id
      )
      OR (
        b.blocker_id = m.recipient_id
        AND b.blocked_user_id = m.sender_id
      )
    )
    AND EXISTS (
      SELECT 1
      FROM public.likes l1
      JOIN public.likes l2
        ON l2.from_user_id = m.recipient_id
       AND l2.to_user_id = m.sender_id
       AND l2.is_match = TRUE
      WHERE l1.from_user_id = m.sender_id
        AND l1.to_user_id = m.recipient_id
        AND l1.is_match = TRUE
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(
  p_conversation_id UUID
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

  UPDATE public.messages m
  SET
    status = 'read',
    read_at = COALESCE(m.read_at, NOW()),
    updated_at = NOW()
  FROM public.conversations c
  WHERE c.id = p_conversation_id
    AND m.conversation_id = c.id
    AND m.recipient_id = v_current_user
    AND COALESCE(m.status, 'sent') <> 'read'
    AND (
      c.participant_1_id = v_current_user
      OR c.participant_2_id = v_current_user
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks b
      WHERE (
        b.blocker_id = c.participant_1_id
        AND b.blocked_user_id = c.participant_2_id
      )
      OR (
        b.blocker_id = c.participant_2_id
        AND b.blocked_user_id = c.participant_1_id
      )
    )
    AND EXISTS (
      SELECT 1
      FROM public.likes l1
      JOIN public.likes l2
        ON l2.from_user_id = CASE
          WHEN c.participant_1_id = v_current_user THEN c.participant_2_id
          ELSE c.participant_1_id
        END
       AND l2.to_user_id = v_current_user
       AND l2.is_match = TRUE
      WHERE l1.from_user_id = v_current_user
        AND l1.to_user_id = CASE
          WHEN c.participant_1_id = v_current_user THEN c.participant_2_id
          ELSE c.participant_1_id
        END
        AND l1.is_match = TRUE
    );

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

CREATE OR REPLACE FUNCTION public.mark_pair_messages_read(
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

  UPDATE public.messages m
  SET
    status = 'read',
    read_at = COALESCE(m.read_at, NOW()),
    is_read = TRUE,
    updated_at = NOW()
  WHERE m.sender_id = p_other_user_id
    AND m.recipient_id = v_current_user
    AND COALESCE(m.status, 'sent') <> 'read'
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks b
      WHERE (
        b.blocker_id = p_other_user_id
        AND b.blocked_user_id = v_current_user
      )
      OR (
        b.blocker_id = v_current_user
        AND b.blocked_user_id = p_other_user_id
      )
    )
    AND EXISTS (
      SELECT 1
      FROM public.likes l1
      JOIN public.likes l2
        ON l2.from_user_id = p_other_user_id
       AND l2.to_user_id = v_current_user
       AND l2.is_match = TRUE
      WHERE l1.from_user_id = v_current_user
        AND l1.to_user_id = p_other_user_id
        AND l1.is_match = TRUE
    );

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
  WHERE (
      participant_1_id = v_current_user
      AND participant_2_id = p_other_user_id
    )
    OR (
      participant_1_id = p_other_user_id
      AND participant_2_id = v_current_user
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_message_status(
  p_message_id UUID,
  p_status TEXT
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

  IF p_status NOT IN ('sent', 'delivered', 'read') THEN
    RAISE EXCEPTION 'Unsupported message status' USING ERRCODE = '22023';
  END IF;

  UPDATE public.messages m
  SET
    status = p_status,
    read_at = CASE
      WHEN p_status = 'read' THEN COALESCE(m.read_at, NOW())
      ELSE m.read_at
    END,
    updated_at = NOW()
  WHERE m.id = p_message_id
    AND (
      (p_status = 'read' AND m.recipient_id = v_current_user)
      OR (p_status IN ('sent', 'delivered') AND m.sender_id = v_current_user)
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.user_blocks b
      WHERE (
        b.blocker_id = m.sender_id
        AND b.blocked_user_id = m.recipient_id
      )
      OR (
        b.blocker_id = m.recipient_id
        AND b.blocked_user_id = m.sender_id
      )
    )
    AND EXISTS (
      SELECT 1
      FROM public.likes l1
      JOIN public.likes l2
        ON l2.from_user_id = m.recipient_id
       AND l2.to_user_id = m.sender_id
       AND l2.is_match = TRUE
      WHERE l1.from_user_id = m.sender_id
        AND l1.to_user_id = m.recipient_id
        AND l1.is_match = TRUE
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_message_for_me(
  p_message_id UUID
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

  UPDATE public.messages m
  SET
    deleted_by = CASE
      WHEN m.deleted_by IS NULL THEN ARRAY[v_current_user]
      WHEN v_current_user = ANY(m.deleted_by) THEN m.deleted_by
      ELSE array_append(m.deleted_by, v_current_user)
    END,
    updated_at = NOW()
  WHERE m.id = p_message_id
    AND (
      m.sender_id = v_current_user
      OR m.recipient_id = v_current_user
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_message_for_everyone(
  p_message_id UUID
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

  UPDATE public.messages m
  SET
    is_deleted = TRUE,
    updated_at = NOW()
  WHERE m.id = p_message_id
    AND m.sender_id = v_current_user;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_messages_read(UUID[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_conversation_read(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_pair_messages_read(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_message_status(UUID, TEXT) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_message_for_me(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.delete_message_for_everyone(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_messages_read(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_pair_messages_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_message_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_message_for_me(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_message_for_everyone(UUID) TO authenticated;

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
        AND EXISTS (
          SELECT 1
          FROM public.likes l1
          JOIN public.likes l2
            ON l2.from_user_id = CASE
              WHEN c.participant_1_id = (SELECT auth.uid()) THEN c.participant_2_id
              ELSE c.participant_1_id
            END
           AND l2.to_user_id = (SELECT auth.uid())
           AND l2.is_match = TRUE
          WHERE l1.from_user_id = (SELECT auth.uid())
            AND l1.to_user_id = CASE
              WHEN c.participant_1_id = (SELECT auth.uid()) THEN c.participant_2_id
              ELSE c.participant_1_id
            END
            AND l1.is_match = TRUE
        )
        AND NOT EXISTS (
          SELECT 1
          FROM public.user_blocks b
          WHERE (
            b.blocker_id = c.participant_1_id
            AND b.blocked_user_id = c.participant_2_id
          )
          OR (
            b.blocker_id = c.participant_2_id
            AND b.blocked_user_id = c.participant_1_id
          )
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
        AND EXISTS (
          SELECT 1
          FROM public.likes l1
          JOIN public.likes l2
            ON l2.from_user_id = CASE
              WHEN c.participant_1_id = (SELECT auth.uid()) THEN c.participant_2_id
              ELSE c.participant_1_id
            END
           AND l2.to_user_id = (SELECT auth.uid())
           AND l2.is_match = TRUE
          WHERE l1.from_user_id = (SELECT auth.uid())
            AND l1.to_user_id = CASE
              WHEN c.participant_1_id = (SELECT auth.uid()) THEN c.participant_2_id
              ELSE c.participant_1_id
            END
            AND l1.is_match = TRUE
        )
        AND NOT EXISTS (
          SELECT 1
          FROM public.user_blocks b
          WHERE (
            b.blocker_id = c.participant_1_id
            AND b.blocked_user_id = c.participant_2_id
          )
          OR (
            b.blocker_id = c.participant_2_id
            AND b.blocked_user_id = c.participant_1_id
          )
        )
    )
  );

COMMIT;
