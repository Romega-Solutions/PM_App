-- PinayMate server-side rate limit proof (ticket #44).
--
-- LOCAL DATABASE ONLY (supabase start). Runs in one transaction and rolls
-- back, but it creates throwaway auth users, so never run it against
-- staging or production.
--
-- Run:
--   psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/06_rate_limit_proof.sql
--
-- To keep the proof fast, the per-minute rules are lowered to 3 inside the
-- transaction. The real beta defaults are restored by the ROLLBACK.

BEGIN;

-- -------------------------------------------------------------------
-- Static contract
-- -------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass('public.rate_limit_rules') IS NULL
    OR to_regclass('public.rate_limit_events') IS NULL
  THEN
    RAISE EXCEPTION 'rate limit tables are missing';
  END IF;

  IF has_table_privilege('authenticated', 'public.rate_limit_rules', 'SELECT')
    OR has_table_privilege('authenticated', 'public.rate_limit_rules', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.rate_limit_rules', 'DELETE')
    OR has_table_privilege('authenticated', 'public.rate_limit_events', 'SELECT')
    OR has_table_privilege('authenticated', 'public.rate_limit_events', 'DELETE')
    OR has_table_privilege('anon', 'public.rate_limit_rules', 'SELECT')
    OR has_table_privilege('anon', 'public.rate_limit_events', 'SELECT')
  THEN
    RAISE EXCEPTION 'app clients must not read or change rate limit tables';
  END IF;

  IF has_function_privilege('authenticated', 'public.consume_rate_limit(text)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.assert_rate_limit_available(text, uuid, text)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.storage_upload_within_rate_limit(text)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'rate limit helpers must not be callable by app clients';
  END IF;

  IF (
    SELECT COUNT(*)
    FROM pg_trigger t
    WHERE NOT t.tgisinternal
      AND t.tgenabled <> 'D'
      AND t.tgname IN (
        'rate_limit_message_send',
        'rate_limit_conversation_create',
        'rate_limit_like',
        'rate_limit_pass',
        'rate_limit_report_submit',
        'rate_limit_verification_submit'
      )
  ) <> 6 THEN
    RAISE EXCEPTION 'all six rate limit triggers must exist and be enabled';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Uploads are rate limited per member'
      AND permissive = 'RESTRICTIVE'
      AND cmd = 'INSERT'
  ) THEN
    RAISE EXCEPTION 'restrictive storage upload rate limit policy is missing';
  END IF;

  RAISE NOTICE 'PASS static contract';
END;
$$;

-- -------------------------------------------------------------------
-- Fixtures: three throwaway members (A matched with B, C unrelated)
-- -------------------------------------------------------------------
CREATE TEMP TABLE _rl_users (label TEXT PRIMARY KEY, id UUID NOT NULL);
INSERT INTO _rl_users VALUES
  ('a', 'a4400000-0000-4000-8000-00000000000a'),
  ('b', 'a4400000-0000-4000-8000-00000000000b'),
  ('c', 'a4400000-0000-4000-8000-00000000000c');
GRANT SELECT ON _rl_users TO authenticated;

INSERT INTO auth.users (
  id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
SELECT
  u.id, 'authenticated', 'authenticated',
  'rl44-' || u.label || '@example.invalid', NOW(),
  '{"provider":"email","providers":["email"]}'::JSONB,
  jsonb_build_object('first_name', 'RL ' || u.label,
    'user_type', CASE WHEN u.label = 'a' THEN 'foreigner' ELSE 'filipina' END),
  NOW(), NOW()
FROM _rl_users u
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (
  id, email, first_name, user_type, gender, looking_for_gender, age, photos,
  is_active, is_verified, verification_status, age_preference_min,
  age_preference_max, distance_preference_km, created_at, updated_at
)
SELECT
  u.id, 'rl44-' || u.label || '@example.invalid', 'RL ' || u.label,
  CASE WHEN u.label = 'a' THEN 'foreigner' ELSE 'filipina' END,
  CASE WHEN u.label = 'a' THEN 'male' ELSE 'female' END,
  CASE WHEN u.label = 'a' THEN 'female' ELSE 'male' END,
  30, ARRAY['https://example.invalid/rl44.jpg'],
  TRUE, TRUE, 'approved', 18, 70, 100, NOW(), NOW()
FROM _rl_users u
ON CONFLICT (id) DO UPDATE SET
  user_type = EXCLUDED.user_type,
  gender = EXCLUDED.gender,
  looking_for_gender = EXCLUDED.looking_for_gender,
  age = EXCLUDED.age,
  photos = EXCLUDED.photos,
  is_active = TRUE,
  is_verified = TRUE,
  verification_status = 'approved';

-- Low per-minute limits for the proof (rolled back at the end).
UPDATE public.rate_limit_rules SET max_count = 3
WHERE (action, window_seconds) IN (
  ('message_send', 60), ('like', 60), ('pass', 60),
  ('storage_upload:profile-photos', 3600)
);
UPDATE public.rate_limit_rules SET max_count = 1
WHERE (action, window_seconds) IN (
  ('report_submit', 3600), ('verification_submit', 86400)
);

-- Helper used by the proof only (temp schema, gone after the session).
CREATE FUNCTION pg_temp.expect_rate_limited(p_sql TEXT, p_label TEXT, p_state TEXT DEFAULT 'PT429')
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  v_state TEXT;
  v_message TEXT;
  v_detail TEXT;
  v_hint TEXT;
BEGIN
  BEGIN
    EXECUTE p_sql;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS
      v_state = RETURNED_SQLSTATE,
      v_message = MESSAGE_TEXT,
      v_detail = PG_EXCEPTION_DETAIL,
      v_hint = PG_EXCEPTION_HINT;
  END;

  IF v_state IS DISTINCT FROM p_state OR v_message NOT LIKE 'Too many %' THEN
    RAISE EXCEPTION '% should be rate limited with %, got % (%)',
      p_label, p_state, COALESCE(v_state, 'success'), v_message;
  END IF;

  RAISE NOTICE 'PASS % blocked: sqlstate=% message=% detail=% hint=%',
    p_label, v_state, v_message, v_detail, v_hint;
END;
$$;
GRANT EXECUTE ON FUNCTION pg_temp.expect_rate_limited(TEXT, TEXT, TEXT) TO authenticated;

-- -------------------------------------------------------------------
-- 1. Match A and B (one like each, well under the limit)
-- -------------------------------------------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', (SELECT id::TEXT FROM _rl_users WHERE label = 'b'), TRUE);
SELECT 'b likes a' AS step, success, is_match FROM public.like_profile((SELECT id FROM _rl_users WHERE label = 'a'));
SELECT set_config('request.jwt.claim.sub', (SELECT id::TEXT FROM _rl_users WHERE label = 'a'), TRUE);
SELECT 'a likes b (match)' AS step, success, is_match FROM public.like_profile((SELECT id FROM _rl_users WHERE label = 'b'));

-- -------------------------------------------------------------------
-- 2. Passes: 3 allowed, 4th blocked; undo does not refund the quota
-- -------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', (SELECT id::TEXT FROM _rl_users WHERE label = 'c'), TRUE);
DO $$
DECLARE
  v_target UUID;
BEGIN
  SELECT id INTO v_target FROM pg_temp._rl_users WHERE label = 'a';
  FOR i IN 1..3 LOOP
    PERFORM public.pass_profile(v_target);
    PERFORM public.undo_last_swipe();
  END LOOP;
  RAISE NOTICE 'PASS 3 pass + undo cycles allowed';
END;
$$;
SELECT pg_temp.expect_rate_limited(
  format('SELECT public.pass_profile(%L::UUID)', (SELECT id FROM _rl_users WHERE label = 'a')),
  'pass #4 within a minute (after undos)'
);

-- -------------------------------------------------------------------
-- 3. Likes: 3 allowed, 4th blocked; like -> undo -> like loop still counts
-- -------------------------------------------------------------------
DO $$
DECLARE
  v_target UUID;
BEGIN
  SELECT id INTO v_target FROM pg_temp._rl_users WHERE label = 'a';
  FOR i IN 1..3 LOOP
    PERFORM public.like_profile(v_target);
    PERFORM public.undo_last_swipe();
  END LOOP;
  RAISE NOTICE 'PASS 3 like + undo cycles allowed';
END;
$$;
SELECT pg_temp.expect_rate_limited(
  format('SELECT public.like_profile(%L::UUID)', (SELECT id FROM _rl_users WHERE label = 'a')),
  'like #4 within a minute (after undos)'
);

-- -------------------------------------------------------------------
-- 4. Messages: 3 allowed, 4th blocked; the other member is not affected
-- -------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', (SELECT id::TEXT FROM _rl_users WHERE label = 'a'), TRUE);
SELECT 'a sends message ' || g AS step, (public.send_message((SELECT id FROM _rl_users WHERE label = 'b'), 'rl44 hello ' || g)).id IS NOT NULL AS sent
FROM generate_series(1, 3) g;
SELECT pg_temp.expect_rate_limited(
  format('SELECT public.send_message(%L::UUID, %L)', (SELECT id FROM _rl_users WHERE label = 'b'), 'rl44 hello 4'),
  'message #4 within a minute'
);

SELECT set_config('request.jwt.claim.sub', (SELECT id::TEXT FROM _rl_users WHERE label = 'b'), TRUE);
SELECT 'b replies (own quota)' AS step, (public.send_message((SELECT id FROM _rl_users WHERE label = 'a'), 'rl44 reply')).id IS NOT NULL AS sent;

-- -------------------------------------------------------------------
-- 5. Clients cannot see or reset the counters or rules
-- -------------------------------------------------------------------
DO $$
DECLARE
  v_blocked INTEGER := 0;
BEGIN
  BEGIN
    PERFORM 1 FROM public.rate_limit_events LIMIT 1;
  EXCEPTION WHEN insufficient_privilege THEN v_blocked := v_blocked + 1;
  END;
  BEGIN
    DELETE FROM public.rate_limit_events;
  EXCEPTION WHEN insufficient_privilege THEN v_blocked := v_blocked + 1;
  END;
  BEGIN
    UPDATE public.rate_limit_rules SET enabled = FALSE;
  EXCEPTION WHEN insufficient_privilege THEN v_blocked := v_blocked + 1;
  END;
  BEGIN
    PERFORM public.consume_rate_limit('message_send');
  EXCEPTION WHEN insufficient_privilege THEN v_blocked := v_blocked + 1;
  END;

  IF v_blocked <> 4 THEN
    RAISE EXCEPTION 'client reached rate limit internals (% of 4 blocked)', v_blocked;
  END IF;
  RAISE NOTICE 'PASS client cannot read, reset or disable rate limits (4/4 denied)';
END;
$$;

-- -------------------------------------------------------------------
-- 6. Storage uploads: 3 profile photos allowed, 4th blocked
-- -------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', (SELECT id::TEXT FROM _rl_users WHERE label = 'c'), TRUE);
INSERT INTO storage.objects (bucket_id, name, owner_id)
SELECT 'profile-photos', (SELECT id::TEXT FROM _rl_users WHERE label = 'c') || '/rl44-' || g || '.jpg',
  (SELECT id::TEXT FROM _rl_users WHERE label = 'c')
FROM generate_series(1, 3) g;
SELECT 'c uploaded 3 profile photos' AS step;
SELECT pg_temp.expect_rate_limited(
  format(
    'INSERT INTO storage.objects (bucket_id, name, owner_id) VALUES (%L, %L, %L)',
    'profile-photos',
    (SELECT id::TEXT FROM _rl_users WHERE label = 'c') || '/rl44-4.jpg',
    (SELECT id::TEXT FROM _rl_users WHERE label = 'c')
  ),
  'profile photo upload #4 within an hour',
  '42501'
);

-- -------------------------------------------------------------------
-- 7. Reports: 1 new report allowed (lowered), a report on another member blocked
-- -------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', (SELECT id::TEXT FROM _rl_users WHERE label = 'a'), TRUE);
SELECT public.submit_user_report((SELECT id FROM _rl_users WHERE label = 'b'), 'spam', 'rl44 proof', NULL, 'app');
SELECT 'a reported b' AS step;
SELECT public.submit_user_report((SELECT id FROM _rl_users WHERE label = 'b'), 'spam', 'rl44 same pair again', NULL, 'app');
SELECT 'a re-reported b (same-pair cooldown merge, not counted)' AS step;
SELECT pg_temp.expect_rate_limited(
  format('SELECT public.submit_user_report(%L::UUID, %L, %L, NULL, %L)',
    (SELECT id FROM _rl_users WHERE label = 'c'), 'spam', 'rl44 proof', 'app'),
  'new report on a second member within an hour'
);

-- -------------------------------------------------------------------
-- 8. Verification: 1 submission allowed (lowered), new evidence blocked
-- -------------------------------------------------------------------
INSERT INTO storage.objects (bucket_id, name, owner_id)
SELECT 'verification-docs', (SELECT id::TEXT FROM _rl_users WHERE label = 'a') || '/rl44-' || f || '.jpg',
  (SELECT id::TEXT FROM _rl_users WHERE label = 'a')
FROM unnest(ARRAY['selfie-1', 'doc-1', 'selfie-2', 'doc-2']) f;
SELECT public.submit_verification(
  (SELECT id::TEXT FROM _rl_users WHERE label = 'a') || '/rl44-selfie-1.jpg',
  (SELECT id::TEXT FROM _rl_users WHERE label = 'a') || '/rl44-doc-1.jpg'
);
SELECT 'a submitted verification' AS step;
SELECT pg_temp.expect_rate_limited(
  format('SELECT public.submit_verification(%L, %L)',
    (SELECT id::TEXT FROM _rl_users WHERE label = 'a') || '/rl44-selfie-2.jpg',
    (SELECT id::TEXT FROM _rl_users WHERE label = 'a') || '/rl44-doc-2.jpg'),
  'second verification submission within a day'
);

RESET ROLE;

-- -------------------------------------------------------------------
-- 9. Service role / server-side work is not limited
-- -------------------------------------------------------------------
SELECT set_config('request.jwt.claim.sub', '', TRUE);
DO $$
DECLARE
  v_a UUID := (SELECT id FROM pg_temp._rl_users WHERE label = 'a');
  v_b UUID := (SELECT id FROM pg_temp._rl_users WHERE label = 'b');
  v_conversation UUID;
BEGIN
  SELECT id INTO v_conversation
  FROM public.conversations
  WHERE (participant_1_id, participant_2_id) IN ((LEAST(v_a, v_b), GREATEST(v_a, v_b)));

  FOR i IN 1..10 LOOP
    INSERT INTO public.messages (conversation_id, sender_id, recipient_id, content, message_type, text, type, status, is_deleted, is_read)
    VALUES (v_conversation, v_a, v_b, 'server ' || i, 'text', 'server ' || i, 'text', 'sent', FALSE, FALSE);
  END LOOP;
  RAISE NOTICE 'PASS 10 server-side message inserts without auth.uid() were not limited';
END;
$$;

DO $$
BEGIN
  IF (
    SELECT COUNT(*) FROM public.rate_limit_events e
    WHERE e.user_id IN (SELECT id FROM pg_temp._rl_users)
  ) = 0 THEN
    RAISE EXCEPTION 'expected rate limit events for the proof members';
  END IF;
END;
$$;

SELECT action, COUNT(*) AS events
FROM public.rate_limit_events
WHERE user_id IN (SELECT id FROM _rl_users)
GROUP BY action
ORDER BY action;

SELECT 'PASS: rate limit proof completed; transaction will roll back' AS result;

ROLLBACK;
