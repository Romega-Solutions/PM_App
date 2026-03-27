-- ===================================================================
-- DATABASE AUDIT SCRIPT
-- ===================================================================
-- Run each section separately in Supabase SQL Editor to check your
-- current database state before making any changes
-- ===================================================================

-- ===================================================================
-- SECTION 1: CHECK EXISTING TABLES
-- ===================================================================
-- Copy and run this first to see all your tables
SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;


-- ===================================================================
-- SECTION 2: CHECK MESSAGES TABLE SCHEMA
-- ===================================================================
-- Run this to see all columns in the messages table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;


-- ===================================================================
-- SECTION 3: CHECK CONVERSATIONS TABLE (if exists)
-- ===================================================================
-- Run this to see if conversations table exists and its structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY ordinal_position;


-- ===================================================================
-- SECTION 4: CHECK ALL RLS POLICIES ON MESSAGES
-- ===================================================================
-- Run this to see all existing policies on messages table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'messages';


-- ===================================================================
-- SECTION 5: CHECK ALL RLS POLICIES ON CONVERSATIONS
-- ===================================================================
-- Run this to see all existing policies on conversations table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'conversations';


-- ===================================================================
-- SECTION 6: CHECK STORAGE BUCKETS
-- ===================================================================
-- Run this to see all storage buckets
SELECT 
  id,
  name,
  public
FROM storage.buckets
ORDER BY name;


-- ===================================================================
-- SECTION 7: CHECK STORAGE POLICIES
-- ===================================================================
-- Run this to see all storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects';


-- ===================================================================
-- SECTION 8: CHECK EXISTING FUNCTIONS
-- ===================================================================
-- Run this to see custom functions
SELECT 
  routine_schema,
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;


-- ===================================================================
-- SECTION 9: CHECK TRIGGERS ON MESSAGES
-- ===================================================================
-- Run this to see triggers on messages table
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'messages';


-- ===================================================================
-- SECTION 10: CHECK INDEXES ON MESSAGES
-- ===================================================================
-- Run this to see indexes on messages table
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'messages';


-- ===================================================================
-- SECTION 11: CHECK INDEXES ON CONVERSATIONS
-- ===================================================================
-- Run this to see indexes on conversations table (if exists)
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'conversations';


-- ===================================================================
-- SECTION 12: CHECK SAMPLE DATA IN MESSAGES
-- ===================================================================
-- Run this to see if there are any messages in the database
SELECT 
  COUNT(*) as total_messages,
  COUNT(DISTINCT sender_id) as unique_senders,
  MIN(created_at) as first_message,
  MAX(created_at) as last_message
FROM messages;


-- ===================================================================
-- SECTION 13: CHECK PROFILES TABLE STRUCTURE
-- ===================================================================
-- Run this to verify profiles table has the columns we need
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;


-- ===================================================================
-- INSTRUCTIONS
-- ===================================================================
-- 1. Run each section ONE AT A TIME in your Supabase SQL Editor
-- 2. Copy the results and share them so we can analyze what exists
-- 3. Based on the results, we'll create a SAFE migration that only
--    adds what's missing and updates what needs updating
-- 
-- Start with SECTION 1 to see all tables!
-- ===================================================================
