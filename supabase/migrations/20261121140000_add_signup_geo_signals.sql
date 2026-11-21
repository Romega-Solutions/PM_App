-- Ticket #48: geo-lock signal at sign-up (soft filter, not a wall).
--
-- The `before-user-created` Edge Function (Supabase Auth HTTP hook) looks up the
-- sign-up IP with a vendor, then calls public.record_signup_signal() with the
-- service-role key. Nothing here blocks a sign-up: the row is a filter signal for
-- moderation and for the later ID-review path (Persona, week 3).
--
-- Privacy: the raw IP address is NOT stored. Only country/region, VPN/proxy/Tor/
-- mobile flags, a fraud score, and a trimmed provider status object are kept.
--
-- The auth.users row does not exist yet when the hook runs, so user_id has no
-- foreign key. public.purge_orphan_signup_signals() removes rows whose user was
-- never created (blocked or failed sign-up) or has since been deleted.

CREATE TABLE IF NOT EXISTS public.signup_signals (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL,
  hook_request_id UUID,
  auth_provider TEXT NOT NULL DEFAULT 'unknown'
    CHECK (auth_provider ~ '^[a-z0-9_-]{1,32}$'),
  provider TEXT NOT NULL
    CHECK (provider IN ('ipqs', 'ipinfo_lite', 'none')),
  lookup_status TEXT NOT NULL
    CHECK (lookup_status IN ('ok', 'error', 'timeout', 'quota', 'not_configured', 'no_ip', 'private_ip')),
  country_code TEXT
    CHECK (country_code IS NULL OR country_code ~ '^[A-Z]{2}$'),
  region TEXT
    CHECK (region IS NULL OR char_length(region) <= 100),
  is_vpn BOOLEAN,
  is_proxy BOOLEAN,
  is_tor BOOLEAN,
  is_mobile BOOLEAN,
  fraud_score SMALLINT
    CHECK (fraud_score IS NULL OR fraud_score BETWEEN 0 AND 100),
  soft_flag TEXT NOT NULL
    CHECK (soft_flag IN ('none', 'review_suggested', 'unavailable')),
  reasons TEXT[] NOT NULL DEFAULT '{}'::TEXT[]
    CHECK (cardinality(reasons) <= 8),
  enforcement TEXT NOT NULL DEFAULT 'allow'
    CHECK (enforcement IN ('allow', 'blocked')),
  provider_status JSONB NOT NULL DEFAULT '{}'::JSONB
    CHECK (jsonb_typeof(provider_status) = 'object' AND octet_length(provider_status::TEXT) <= 4096),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT signup_signals_user_id_key UNIQUE (user_id)
);

COMMENT ON TABLE public.signup_signals IS
  'Ticket #48: server-side country + VPN/proxy signal captured by the before-user-created Auth hook. Soft filter only; no raw IP stored.';

CREATE INDEX IF NOT EXISTS idx_signup_signals_review
  ON public.signup_signals (created_at DESC)
  WHERE soft_flag <> 'none';

ALTER TABLE public.signup_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_signals FORCE ROW LEVEL SECURITY;

-- No client access at all. Reads go through get_my_signup_signal(); writes go
-- through record_signup_signal() from the Edge Function only.
REVOKE ALL ON public.signup_signals FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.signup_signals_id_seq FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Writer: service_role only (called by the before-user-created Edge Function).
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_signup_signal(
  p_user_id UUID,
  p_hook_request_id UUID,
  p_auth_provider TEXT,
  p_provider TEXT,
  p_lookup_status TEXT,
  p_country_code TEXT,
  p_region TEXT,
  p_is_vpn BOOLEAN,
  p_is_proxy BOOLEAN,
  p_is_tor BOOLEAN,
  p_is_mobile BOOLEAN,
  p_fraud_score INTEGER,
  p_soft_flag TEXT,
  p_reasons TEXT[],
  p_enforcement TEXT,
  p_provider_status JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_auth_provider TEXT := lower(left(coalesce(nullif(trim(p_auth_provider), ''), 'unknown'), 32));
  v_country TEXT := upper(nullif(trim(p_country_code), ''));
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'user id is required' USING ERRCODE = '22023';
  END IF;

  IF v_auth_provider !~ '^[a-z0-9_-]{1,32}$' THEN
    v_auth_provider := 'unknown';
  END IF;

  IF v_country IS NOT NULL AND v_country !~ '^[A-Z]{2}$' THEN
    v_country := NULL;
  END IF;

  INSERT INTO public.signup_signals (
    user_id, hook_request_id, auth_provider, provider, lookup_status,
    country_code, region, is_vpn, is_proxy, is_tor, is_mobile, fraud_score,
    soft_flag, reasons, enforcement, provider_status
  )
  VALUES (
    p_user_id,
    p_hook_request_id,
    v_auth_provider,
    p_provider,
    p_lookup_status,
    v_country,
    left(nullif(trim(p_region), ''), 100),
    p_is_vpn,
    p_is_proxy,
    p_is_tor,
    p_is_mobile,
    CASE WHEN p_fraud_score BETWEEN 0 AND 100 THEN p_fraud_score::SMALLINT ELSE NULL END,
    p_soft_flag,
    coalesce(p_reasons[1:8], '{}'::TEXT[]),
    coalesce(p_enforcement, 'allow'),
    coalesce(p_provider_status, '{}'::JSONB)
  )
  ON CONFLICT (user_id) DO UPDATE SET
    hook_request_id = EXCLUDED.hook_request_id,
    auth_provider = EXCLUDED.auth_provider,
    provider = EXCLUDED.provider,
    lookup_status = EXCLUDED.lookup_status,
    country_code = EXCLUDED.country_code,
    region = EXCLUDED.region,
    is_vpn = EXCLUDED.is_vpn,
    is_proxy = EXCLUDED.is_proxy,
    is_tor = EXCLUDED.is_tor,
    is_mobile = EXCLUDED.is_mobile,
    fraud_score = EXCLUDED.fraud_score,
    soft_flag = EXCLUDED.soft_flag,
    reasons = EXCLUDED.reasons,
    enforcement = EXCLUDED.enforcement,
    provider_status = EXCLUDED.provider_status,
    created_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.record_signup_signal(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, TEXT[], TEXT, JSONB
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_signup_signal(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, INTEGER, TEXT, TEXT[], TEXT, JSONB
) TO service_role;

-- ---------------------------------------------------------------------------
-- Reader for the app: the signed-in user's own soft flag only.
-- Deliberately does NOT return country, VPN flags, or reasons, so the app can
-- show a gentle "we may ask for ID later" note without teaching evasion.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_signup_signal()
RETURNS TABLE (soft_flag TEXT, checked_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT s.soft_flag, s.created_at
  FROM public.signup_signals s
  WHERE s.user_id = auth.uid()
    AND s.enforcement = 'allow';
$$;

REVOKE ALL ON FUNCTION public.get_my_signup_signal() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_signup_signal() TO authenticated;

-- ---------------------------------------------------------------------------
-- Cleanup: rows with no matching auth user (blocked/failed sign-up, deleted
-- account) older than the grace period. Run from a scheduled job or by hand.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.purge_orphan_signup_signals(p_older_than INTERVAL DEFAULT INTERVAL '7 days')
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM public.signup_signals s
  WHERE s.created_at < now() - greatest(coalesce(p_older_than, INTERVAL '7 days'), INTERVAL '1 hour')
    AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = s.user_id);

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_orphan_signup_signals(INTERVAL) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_orphan_signup_signals(INTERVAL) TO service_role;
