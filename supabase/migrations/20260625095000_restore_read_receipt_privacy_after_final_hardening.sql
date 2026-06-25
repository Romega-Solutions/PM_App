-- Restore read receipt privacy after final release hardening.
--
-- Reapplies the privacy-aware message read functions because the final
-- hardening migration reintroduced unconditional status/read_at writes.
--
-- Respect read receipt privacy.
-- Readers can still clear their own unread counters, but sender-visible
-- message status/read_at updates only happen when the reader enables
-- read receipts.

CREATE OR REPLACE FUNCTION public.current_user_allows_read_receipts()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (
      SELECT s.read_receipts
      FROM public.user_privacy_settings s
      WHERE s.user_id = auth.uid()
    ),
    FALSE
  );
$$;

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
  v_allow_read_receipts BOOLEAN;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_message_ids IS NULL OR cardinality(p_message_ids) = 0 THEN
    RETURN;
  END IF;

  v_allow_read_receipts := public.current_user_allows_read_receipts();

  IF NOT v_allow_read_receipts THEN
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
  v_allow_read_receipts BOOLEAN;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  v_allow_read_receipts := public.current_user_allows_read_receipts();

  IF v_allow_read_receipts THEN
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
  v_allow_read_receipts BOOLEAN;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_other_user_id IS NULL OR p_other_user_id = v_current_user THEN
    RAISE EXCEPTION 'A different member is required' USING ERRCODE = '22023';
  END IF;

  v_allow_read_receipts := public.current_user_allows_read_receipts();

  IF v_allow_read_receipts THEN
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
  v_allow_read_receipts BOOLEAN;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_status NOT IN ('sent', 'delivered', 'read') THEN
    RAISE EXCEPTION 'Unsupported message status' USING ERRCODE = '22023';
  END IF;

  IF p_status = 'read' THEN
    v_allow_read_receipts := public.current_user_allows_read_receipts();

    IF NOT v_allow_read_receipts THEN
      RETURN;
    END IF;
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

REVOKE ALL ON FUNCTION public.current_user_allows_read_receipts() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_messages_read(UUID[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_conversation_read(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.mark_pair_messages_read(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.update_message_status(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mark_messages_read(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_pair_messages_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_message_status(UUID, TEXT) TO authenticated;
