-- Backend-backed privacy settings.
-- Keeps privacy controls separate from public profile columns and makes
-- profile visibility affect the discoverable profile read model.

CREATE TABLE IF NOT EXISTS public.user_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  show_online_status BOOLEAN NOT NULL DEFAULT FALSE,
  show_distance BOOLEAN NOT NULL DEFAULT TRUE,
  read_receipts BOOLEAN NOT NULL DEFAULT FALSE,
  profile_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_privacy_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_privacy_settings FROM PUBLIC, anon;
REVOKE ALL ON public.user_privacy_settings FROM authenticated;
GRANT SELECT ON public.user_privacy_settings TO authenticated;

DROP POLICY IF EXISTS "Users can read own privacy settings"
  ON public.user_privacy_settings;
CREATE POLICY "Users can read own privacy settings"
  ON public.user_privacy_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_privacy_settings()
RETURNS TABLE (
  show_online_status BOOLEAN,
  show_distance BOOLEAN,
  read_receipts BOOLEAN,
  profile_visible BOOLEAN,
  updated_at TIMESTAMPTZ
)
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

  RETURN QUERY
  SELECT
    COALESCE(s.show_online_status, FALSE),
    COALESCE(s.show_distance, TRUE),
    COALESCE(s.read_receipts, FALSE),
    COALESCE(s.profile_visible, TRUE),
    s.updated_at
  FROM (SELECT v_current_user AS user_id) current_user_row
  LEFT JOIN public.user_privacy_settings s
    ON s.user_id = current_user_row.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_privacy_settings(
  p_show_online_status BOOLEAN,
  p_show_distance BOOLEAN,
  p_read_receipts BOOLEAN,
  p_profile_visible BOOLEAN
)
RETURNS TABLE (
  show_online_status BOOLEAN,
  show_distance BOOLEAN,
  read_receipts BOOLEAN,
  profile_visible BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_settings public.user_privacy_settings%ROWTYPE;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_privacy_settings (
    user_id,
    show_online_status,
    show_distance,
    read_receipts,
    profile_visible,
    updated_at
  )
  VALUES (
    v_current_user,
    COALESCE(p_show_online_status, FALSE),
    COALESCE(p_show_distance, TRUE),
    COALESCE(p_read_receipts, FALSE),
    COALESCE(p_profile_visible, TRUE),
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    show_online_status = EXCLUDED.show_online_status,
    show_distance = EXCLUDED.show_distance,
    read_receipts = EXCLUDED.read_receipts,
    profile_visible = EXCLUDED.profile_visible,
    updated_at = NOW()
  RETURNING *
  INTO v_settings;

  RETURN QUERY
  SELECT
    v_settings.show_online_status,
    v_settings.show_distance,
    v_settings.read_receipts,
    v_settings.profile_visible,
    v_settings.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.get_privacy_settings() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_privacy_settings(BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_privacy_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_privacy_settings(BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;

DROP VIEW IF EXISTS public.discoverable_profiles;
CREATE VIEW public.discoverable_profiles
WITH (security_invoker = true) AS
SELECT
  p.id,
  p.first_name,
  p.age,
  p.gender,
  p.user_type,
  p.photos,
  p.bio,
  p.country,
  p.city,
  p.height_cm,
  p.body_type,
  p.education,
  p.occupation,
  p.relationship_goal,
  p.languages,
  p.interests,
  p.looking_for_gender,
  p.age_preference_min,
  p.age_preference_max,
  p.distance_preference_km,
  p.is_verified,
  p.is_active,
  p.is_premium,
  p.created_at,
  p.last_active_at
FROM public.profiles p
LEFT JOIN public.user_privacy_settings privacy_settings
  ON privacy_settings.user_id = p.id
WHERE p.is_active = TRUE
  AND COALESCE(privacy_settings.profile_visible, TRUE) = TRUE
  AND p.id <> (SELECT auth.uid())
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_blocks b
    WHERE (
      b.blocker_id = (SELECT auth.uid())
      AND b.blocked_user_id = p.id
    )
    OR (
      b.blocker_id = p.id
      AND b.blocked_user_id = (SELECT auth.uid())
    )
  );

REVOKE ALL ON public.discoverable_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.discoverable_profiles TO authenticated;
