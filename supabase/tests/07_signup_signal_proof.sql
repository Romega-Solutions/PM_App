-- Ticket #48 LOCAL ONLY proof for public.signup_signals and its functions.
-- Run against a local `supabase start` database. Everything is rolled back.
--   psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/07_signup_signal_proof.sql

BEGIN;

DO $$
DECLARE
  v_role TEXT;
  v_priv TEXT;
  v_fn TEXT;
BEGIN
  -- 1. No client table access.
  FOREACH v_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    FOREACH v_priv IN ARRAY ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] LOOP
      IF has_table_privilege(v_role, 'public.signup_signals', v_priv) THEN
        RAISE EXCEPTION 'FAIL: % has % on public.signup_signals', v_role, v_priv;
      END IF;
    END LOOP;
  END LOOP;

  -- 2. RLS enabled and forced.
  IF NOT EXISTS (
    SELECT 1 FROM pg_class
    WHERE oid = 'public.signup_signals'::regclass AND relrowsecurity AND relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'FAIL: RLS not enabled+forced on public.signup_signals';
  END IF;

  -- 3. Function EXECUTE grants.
  v_fn := 'public.record_signup_signal(uuid,uuid,text,text,text,text,text,boolean,boolean,boolean,boolean,integer,text,text[],text,jsonb)';
  IF has_function_privilege('anon', v_fn, 'EXECUTE') OR has_function_privilege('authenticated', v_fn, 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: clients can execute record_signup_signal';
  END IF;
  IF NOT has_function_privilege('service_role', v_fn, 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: service_role cannot execute record_signup_signal';
  END IF;

  IF has_function_privilege('anon', 'public.get_my_signup_signal()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: anon can execute get_my_signup_signal';
  END IF;
  IF NOT has_function_privilege('authenticated', 'public.get_my_signup_signal()', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: authenticated cannot execute get_my_signup_signal';
  END IF;

  IF has_function_privilege('anon', 'public.purge_orphan_signup_signals(interval)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.purge_orphan_signup_signals(interval)', 'EXECUTE') THEN
    RAISE EXCEPTION 'FAIL: clients can execute purge_orphan_signup_signals';
  END IF;

  -- 4. SECURITY DEFINER functions pin search_path to ''.
  IF EXISTS (
    SELECT 1 FROM pg_proc p
    WHERE p.pronamespace = 'public'::regnamespace
      AND p.proname IN ('record_signup_signal', 'get_my_signup_signal', 'purge_orphan_signup_signals')
      AND (NOT p.prosecdef OR NOT coalesce(p.proconfig, '{}'::TEXT[]) @> ARRAY['search_path=""'])
  ) THEN
    RAISE EXCEPTION 'FAIL: signup signal functions must be SECURITY DEFINER with search_path=""';
  END IF;

  RAISE NOTICE 'PASS: grants, RLS, and search_path checks';
END;
$$;

-- 5. Writer validation + upsert + orphan purge.
SELECT public.record_signup_signal(
  '22222222-2222-2222-2222-222222222222', NULL, 'Google', 'ipqs', 'ok',
  'ph', 'Metro Manila', false, false, false, true, 150, 'none', ARRAY[]::TEXT[], 'allow', '{"success":true}'::JSONB
);

DO $$
DECLARE
  v_row public.signup_signals;
  v_deleted INTEGER;
BEGIN
  SELECT * INTO v_row FROM public.signup_signals WHERE user_id = '22222222-2222-2222-2222-222222222222';
  IF v_row.country_code <> 'PH' OR v_row.auth_provider <> 'google' OR v_row.fraud_score IS NOT NULL THEN
    RAISE EXCEPTION 'FAIL: writer normalisation (country %, provider %, score %)', v_row.country_code, v_row.auth_provider, v_row.fraud_score;
  END IF;

  -- Orphan (no auth.users row) older than the grace period is purged.
  UPDATE public.signup_signals SET created_at = now() - INTERVAL '8 days'
  WHERE user_id = '22222222-2222-2222-2222-222222222222';
  v_deleted := public.purge_orphan_signup_signals();
  IF v_deleted < 1 OR EXISTS (SELECT 1 FROM public.signup_signals WHERE user_id = '22222222-2222-2222-2222-222222222222') THEN
    RAISE EXCEPTION 'FAIL: orphan row was not purged';
  END IF;

  RAISE NOTICE 'PASS: writer normalisation and orphan purge';
END;
$$;

-- 6. A user only sees their own soft flag, never another user's.
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  PERFORM set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO v_count FROM public.get_my_signup_signal();
  RESET ROLE;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'FAIL: get_my_signup_signal returned % rows for a user with no signal', v_count;
  END IF;
  RAISE NOTICE 'PASS: get_my_signup_signal is scoped to auth.uid()';
END;
$$;

ROLLBACK;
