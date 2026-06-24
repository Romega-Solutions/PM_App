BEGIN;

CREATE OR REPLACE FUNCTION public.pass_profile(p_to_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF p_to_user_id IS NULL THEN
    RAISE EXCEPTION 'Profile is required' USING ERRCODE = '22023';
  END IF;

  IF p_to_user_id = v_current_user THEN
    RAISE EXCEPTION 'Cannot pass yourself' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.discoverable_profiles dp
    WHERE dp.id = p_to_user_id
  ) THEN
    RAISE EXCEPTION 'Profile is not available for passing' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.passes (from_user_id, to_user_id)
  VALUES (v_current_user, p_to_user_id)
  ON CONFLICT (from_user_id, to_user_id) DO NOTHING;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.pass_profile(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pass_profile(UUID) TO authenticated;

REVOKE INSERT ON public.passes FROM authenticated;

COMMIT;
