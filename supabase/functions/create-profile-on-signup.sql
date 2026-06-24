-- PinayMate profile creation trigger.
--
-- Purpose:
-- - Create a public.profiles row after a Supabase Auth email user is confirmed.
-- - Keep the profile lifecycle backend-backed instead of relying only on
--   client fallback inserts during sign-in.
-- - Preserve completed onboarding values if a fallback profile already exists.
--
-- Source-only note:
-- - This file is not live proof. Apply the matching migration and run
--   supabase/tests/05_release_preflight_audit.sql plus
--   supabase/tests/04_safety_smoke_test.sql before launch signoff.

BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_first_name TEXT;
  v_user_type TEXT;
  v_gender TEXT;
  v_looking_for_gender TEXT;
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.email IS NULL OR BTRIM(NEW.email) = '' THEN
    RAISE LOG 'PinayMate profile creation skipped for auth user % because email is missing', NEW.id;
    RETURN NEW;
  END IF;

  v_first_name := LEFT(
    COALESCE(NULLIF(BTRIM(NEW.raw_user_meta_data ->> 'first_name'), ''), 'User'),
    120
  );

  v_user_type := CASE
    WHEN NEW.raw_user_meta_data ->> 'user_type' IN ('filipina', 'foreigner')
      THEN NEW.raw_user_meta_data ->> 'user_type'
    ELSE 'foreigner'
  END;

  v_gender := CASE
    WHEN v_user_type = 'filipina' THEN 'female'
    ELSE 'male'
  END;

  v_looking_for_gender := CASE
    WHEN v_gender = 'female' THEN 'male'
    ELSE 'female'
  END;

  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    user_type,
    gender,
    looking_for_gender,
    age_preference_min,
    age_preference_max,
    distance_preference_km
  )
  VALUES (
    NEW.id,
    BTRIM(NEW.email),
    v_first_name,
    v_user_type,
    v_gender,
    v_looking_for_gender,
    18,
    70,
    100
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = CASE
      WHEN COALESCE(public.profiles.basic_info_completed, FALSE)
        THEN public.profiles.first_name
      ELSE EXCLUDED.first_name
    END,
    user_type = CASE
      WHEN COALESCE(public.profiles.basic_info_completed, FALSE)
        THEN public.profiles.user_type
      ELSE EXCLUDED.user_type
    END,
    gender = CASE
      WHEN COALESCE(public.profiles.basic_info_completed, FALSE)
        THEN public.profiles.gender
      ELSE EXCLUDED.gender
    END,
    looking_for_gender = COALESCE(
      public.profiles.looking_for_gender,
      EXCLUDED.looking_for_gender
    ),
    age_preference_min = COALESCE(
      public.profiles.age_preference_min,
      EXCLUDED.age_preference_min
    ),
    age_preference_max = COALESCE(
      public.profiles.age_preference_max,
      EXCLUDED.age_preference_max
    ),
    distance_preference_km = COALESCE(
      public.profiles.distance_preference_km,
      EXCLUDED.distance_preference_km
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'PinayMate profile creation failed for auth user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
