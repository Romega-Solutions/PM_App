-- ===================================================================
-- CLEANUP SCRIPT: Delete ALL Test Users & Reset for Testing
-- ===================================================================
-- Run this in Supabase SQL Editor to remove ALL test accounts
-- ===================================================================

-- 🔴 DELETE ALL USERS WITH THIS EMAIL (removes duplicates)
DELETE FROM auth.users WHERE email = 'kenpatrickgarcia123@gmail.com';

-- 🔴 OR delete ALL users created today (for complete fresh start)
-- Uncomment the line below to delete EVERYTHING from today:
-- DELETE FROM auth.users WHERE created_at >= CURRENT_DATE;

-- ✅ Verify all deleted
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'user_type' as user_type
FROM auth.users 
WHERE email = 'kenpatrickgarcia123@gmail.com';
-- Should return NO ROWS

-- ✅ Check profiles are also deleted (CASCADE)
SELECT 
  id,
  email,
  first_name,
  user_type,
  gender,
  created_at
FROM public.profiles 
WHERE email = 'kenpatrickgarcia123@gmail.com';
-- Should return NO ROWS

-- ✅ Check all remaining users
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'user_type' as user_type
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3️⃣ Check profiles (should be auto-deleted due to CASCADE)
SELECT 
  id,
  email,
  first_name,
  user_type,
  gender,
  created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- ===================================================================
-- After cleanup, enable email signup in Supabase Dashboard:
-- Authentication → Providers → Email → ENABLE & ENABLE Confirm Email
-- Then add redirect URLs: exp://* and pinaymate://*
-- ===================================================================
