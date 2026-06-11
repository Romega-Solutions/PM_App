-- Backend-backed notification preferences.
-- These preferences record user intent for push/email delivery without
-- claiming that production push or email providers are live.

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  new_matches BOOLEAN NOT NULL DEFAULT FALSE,
  new_messages BOOLEAN NOT NULL DEFAULT FALSE,
  new_likes BOOLEAN NOT NULL DEFAULT FALSE,
  email_updates BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_notification_preferences
  ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN,
  ADD COLUMN IF NOT EXISTS new_matches BOOLEAN,
  ADD COLUMN IF NOT EXISTS new_messages BOOLEAN,
  ADD COLUMN IF NOT EXISTS new_likes BOOLEAN,
  ADD COLUMN IF NOT EXISTS email_updates BOOLEAN,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

UPDATE public.user_notification_preferences
SET
  push_enabled = COALESCE(push_enabled, FALSE),
  new_matches = COALESCE(new_matches, FALSE),
  new_messages = COALESCE(new_messages, FALSE),
  new_likes = COALESCE(new_likes, FALSE),
  email_updates = COALESCE(email_updates, FALSE),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.user_notification_preferences
  ALTER COLUMN push_enabled SET DEFAULT FALSE,
  ALTER COLUMN push_enabled SET NOT NULL,
  ALTER COLUMN new_matches SET DEFAULT FALSE,
  ALTER COLUMN new_matches SET NOT NULL,
  ALTER COLUMN new_messages SET DEFAULT FALSE,
  ALTER COLUMN new_messages SET NOT NULL,
  ALTER COLUMN new_likes SET DEFAULT FALSE,
  ALTER COLUMN new_likes SET NOT NULL,
  ALTER COLUMN email_updates SET DEFAULT FALSE,
  ALTER COLUMN email_updates SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET NOT NULL;

UPDATE public.user_notification_preferences
SET
  new_matches = FALSE,
  new_messages = FALSE,
  new_likes = FALSE,
  updated_at = NOW()
WHERE push_enabled = FALSE
  AND (
    new_matches = TRUE
    OR new_messages = TRUE
    OR new_likes = TRUE
  );

ALTER TABLE public.user_notification_preferences
  DROP CONSTRAINT IF EXISTS user_notification_preferences_push_children_check;

ALTER TABLE public.user_notification_preferences
  ADD CONSTRAINT user_notification_preferences_push_children_check
  CHECK (
    push_enabled = TRUE
    OR (
      new_matches = FALSE
      AND new_messages = FALSE
      AND new_likes = FALSE
    )
  );

ALTER TABLE public.user_notification_preferences ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_notification_preferences FROM PUBLIC, anon;
REVOKE ALL ON public.user_notification_preferences FROM authenticated;
GRANT SELECT ON public.user_notification_preferences TO authenticated;

DROP POLICY IF EXISTS "Users can read own notification preferences"
  ON public.user_notification_preferences;
CREATE POLICY "Users can read own notification preferences"
  ON public.user_notification_preferences
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.get_notification_preferences()
RETURNS TABLE (
  push_enabled BOOLEAN,
  new_matches BOOLEAN,
  new_messages BOOLEAN,
  new_likes BOOLEAN,
  email_updates BOOLEAN,
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
    COALESCE(prefs.push_enabled, FALSE),
    COALESCE(prefs.new_matches, FALSE),
    COALESCE(prefs.new_messages, FALSE),
    COALESCE(prefs.new_likes, FALSE),
    COALESCE(prefs.email_updates, FALSE),
    prefs.updated_at
  FROM (SELECT v_current_user AS user_id) current_user_row
  LEFT JOIN public.user_notification_preferences prefs
    ON prefs.user_id = current_user_row.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_notification_preferences(
  p_push_enabled BOOLEAN,
  p_new_matches BOOLEAN,
  p_new_messages BOOLEAN,
  p_new_likes BOOLEAN,
  p_email_updates BOOLEAN
)
RETURNS TABLE (
  push_enabled BOOLEAN,
  new_matches BOOLEAN,
  new_messages BOOLEAN,
  new_likes BOOLEAN,
  email_updates BOOLEAN,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_preferences public.user_notification_preferences%ROWTYPE;
  v_push_enabled BOOLEAN := COALESCE(p_push_enabled, FALSE);
  v_new_matches BOOLEAN := FALSE;
  v_new_messages BOOLEAN := FALSE;
  v_new_likes BOOLEAN := FALSE;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF v_push_enabled THEN
    v_new_matches := COALESCE(p_new_matches, FALSE);
    v_new_messages := COALESCE(p_new_messages, FALSE);
    v_new_likes := COALESCE(p_new_likes, FALSE);
  END IF;

  INSERT INTO public.user_notification_preferences (
    user_id,
    push_enabled,
    new_matches,
    new_messages,
    new_likes,
    email_updates,
    updated_at
  )
  VALUES (
    v_current_user,
    v_push_enabled,
    v_new_matches,
    v_new_messages,
    v_new_likes,
    COALESCE(p_email_updates, FALSE),
    NOW()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    push_enabled = EXCLUDED.push_enabled,
    new_matches = EXCLUDED.new_matches,
    new_messages = EXCLUDED.new_messages,
    new_likes = EXCLUDED.new_likes,
    email_updates = EXCLUDED.email_updates,
    updated_at = NOW()
  RETURNING *
  INTO v_preferences;

  RETURN QUERY
  SELECT
    v_preferences.push_enabled,
    v_preferences.new_matches,
    v_preferences.new_messages,
    v_preferences.new_likes,
    v_preferences.email_updates,
    v_preferences.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.get_notification_preferences() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.save_notification_preferences(BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_notification_preferences() TO authenticated;
GRANT EXECUTE ON FUNCTION public.save_notification_preferences(BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) TO authenticated;

COMMIT;
