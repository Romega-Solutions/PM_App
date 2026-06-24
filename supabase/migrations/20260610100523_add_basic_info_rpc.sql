-- Basic-info write hardening.
--
-- Account type drives matching and moderation expectations, so browser/mobile
-- clients should not be able to mutate user_type/gender directly after setup.
-- This RPC lets initial onboarding set the selected type, then blocks silent
-- switching once basic_info_completed is true.

CREATE OR REPLACE FUNCTION public.save_basic_info(
  p_first_name TEXT,
  p_last_name TEXT,
  p_age INTEGER,
  p_user_type TEXT
)
RETURNS TABLE (
  updated_at TIMESTAMPTZ,
  gender TEXT,
  user_type TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_existing RECORD;
  v_gender TEXT;
  v_updated_at TIMESTAMPTZ;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_user_type NOT IN ('filipina', 'foreigner') THEN
    RAISE EXCEPTION 'Invalid account type' USING ERRCODE = '22023';
  END IF;

  IF p_first_name IS NULL OR LENGTH(BTRIM(p_first_name)) < 2 THEN
    RAISE EXCEPTION 'First name must be at least 2 characters' USING ERRCODE = '22023';
  END IF;

  IF p_age IS NULL OR p_age < 18 OR p_age > 100 THEN
    RAISE EXCEPTION 'Age must be between 18 and 100' USING ERRCODE = '22023';
  END IF;

  SELECT basic_info_completed, profiles.user_type
  INTO v_existing
  FROM public.profiles
  WHERE id = v_current_user
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = 'P0002';
  END IF;

  IF COALESCE(v_existing.basic_info_completed, FALSE)
    AND v_existing.user_type IS DISTINCT FROM p_user_type
  THEN
    RAISE EXCEPTION 'Account type cannot be changed after profile setup'
      USING ERRCODE = '42501';
  END IF;

  v_gender := CASE
    WHEN p_user_type = 'filipina' THEN 'female'
    ELSE 'male'
  END;

  UPDATE public.profiles
  SET
    first_name = BTRIM(p_first_name),
    last_name = NULLIF(BTRIM(COALESCE(p_last_name, '')), ''),
    age = p_age,
    gender = v_gender,
    user_type = p_user_type,
    basic_info_completed = TRUE,
    updated_at = NOW()
  WHERE id = v_current_user
  RETURNING profiles.updated_at INTO v_updated_at;

  RETURN QUERY
  SELECT v_updated_at, v_gender, p_user_type;
END;
$$;

REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE (gender, user_type) ON public.profiles FROM authenticated;

-- Restore the client-editable profile columns that are still protected by RLS.
-- Account type and gender must stay RPC-only after initial setup; verification
-- status/evidence columns stay server-owned.
DO $$
DECLARE
  v_update_columns TEXT;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
  INTO v_update_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = ANY(ARRAY[
      'email',
      'full_name',
      'first_name',
      'last_name',
      'age',
      'bio',
      'photos',
      'avatar_url',
      'location',
      'country',
      'city',
      'height',
      'height_cm',
      'education',
      'occupation',
      'interests',
      'looking_for_gender',
      'age_preference_min',
      'age_preference_max',
      'distance_preference_km',
      'basic_info_completed',
      'photos_completed',
      'location_name',
      'location_address',
      'location_latitude',
      'location_longitude',
      'location_place_id',
      'location_type',
      'location_coordinates',
      'location_timestamp',
      'location_completed',
      'interested_in',
      'age_min',
      'age_max',
      'max_distance_km',
      'relationship_goal',
      'preferences_completed',
      'updated_at'
    ]);

  IF v_update_columns IS NOT NULL THEN
    EXECUTE format('GRANT UPDATE (%s) ON public.profiles TO authenticated', v_update_columns);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.save_basic_info(TEXT, TEXT, INTEGER, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_basic_info(TEXT, TEXT, INTEGER, TEXT) TO authenticated;
