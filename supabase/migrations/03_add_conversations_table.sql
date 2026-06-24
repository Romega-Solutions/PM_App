-- ===================================================================
-- ADD CONVERSATIONS TABLE (SAFE MIGRATION)
-- ===================================================================
-- This migration works with your EXISTING messages schema
-- Only adds what's missing, doesn't modify existing data
-- ===================================================================

-- ===================================================================
-- STEP 1: ADD MISSING COLUMNS TO MESSAGES (SAFE - IF NOT EXISTS)
-- ===================================================================

-- Add deleted_by array for "delete for me" functionality
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by UUID[];

-- Add reply support (optional feature)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES messages(id);

-- Keep fresh database runs compatible with later hardening migrations that
-- standardize chat message body reads on messages.text.
ALTER TABLE messages ADD COLUMN IF NOT EXISTS text TEXT;

-- ===================================================================
-- STEP 2: CREATE CONVERSATIONS TABLE
-- ===================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Cache last message for performance
  last_message_id UUID REFERENCES public.messages(id),
  last_message_text TEXT,
  last_message_sender_id UUID REFERENCES public.profiles(id),
  last_message_at TIMESTAMPTZ,
  
  -- Unread counts for each participant
  participant_1_unread_count INTEGER DEFAULT 0,
  participant_2_unread_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure unique conversation pairs (both orderings)
  CONSTRAINT unique_participants UNIQUE (participant_1_id, participant_2_id),
  CONSTRAINT participants_not_same CHECK (participant_1_id != participant_2_id)
);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- ===================================================================
-- STEP 3: ADD conversation_id TO MESSAGES
-- ===================================================================

ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Create index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at DESC);

-- ===================================================================
-- STEP 4: RLS POLICIES FOR CONVERSATIONS
-- ===================================================================

-- Drop if exists (safe)
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

-- Users can view conversations they're part of
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid()::uuid = participant_1_id OR auth.uid()::uuid = participant_2_id
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = participant_1_id OR auth.uid()::uuid = participant_2_id
  );

-- Users can update their own conversations (unread counts)
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid()::uuid = participant_1_id OR auth.uid()::uuid = participant_2_id
  );

-- ===================================================================
-- STEP 5: CREATE FUNCTION TO GET OR CREATE CONVERSATION
-- ===================================================================

CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_1_id UUID;
  v_participant_2_id UUID;
BEGIN
  -- Order participants to avoid duplicates
  IF p_user1_id < p_user2_id THEN
    v_participant_1_id := p_user1_id;
    v_participant_2_id := p_user2_id;
  ELSE
    v_participant_1_id := p_user2_id;
    v_participant_2_id := p_user1_id;
  END IF;
  
  -- Try to get existing conversation
  SELECT id INTO v_conversation_id
  FROM public.conversations
  WHERE participant_1_id = v_participant_1_id 
    AND participant_2_id = v_participant_2_id;
  
  -- Create if doesn't exist
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.conversations (participant_1_id, participant_2_id)
    VALUES (v_participant_1_id, v_participant_2_id)
    RETURNING id INTO v_conversation_id;
  END IF;
  
  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, UUID) TO authenticated;

-- ===================================================================
-- STEP 6: CREATE FUNCTION TO RESET UNREAD COUNT
-- ===================================================================

CREATE OR REPLACE FUNCTION public.reset_unread_count(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.conversations
  SET 
    participant_1_unread_count = CASE 
      WHEN participant_1_id = p_user_id THEN 0
      ELSE participant_1_unread_count
    END,
    participant_2_unread_count = CASE 
      WHEN participant_2_id = p_user_id THEN 0
      ELSE participant_2_unread_count
    END,
    updated_at = NOW()
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.reset_unread_count(UUID, UUID) TO authenticated;

-- ===================================================================
-- STEP 7: CREATE FUNCTION TO UPDATE CONVERSATION ON NEW MESSAGE
-- ===================================================================

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if conversation_id is set
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE public.conversations
    SET 
      last_message_id = NEW.id,
      last_message_text = NEW.text,
      last_message_sender_id = NEW.sender_id,
      last_message_at = NEW.created_at,
      updated_at = NOW(),
      -- Increment unread count for recipient
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- STEP 8: CREATE TRIGGER FOR CONVERSATION UPDATES
-- ===================================================================

DROP TRIGGER IF EXISTS on_message_insert_update_conversation ON public.messages;
CREATE TRIGGER on_message_insert_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- ===================================================================
-- STEP 9: BACKFILL CONVERSATIONS FROM EXISTING MESSAGES (OPTIONAL)
-- ===================================================================
-- This creates conversations for all existing message pairs
-- Run this if you want to populate conversations for your 49 messages

DO $$
DECLARE
  msg_record RECORD;
  conv_id UUID;
BEGIN
  FOR msg_record IN 
    SELECT DISTINCT 
      LEAST(sender_id, recipient_id) as participant_1_id,
      GREATEST(sender_id, recipient_id) as participant_2_id
    FROM messages
  LOOP
    -- Get or create conversation
    SELECT get_or_create_conversation(
      msg_record.participant_1_id, 
      msg_record.participant_2_id
    ) INTO conv_id;
    
    -- Update messages with conversation_id
    UPDATE messages
    SET conversation_id = conv_id
    WHERE (
      (sender_id = msg_record.participant_1_id AND recipient_id = msg_record.participant_2_id)
      OR (sender_id = msg_record.participant_2_id AND recipient_id = msg_record.participant_1_id)
    )
    AND conversation_id IS NULL;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete!';
END $$;

-- ===================================================================
-- STEP 10: UPDATE CONVERSATIONS WITH LAST MESSAGE INFO
-- ===================================================================
-- This populates last_message fields from existing messages

UPDATE public.conversations c
SET 
  last_message_id = latest.id,
  last_message_text = latest.text,
  last_message_sender_id = latest.sender_id,
  last_message_at = latest.created_at
FROM (
  SELECT DISTINCT ON (conversation_id)
    conversation_id,
    id,
    text,
    sender_id,
    created_at
  FROM messages
  WHERE conversation_id IS NOT NULL
  ORDER BY conversation_id, created_at DESC
) latest
WHERE c.id = latest.conversation_id;

-- ===================================================================
-- SUCCESS! 
-- ===================================================================
-- ✅ Conversations table created
-- ✅ conversation_id added to messages
-- ✅ All helper functions created
-- ✅ Trigger set up for auto-updates
-- ✅ Existing 49 messages backfilled with conversation IDs
-- ✅ Last message info populated
-- 
-- Your chat system is now optimized and ready!
-- ===================================================================
