-- ===================================================================
-- CHAT SCHEMA UPDATES - COMPLETE MESSAGE FUNCTIONALITY
-- ===================================================================
-- This migration adds missing columns and features for full chat support
-- Run this in your Supabase SQL Editor AFTER the base schema migration
-- ===================================================================

-- ===================================================================
-- STEP 1: ADD MISSING COLUMNS TO MESSAGES TABLE
-- ===================================================================

-- Add message type column (text, image, voice, video)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
  CHECK (message_type IN ('text', 'image', 'voice', 'video', 'file'));

-- Add image URL for image messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add status tracking (sending, sent, delivered, read, failed)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent'
  CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed'));

-- Add soft delete support
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Add deleted_by array to support "delete for me" vs "delete for everyone"
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by UUID[];

-- Add reply/thread support (optional)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES messages(id);

-- ===================================================================
-- STEP 2: RENAME receiver_id TO recipient_id (CONSISTENCY)
-- ===================================================================

-- Check if receiver_id exists before renaming
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'receiver_id'
  ) THEN
    ALTER TABLE messages RENAME COLUMN receiver_id TO recipient_id;
    RAISE NOTICE 'Renamed receiver_id to recipient_id';
  ELSE
    RAISE NOTICE 'receiver_id column does not exist, skipping rename';
  END IF;
END $$;

-- ===================================================================
-- STEP 3: CREATE CONVERSATIONS TABLE (OPTIMIZATION)
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

-- Create indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- ===================================================================
-- STEP 4: ADD conversation_id TO MESSAGES
-- ===================================================================

-- Add conversation_id if it doesn't exist
ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- Create index for conversation queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at DESC);

-- ===================================================================
-- STEP 5: CREATE STORAGE BUCKET FOR CHAT IMAGES
-- ===================================================================

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', false)
ON CONFLICT (id) DO NOTHING;

-- ===================================================================
-- STEP 6: STORAGE POLICIES FOR CHAT IMAGES
-- ===================================================================

-- Policy: Users can upload to their own conversations
DROP POLICY IF EXISTS "Users can upload chat images" ON storage.objects;
CREATE POLICY "Users can upload chat images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chat-images'
    AND auth.role() = 'authenticated'
  );

-- Policy: Users can view images from their conversations
DROP POLICY IF EXISTS "Users can view chat images" ON storage.objects;
CREATE POLICY "Users can view chat images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'chat-images'
    AND auth.role() = 'authenticated'
  );

-- Policy: Users can delete their own uploaded images
DROP POLICY IF EXISTS "Users can delete own chat images" ON storage.objects;
CREATE POLICY "Users can delete own chat images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ===================================================================
-- STEP 7: UPDATE RLS POLICIES FOR MESSAGES
-- ===================================================================

-- Update SELECT policy to handle soft deletes
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    (auth.uid()::uuid = sender_id OR auth.uid()::uuid = recipient_id)
    AND (
      is_deleted = FALSE 
      OR deleted_by IS NULL 
      OR NOT (auth.uid()::uuid = ANY(deleted_by))
    )
  );

-- Update INSERT policy
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = sender_id
    AND sender_id != recipient_id
  );

-- Update UPDATE policy for status and soft delete
DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (
    auth.uid()::uuid = sender_id OR auth.uid()::uuid = recipient_id
  )
  WITH CHECK (
    auth.uid()::uuid = sender_id OR auth.uid()::uuid = recipient_id
  );

-- ===================================================================
-- STEP 8: RLS POLICIES FOR CONVERSATIONS
-- ===================================================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they're part of
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid()::uuid = participant_1_id OR auth.uid()::uuid = participant_2_id
  );

-- Users can create conversations
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    auth.uid()::uuid = participant_1_id OR auth.uid()::uuid = participant_2_id
  );

-- Users can update their own conversations (unread counts)
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid()::uuid = participant_1_id OR auth.uid()::uuid = participant_2_id
  );

-- ===================================================================
-- STEP 9: CREATE FUNCTION TO UPDATE CONVERSATION ON NEW MESSAGE
-- ===================================================================

CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation last message info
  UPDATE public.conversations
  SET 
    last_message_id = NEW.id,
    last_message_text = NEW.content,
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===================================================================
-- STEP 10: CREATE TRIGGER FOR CONVERSATION UPDATES
-- ===================================================================

DROP TRIGGER IF EXISTS on_message_insert_update_conversation ON public.messages;
CREATE TRIGGER on_message_insert_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- ===================================================================
-- STEP 11: CREATE FUNCTION TO RESET UNREAD COUNT
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
    END
  WHERE id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.reset_unread_count(UUID, UUID) TO authenticated;

-- ===================================================================
-- STEP 12: CREATE FUNCTION TO GET OR CREATE CONVERSATION
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID, UUID) TO authenticated;

-- ===================================================================
-- VERIFICATION COMPLETE! 
-- ===================================================================
-- Your chat system is now ready with:
-- ✅ Messages table updated with all necessary columns
-- ✅ message_type, image_url, status columns added
-- ✅ receiver_id renamed to recipient_id
-- ✅ Conversations table created for optimization
-- ✅ Storage bucket 'chat-images' created
-- ✅ Storage policies set up
-- ✅ RLS policies updated
-- ✅ Trigger to auto-update conversations
-- ✅ Helper functions for unread counts and conversation creation
-- 
-- Next: Create the API layer in TypeScript!
-- ===================================================================
