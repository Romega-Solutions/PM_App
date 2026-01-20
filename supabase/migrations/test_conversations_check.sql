-- Check if conversations table exists and has data
-- Run this in your Supabase SQL Editor

-- 1. Check if conversations table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'conversations'
) as conversations_table_exists;

-- 2. Check what columns exist in messages table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- 3. Count conversations
SELECT COUNT(*) as conversation_count FROM public.conversations;

-- 4. Check messages table (should have data)
SELECT COUNT(*) as message_count FROM public.messages;

-- 5. Show recent messages (without assuming column names)
SELECT m.*
FROM public.messages m
ORDER BY m.created_at DESC
LIMIT 5;

-- 6. Check conversations with participant info
SELECT 
  c.id,
  c.participant_1_id,
  c.participant_2_id,
  c.last_message_text,
  c.last_message_at,
  c.participant_1_unread_count,
  c.participant_2_unread_count,
  p1.first_name as participant_1_name,
  p1.photos as participant_1_photos,
  p1.is_active as participant_1_active,
  p2.first_name as participant_2_name,
  p2.photos as participant_2_photos,
  p2.is_active as participant_2_active
FROM public.conversations c
LEFT JOIN public.profiles p1 ON c.participant_1_id = p1.id
LEFT JOIN public.profiles p2 ON c.participant_2_id = p2.id
ORDER BY c.updated_at DESC
LIMIT 10;
