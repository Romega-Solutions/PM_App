-- Hide empty conversation rows from the app-facing inbox.
--
-- Conversations are still created by public.send_message(), but app-facing
-- conversation lists should only show threads that have at least one real
-- message. This protects users from old or accidental empty conversation rows.

BEGIN;

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

COMMIT;