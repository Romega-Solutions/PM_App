-- ===================================================================
-- FIX: Add missing tables for likes and passes
-- Run this in Supabase SQL Editor
-- ===================================================================

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  is_match BOOLEAN DEFAULT FALSE,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_likes_from_user ON public.likes(from_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_to_user ON public.likes(to_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_matches ON public.likes(from_user_id, to_user_id) WHERE is_match = TRUE;

-- Create passes table
CREATE TABLE IF NOT EXISTS public.passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_passes_from_user ON public.passes(from_user_id);

-- Enable RLS
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
DROP POLICY IF EXISTS "Users can view their likes" ON public.likes;
CREATE POLICY "Users can view their likes" 
  ON public.likes FOR SELECT 
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users can create likes" ON public.likes;
CREATE POLICY "Users can create likes" 
  ON public.likes FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- RLS Policies for passes
DROP POLICY IF EXISTS "Users can view their passes" ON public.passes;
CREATE POLICY "Users can view their passes" 
  ON public.passes FOR SELECT 
  USING (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can create passes" ON public.passes;
CREATE POLICY "Users can create passes" 
  ON public.passes FOR INSERT 
  WITH CHECK (auth.uid() = from_user_id);

-- Grant permissions
GRANT ALL ON public.likes TO postgres, authenticated, service_role;
GRANT ALL ON public.passes TO postgres, authenticated, service_role;
