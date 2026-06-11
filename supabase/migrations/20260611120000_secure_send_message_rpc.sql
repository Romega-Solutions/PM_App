-- Route message creation through a single authenticated RPC.
-- This keeps sender identity, conversation validation, mutual-match checks, and
-- block checks on the database side instead of trusting client-provided IDs.

CREATE OR REPLACE FUNCTION public.send_message(
  p_recipient_id UUID,
  p_content TEXT DEFAULT NULL,
  p_message_type TEXT DEFAULT 'text',
  p_image_url TEXT DEFAULT NULL,
  p_conversation_id UUID DEFAULT NULL
)
RETURNS public.messages
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_conversation_id UUID;
  v_expected_conversation_id UUID;
  v_message public.messages%ROWTYPE;
  v_message_type TEXT := COALESCE(NULLIF(BTRIM(p_message_type), ''), 'text');
  v_content TEXT := COALESCE(p_content, '');
  v_image_url TEXT := NULLIF(BTRIM(COALESCE(p_image_url, '')), '');
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_recipient_id IS NULL OR p_recipient_id = v_current_user THEN
    RAISE EXCEPTION 'A different recipient is required' USING ERRCODE = '22023';
  END IF;

  IF v_message_type NOT IN ('text', 'image') THEN
    RAISE EXCEPTION 'Unsupported message type' USING ERRCODE = '22023';
  END IF;

  IF v_message_type = 'text' AND BTRIM(v_content) = '' THEN
    RAISE EXCEPTION 'Message text is required' USING ERRCODE = '22023';
  END IF;

  IF v_message_type = 'image' AND v_image_url IS NULL THEN
    RAISE EXCEPTION 'Image storage path is required' USING ERRCODE = '22023';
  END IF;

  v_expected_conversation_id := public.get_or_create_conversation(
    v_current_user,
    p_recipient_id
  );

  IF p_conversation_id IS NOT NULL AND p_conversation_id <> v_expected_conversation_id THEN
    RAISE EXCEPTION 'Conversation does not belong to this member pair' USING ERRCODE = '42501';
  END IF;

  v_conversation_id := COALESCE(p_conversation_id, v_expected_conversation_id);

  IF v_message_type = 'image' THEN
    IF v_image_url ~* '^https?://'
      OR v_image_url LIKE '/%'
      OR v_image_url LIKE '%..%'
      OR v_image_url NOT LIKE v_conversation_id::TEXT || '/%'
    THEN
      RAISE EXCEPTION 'Image storage path is not valid for this conversation' USING ERRCODE = '22023';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM storage.objects o
      WHERE o.bucket_id = 'chat-images'
        AND o.name = v_image_url
    ) THEN
      RAISE EXCEPTION 'Image storage object was not found' USING ERRCODE = '22023';
    END IF;
  END IF;

  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    recipient_id,
    content,
    message_type,
    text,
    type,
    image_url,
    status,
    is_deleted,
    is_read
  )
  VALUES (
    v_conversation_id,
    v_current_user,
    p_recipient_id,
    CASE WHEN v_message_type = 'text' THEN BTRIM(v_content) ELSE '' END,
    v_message_type,
    CASE WHEN v_message_type = 'text' THEN BTRIM(v_content) ELSE '' END,
    v_message_type,
    CASE WHEN v_message_type = 'image' THEN v_image_url ELSE NULL END,
    'sent',
    FALSE,
    FALSE
  )
  RETURNING * INTO v_message;

  RETURN v_message;
END;
$$;

REVOKE ALL ON FUNCTION public.send_message(UUID, TEXT, TEXT, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_message(UUID, TEXT, TEXT, TEXT, UUID) TO authenticated;

-- Message creation must go through public.send_message so the database owns
-- sender identity and pair validation.
REVOKE INSERT ON public.messages FROM authenticated;
GRANT SELECT ON public.messages TO authenticated;
