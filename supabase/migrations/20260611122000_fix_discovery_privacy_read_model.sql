-- Finalize the discovery read model after privacy RLS hardening.
--
-- user_privacy_settings is intentionally owner-readable for direct client
-- access. The discovery read model still needs to enforce another member's
-- profile_visible and show_online_status flags. This constrained app-facing
-- view exposes only profile-card fields while allowing the view owner to read
-- privacy flags internally.

BEGIN;

DROP VIEW IF EXISTS public.discoverable_profiles;
CREATE VIEW public.discoverable_profiles
WITH (security_invoker = false) AS
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
  CASE
    WHEN COALESCE(privacy_settings.show_online_status, FALSE)
      THEN COALESCE(p.is_active, FALSE)
    ELSE FALSE
  END AS is_active,
  p.is_premium,
  p.created_at,
  CASE
    WHEN COALESCE(privacy_settings.show_online_status, FALSE)
      THEN p.last_active_at
    ELSE NULL
  END AS last_active_at
FROM public.profiles p
LEFT JOIN public.user_privacy_settings privacy_settings
  ON privacy_settings.user_id = p.id
WHERE p.is_active = TRUE
  AND p.is_verified = TRUE
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

COMMIT;
