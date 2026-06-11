-- PinayMate waitlist Edge Function abuse-control hardening.
--
-- Purpose:
-- - Move public waitlist capture behind an Edge Function instead of exposing
--   submit_waitlist_signup directly to browser clients.
-- - Add a database-backed per-client/source/platform hourly attempt gate for
--   the Edge Function before it calls the waitlist RPC.
-- - Keep the waitlist RPC generic and service-role-only for public launch.

BEGIN;

CREATE TABLE IF NOT EXISTS public.waitlist_edge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_fingerprint TEXT NOT NULL,
  client_ip_prefix TEXT NOT NULL DEFAULT 'unknown',
  platform TEXT NOT NULL DEFAULT 'unknown',
  source TEXT NOT NULL DEFAULT 'pm_web',
  attempt_bucket TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT waitlist_edge_attempts_platform_check
    CHECK (platform IN ('ios', 'android', 'web', 'unknown')),
  CONSTRAINT waitlist_edge_attempts_source_check
    CHECK (source IN ('pm_web', 'pm_app')),
  CONSTRAINT waitlist_edge_attempts_count_check
    CHECK (attempt_count > 0),
  CONSTRAINT waitlist_edge_attempts_fingerprint_check
    CHECK (client_fingerprint ~ '^[a-f0-9]{64}$'),
  CONSTRAINT waitlist_edge_attempts_unique_bucket
    UNIQUE (client_fingerprint, platform, source, attempt_bucket)
);

COMMENT ON TABLE public.waitlist_edge_attempts IS
  'Service-role-only hourly waitlist Edge Function attempt buckets. Stores HMAC fingerprints and coarse IP prefixes only, not raw IP addresses.';

ALTER TABLE public.waitlist_edge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_edge_attempts FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.waitlist_edge_attempts
  FROM PUBLIC, anon, authenticated, service_role;

REVOKE ALL ON public.waitlist_signups
  FROM PUBLIC, anon, authenticated, service_role;

CREATE INDEX IF NOT EXISTS idx_waitlist_edge_attempts_recent
  ON public.waitlist_edge_attempts(source, platform, attempt_bucket DESC, last_seen_at DESC);

CREATE OR REPLACE FUNCTION public.claim_waitlist_edge_attempt(
  p_client_fingerprint TEXT,
  p_ip_prefix TEXT DEFAULT 'unknown',
  p_platform TEXT DEFAULT 'unknown',
  p_source TEXT DEFAULT 'pm_web',
  p_max_per_hour INTEGER DEFAULT 6
)
RETURNS TABLE (
  allowed BOOLEAN,
  retry_after_seconds INTEGER,
  attempt_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_client_fingerprint TEXT := LOWER(BTRIM(COALESCE(p_client_fingerprint, '')));
  v_ip_prefix TEXT := LEFT(BTRIM(COALESCE(p_ip_prefix, 'unknown')), 80);
  v_platform TEXT := LOWER(BTRIM(COALESCE(p_platform, 'unknown')));
  v_source TEXT := LOWER(BTRIM(COALESCE(p_source, 'pm_web')));
  v_max_per_hour INTEGER := LEAST(GREATEST(COALESCE(p_max_per_hour, 6), 1), 60);
  v_now TIMESTAMPTZ := NOW();
  v_bucket TIMESTAMPTZ := date_trunc('hour', NOW());
  v_attempt_count INTEGER;
BEGIN
  IF v_client_fingerprint !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid waitlist client fingerprint' USING ERRCODE = '22023';
  END IF;

  IF v_platform NOT IN ('ios', 'android', 'web', 'unknown') THEN
    v_platform := 'unknown';
  END IF;

  IF v_source NOT IN ('pm_web', 'pm_app') THEN
    v_source := 'pm_web';
  END IF;

  IF v_ip_prefix = '' THEN
    v_ip_prefix := 'unknown';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtext('waitlist-edge:' || v_client_fingerprint || ':' || v_source || ':' || v_platform || ':' || v_bucket::TEXT)
  );

  INSERT INTO public.waitlist_edge_attempts (
    client_fingerprint,
    client_ip_prefix,
    platform,
    source,
    attempt_bucket,
    attempt_count,
    first_seen_at,
    last_seen_at
  )
  VALUES (
    v_client_fingerprint,
    v_ip_prefix,
    v_platform,
    v_source,
    v_bucket,
    1,
    v_now,
    v_now
  )
  ON CONFLICT (client_fingerprint, platform, source, attempt_bucket) DO UPDATE
  SET
    attempt_count = CASE
      WHEN public.waitlist_edge_attempts.attempt_count >= 2147483647 THEN 2147483647
      ELSE public.waitlist_edge_attempts.attempt_count + 1
    END,
    client_ip_prefix = EXCLUDED.client_ip_prefix,
    last_seen_at = v_now
  RETURNING public.waitlist_edge_attempts.attempt_count
  INTO v_attempt_count;

  allowed := v_attempt_count <= v_max_per_hour;
  retry_after_seconds := CASE
    WHEN allowed THEN 0
    ELSE GREATEST(
      CEIL(EXTRACT(EPOCH FROM ((v_bucket + INTERVAL '1 hour') - v_now)))::INTEGER,
      60
    )
  END;
  attempt_count := v_attempt_count;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_waitlist_edge_attempt(TEXT, TEXT, TEXT, TEXT, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_waitlist_edge_attempt(TEXT, TEXT, TEXT, TEXT, INTEGER)
  TO service_role;

REVOKE ALL ON FUNCTION public.submit_waitlist_signup(TEXT, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_waitlist_signup(TEXT, TEXT, TEXT)
  TO service_role;

COMMIT;
