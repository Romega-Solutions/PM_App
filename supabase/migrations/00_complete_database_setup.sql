-- ===================================================================
-- PINAYMATE COMPLETE DATABASE SETUP
-- ===================================================================
-- This script sets up the complete database schema for the Pinaymate app
-- Run this in your Supabase SQL Editor after your database has been reset
-- ===================================================================

-- ===================================================================
-- STEP 1: CREATE PROFILES TABLE
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary Key (links to auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic User Info
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT DEFAULT '',
  age INTEGER CHECK (age >= 18 AND age <= 70),
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  user_type TEXT NOT NULL CHECK (user_type IN ('filipina', 'foreigner')),
  
  -- Profile Photos (array of photo URLs)
  photos TEXT[] DEFAULT '{}',
  
  -- Bio and About
  bio TEXT DEFAULT '',
  
  -- Location Information
  country TEXT DEFAULT '',
  city TEXT DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  
  -- Physical Attributes
  height_cm INTEGER CHECK (height_cm >= 100 AND height_cm <= 250),
  body_type TEXT CHECK (body_type IN ('slim', 'athletic', 'average', 'curvy', 'plus-size')),
  
  -- Lifestyle & Preferences
  education TEXT,
  occupation TEXT,
  relationship_goal TEXT CHECK (relationship_goal IN ('dating', 'long-term', 'marriage', 'friendship')),
  languages TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  
  -- Dating Preferences (for matching)
  looking_for_gender TEXT CHECK (looking_for_gender IN ('male', 'female', 'both')),
  age_preference_min INTEGER CHECK (age_preference_min >= 18),
  age_preference_max INTEGER CHECK (age_preference_max <= 70),
  distance_preference_km INTEGER DEFAULT 100,
  
  -- Verification Status
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_photo_url TEXT,
  verified_at TIMESTAMPTZ,
  
  -- Account Status
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  
  -- Setup Progress Flags
  basic_info_completed BOOLEAN DEFAULT FALSE,
  photos_completed BOOLEAN DEFAULT FALSE,
  location_completed BOOLEAN DEFAULT FALSE,
  preferences_completed BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON public.profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active_at ON public.profiles(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ===================================================================
-- STEP 3: CREATE UPDATED_AT TRIGGER FUNCTION
-- ===================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- STEP 4: ATTACH UPDATED_AT TRIGGER TO PROFILES TABLE
-- ===================================================================
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===================================================================
-- STEP 5: CREATE AUTO-PROFILE CREATION TRIGGER (RUNS AFTER EMAIL VERIFICATION)
-- ===================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Log for debugging
  RAISE LOG 'Creating profile for user: %', NEW.id;
  
  -- Only create profile when email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    -- Insert profile with data from user_metadata
    INSERT INTO public.profiles (
      id, 
      email, 
      first_name, 
      user_type, 
      gender,
      looking_for_gender,
      age_preference_min,
      age_preference_max
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'user_type', 'foreigner'),
      -- Auto-assign gender based on user_type
      CASE 
        WHEN COALESCE(NEW.raw_user_meta_data->>'user_type', 'foreigner') = 'filipina' 
        THEN 'female' 
        ELSE 'male' 
      END,
      -- Auto-assign looking_for_gender (opposite gender)
      CASE 
        WHEN COALESCE(NEW.raw_user_meta_data->>'user_type', 'foreigner') = 'filipina' 
        THEN 'male' 
        ELSE 'female' 
      END,
      18, -- Default min age preference
      70  -- Default max age preference
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      user_type = EXCLUDED.user_type,
      gender = EXCLUDED.gender;
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
  ELSE
    RAISE LOG 'Email not confirmed yet for user: %, skipping profile creation', NEW.id;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW; -- Don't block signup even if profile creation fails
END;
$$;

-- ===================================================================
-- STEP 6: ATTACH AUTO-PROFILE CREATION TRIGGER
-- ===================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Also trigger on UPDATE when email is verified
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

-- ===================================================================
-- STEP 7: CREATE MESSAGES TABLE (FOR CHAT FEATURE)
-- ===================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.messages(receiver_id, is_read) WHERE is_read = FALSE;

-- ===================================================================
-- STEP 8: CREATE LIKES/MATCHES TABLE
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

CREATE INDEX IF NOT EXISTS idx_likes_from_user ON public.likes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_to_user ON public.likes(to_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_matches ON public.likes(from_user_id, to_user_id) WHERE is_match = TRUE;

-- ===================================================================
-- STEP 9: CREATE PASSES/SWIPES TABLE
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
-- STEP 10: SET UP ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all active profiles, but only update their own
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Messages: Users can only see messages they sent or received
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" 
  ON public.messages FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" 
  ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their received messages" ON public.messages;
CREATE POLICY "Users can update their received messages" 
  ON public.messages FOR UPDATE 
  USING (auth.uid() = receiver_id);

-- Likes: Users can view likes they sent or received, and can create likes
DROP POLICY IF EXISTS "Users can view their likes" ON public.likes;
CREATE POLICY "Users can view their likes" 
  ON public.likes FOR SELECT 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
CREATE POLICY "Users can create likes" 
  ON public.likes FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- Passes: Users can only see their own passes
DROP POLICY IF EXISTS "Users can view their passes" ON public.passes;
CREATE POLICY "Users can view their passes" 
  ON public.passes FOR SELECT 
  USING (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can create passes" ON public.passes;
CREATE POLICY "Users can create passes" 
  ON public.passes FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- ===================================================================
-- STEP 11: GRANT PERMISSIONS
-- ===================================================================
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role, anon;
GRANT ALL ON public.profiles TO postgres, authenticated, service_role;
GRANT ALL ON public.messages TO postgres, authenticated, service_role;
GRANT ALL ON public.likes TO postgres, authenticated, service_role;
GRANT ALL ON public.passes TO postgres, authenticated, service_role;

-- Allow anon users to read profiles (for browsing)
GRANT SELECT ON public.profiles TO anon;

-- ===================================================================
-- STEP 12: CREATE HELPER FUNCTION TO MANUALLY VERIFY USERS (OPTIONAL)
-- ===================================================================
CREATE OR REPLACE FUNCTION public.manual_verify_user(user_email TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  email_confirmed_at TIMESTAMPTZ,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the user's email confirmation timestamp
  UPDATE auth.users
  SET 
    email_confirmed_at = NOW(),
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE 
    auth.users.email = user_email
    AND email_confirmed_at IS NULL;
  
  -- Return the updated user info
  RETURN QUERY
  SELECT 
    id,
    auth.users.email,
    auth.users.email_confirmed_at,
    CASE 
      WHEN auth.users.email_confirmed_at IS NOT NULL THEN 'Verified'
      ELSE 'Not Found or Already Verified'
    END as status
  FROM auth.users
  WHERE auth.users.email = user_email;
END;
$$;

GRANT EXECUTE ON FUNCTION public.manual_verify_user(TEXT) TO postgres, service_role;

-- ===================================================================
-- STEP 13: DISABLE EMAIL CONFIRMATIONS IN SUPABASE AUTH SETTINGS
-- ===================================================================
-- ⚠️ IMPORTANT: You must also disable email confirmation in your Supabase dashboard:
-- 
-- 1. Go to: Authentication > Settings > Email Auth
-- 2. Set "Enable email confirmations" to OFF
-- 3. This allows users to sign up and immediately sign in without verifying email
-- 
-- OR you can run this SQL (if you have access):
-- UPDATE auth.config SET enable_signup = true WHERE id = 1;
-- ===================================================================

-- ===================================================================
-- VERIFICATION COMPLETE! 
-- ===================================================================
-- Your database is now set up with:
-- ✅ Profiles table with all necessary fields
-- ✅ Auto-profile creation on signup (no email verification required)
-- ✅ Messages, Likes, and Passes tables for core features
-- ✅ Row Level Security (RLS) policies for data protection
-- ✅ Proper indexes for performance
-- ✅ Trigger functions for automated updates
-- 
-- Next Steps:
-- 1. Go to Authentication > Settings > Email Auth
-- 2. Disable "Enable email confirmations"
-- 3. Test signup flow in your app - users should be auto-verified!
-- ===================================================================
