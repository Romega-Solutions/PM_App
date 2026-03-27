-- ===================================================================
-- FIX MISSING COLUMNS AND TABLES
-- ===================================================================
-- This migration adds the missing 'is_active' column and ensures
-- the 'likes' table exists with proper structure
-- Run this in your Supabase SQL Editor
-- ===================================================================

-- ===================================================================
-- STEP 1: ADD is_active COLUMN TO PROFILES (if not exists)
-- ===================================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added is_active column to profiles table';
  ELSE
    RAISE NOTICE 'is_active column already exists in profiles table';
  END IF;
END $$;

-- Create index on is_active if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- ===================================================================
-- STEP 2: CREATE LIKES TABLE (if not exists)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_match BOOLEAN DEFAULT FALSE,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicate likes
  UNIQUE(from_user_id, to_user_id)
);

-- Create indexes on likes table
CREATE INDEX IF NOT EXISTS idx_likes_from_user ON public.likes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_to_user ON public.likes(to_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_matches ON public.likes(from_user_id, to_user_id) WHERE is_match = TRUE;

-- ===================================================================
-- STEP 3: CREATE PASSES TABLE (if not exists)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Prevent duplicate passes
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_passes_from_user ON public.passes(from_user_id);

-- ===================================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY ON NEW TABLES
-- ===================================================================
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 5: CREATE RLS POLICIES FOR LIKES
-- ===================================================================
-- Users can view likes they sent or received
DROP POLICY IF EXISTS "Users can view their likes" ON public.likes;
CREATE POLICY "Users can view their likes" 
  ON public.likes FOR SELECT 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can create likes
DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
CREATE POLICY "Users can create likes" 
  ON public.likes FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- Users can update their own likes (for match status)
DROP POLICY IF EXISTS "Users can update their likes" ON public.likes;
CREATE POLICY "Users can update their likes" 
  ON public.likes FOR UPDATE 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- ===================================================================
-- STEP 6: CREATE RLS POLICIES FOR PASSES
-- ===================================================================
-- Users can only see their own passes
DROP POLICY IF EXISTS "Users can view their passes" ON public.passes;
CREATE POLICY "Users can view their passes" 
  ON public.passes FOR SELECT 
  USING (auth.uid() = from_user_id);

-- Users can create passes
DROP POLICY IF EXISTS "Users can create passes" ON public.passes;
CREATE POLICY "Users can create passes" 
  ON public.passes FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- ===================================================================
-- STEP 7: GRANT PERMISSIONS
-- ===================================================================
GRANT ALL ON public.likes TO postgres, authenticated, service_role;
GRANT ALL ON public.passes TO postgres, authenticated, service_role;
GRANT SELECT ON public.likes TO anon;
GRANT SELECT ON public.passes TO anon;

-- ===================================================================
-- STEP 8: UPDATE EXISTING PROFILES TO BE ACTIVE
-- ===================================================================
-- Set all existing profiles to active (if they don't have is_active set)
UPDATE public.profiles 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- ===================================================================
-- VERIFICATION COMPLETE! 
-- ===================================================================
-- Your database should now have:
-- ✅ is_active column in profiles table
-- ✅ likes table with proper structure and RLS policies
-- ✅ passes table with proper structure and RLS policies
-- ✅ All existing profiles set to active
-- 
-- You can now test your app and the errors should be resolved!
-- ===================================================================
