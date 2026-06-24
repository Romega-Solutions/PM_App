-- PinayMate waitlist interest capture.
--
-- Purpose:
-- - Provide a backend-owned waitlist table and RPC for launch interest.
-- - Keep direct table writes denied; public clients may only use the
--   constrained submit_waitlist_signup RPC.
-- - Store only the minimum useful launch interest fields.

BEGIN;

CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  email_normalized TEXT GENERATED ALWAYS AS (LOWER(BTRIM(email))) STORED,
  platform TEXT NOT NULL DEFAULT 'unknown',
  source TEXT NOT NULL DEFAULT 'pm_web',
  status TEXT NOT NULL DEFAULT 'new',
  submission_count INTEGER NOT NULL DEFAULT 1,
  last_submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS email_normalized TEXT
  GENERATED ALWAYS AS (LOWER(BTRIM(email))) STORED;

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'unknown';

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'pm_web';

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 1;

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS last_submitted_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE public.waitlist_signups
SET
  platform = COALESCE(NULLIF(BTRIM(platform), ''), 'unknown'),
  source = COALESCE(NULLIF(BTRIM(source), ''), 'pm_web'),
  status = COALESCE(NULLIF(BTRIM(status), ''), 'new'),
  submission_count = GREATEST(COALESCE(submission_count, 1), 1),
  last_submitted_at = COALESCE(last_submitted_at, created_at, NOW()),
  created_at = COALESCE(created_at, NOW()),
  updated_at = COALESCE(updated_at, NOW());

ALTER TABLE public.waitlist_signups
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN platform SET NOT NULL,
  ALTER COLUMN source SET NOT NULL,
  ALTER COLUMN status SET NOT NULL,
  ALTER COLUMN submission_count SET NOT NULL,
  ALTER COLUMN last_submitted_at SET NOT NULL,
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waitlist_signups_email_format_check'
  ) THEN
    ALTER TABLE public.waitlist_signups
      ADD CONSTRAINT waitlist_signups_email_format_check
      CHECK (
        LENGTH(BTRIM(email)) BETWEEN 6 AND 254
        AND email_normalized ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waitlist_signups_platform_check'
  ) THEN
    ALTER TABLE public.waitlist_signups
      ADD CONSTRAINT waitlist_signups_platform_check
      CHECK (platform IN ('ios', 'android', 'web', 'unknown'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waitlist_signups_source_check'
  ) THEN
    ALTER TABLE public.waitlist_signups
      ADD CONSTRAINT waitlist_signups_source_check
      CHECK (source IN ('pm_web', 'pm_app', 'support', 'operator_import'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waitlist_signups_status_check'
  ) THEN
    ALTER TABLE public.waitlist_signups
      ADD CONSTRAINT waitlist_signups_status_check
      CHECK (status IN ('new', 'confirmed', 'contacted', 'unsubscribed', 'blocked'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'waitlist_signups_submission_count_check'
  ) THEN
    ALTER TABLE public.waitlist_signups
      ADD CONSTRAINT waitlist_signups_submission_count_check
      CHECK (submission_count >= 1);
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_signups_email_platform
  ON public.waitlist_signups(email_normalized, platform);

CREATE INDEX IF NOT EXISTS idx_waitlist_signups_status_created
  ON public.waitlist_signups(status, created_at DESC);

DROP TRIGGER IF EXISTS set_waitlist_signups_updated_at ON public.waitlist_signups;
CREATE TRIGGER set_waitlist_signups_updated_at
  BEFORE UPDATE ON public.waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.waitlist_signups FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_waitlist_signup(
  p_email TEXT,
  p_platform TEXT DEFAULT 'unknown',
  p_source TEXT DEFAULT 'pm_web'
)
RETURNS TABLE (
  id UUID,
  email_normalized TEXT,
  platform TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email TEXT := LOWER(BTRIM(COALESCE(p_email, '')));
  v_platform TEXT := LOWER(BTRIM(COALESCE(p_platform, 'unknown')));
  v_source TEXT := LOWER(BTRIM(COALESCE(p_source, 'pm_web')));
  v_existing public.waitlist_signups%ROWTYPE;
  v_waitlist_row public.waitlist_signups%ROWTYPE;
BEGIN
  IF LENGTH(v_email) < 6
    OR LENGTH(v_email) > 254
    OR v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  THEN
    RAISE EXCEPTION 'A valid email address is required' USING ERRCODE = '22023';
  END IF;

  IF v_platform NOT IN ('ios', 'android', 'web', 'unknown') THEN
    v_platform := 'unknown';
  END IF;

  IF v_source NOT IN ('pm_web', 'pm_app', 'support', 'operator_import') THEN
    v_source := 'pm_web';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(v_email || ':' || v_platform));

  SELECT *
  INTO v_existing
  FROM public.waitlist_signups
  WHERE email_normalized = v_email
    AND platform = v_platform
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing.status IN ('unsubscribed', 'blocked')
      OR v_existing.last_submitted_at >= NOW() - INTERVAL '10 minutes'
    THEN
      id := v_existing.id;
      email_normalized := v_existing.email_normalized;
      platform := v_existing.platform;
      status := v_existing.status;
      created_at := v_existing.created_at;
      RETURN NEXT;
      RETURN;
    END IF;

    UPDATE public.waitlist_signups
    SET
      source = v_source,
      status = 'new',
      submission_count = CASE
        WHEN submission_count >= 2147483647 THEN 2147483647
        ELSE submission_count + 1
      END,
      last_submitted_at = NOW(),
      updated_at = NOW()
    WHERE public.waitlist_signups.id = v_existing.id
    RETURNING *
    INTO v_waitlist_row;
  ELSE
    INSERT INTO public.waitlist_signups (
    email,
    platform,
    source,
      status,
      submission_count,
      last_submitted_at
    )
    VALUES (
      v_email,
      v_platform,
      v_source,
      'new',
      1,
      NOW()
    )
    RETURNING *
    INTO v_waitlist_row;
  END IF;

  id := v_waitlist_row.id;
  email_normalized := v_waitlist_row.email_normalized;
  platform := v_waitlist_row.platform;
  status := v_waitlist_row.status;
  created_at := v_waitlist_row.created_at;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_waitlist_signup(TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_waitlist_signup(TEXT, TEXT, TEXT)
  TO anon, authenticated;

COMMIT;
