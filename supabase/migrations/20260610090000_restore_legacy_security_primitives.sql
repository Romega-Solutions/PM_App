-- Restore security primitives from the archived duplicate 04 migration.
--
-- The legacy file 04_production_security_hardening.sql used the same migration
-- version as 04_production_core_hardening.sql. Keep the needed primitives in a
-- real timestamped migration so fresh environments rebuild safely and linked
-- Supabase no longer sees the stale duplicate 04 as pending.

BEGIN;

DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
  END IF;

  IF to_regprocedure('public.manual_verify_user(text)') IS NOT NULL THEN
    ALTER FUNCTION public.manual_verify_user(TEXT) SET search_path = '';
    REVOKE EXECUTE ON FUNCTION public.manual_verify_user(TEXT) FROM PUBLIC, anon, authenticated;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  details TEXT DEFAULT '',
  source TEXT DEFAULT 'app',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'open', 'reviewing', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT user_reports_not_self CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_reports_reporter
  ON public.user_reports(reporter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported
  ON public.user_reports(reported_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_status
  ON public.user_reports(status, created_at DESC);

ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_reports FROM PUBLIC, anon;
REVOKE ALL ON public.user_reports FROM authenticated;
GRANT SELECT ON public.user_reports TO authenticated;

DROP POLICY IF EXISTS "Users can create own reports" ON public.user_reports;
CREATE POLICY "Users can create own reports"
  ON public.user_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = (SELECT auth.uid())
    AND reporter_id <> reported_user_id
  );

DROP POLICY IF EXISTS "Users can read own reports" ON public.user_reports;
CREATE POLICY "Users can read own reports"
  ON public.user_reports
  FOR SELECT
  TO authenticated
  USING (reporter_id = (SELECT auth.uid()));

CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (blocker_id, blocked_user_id),
  CONSTRAINT user_blocks_not_self CHECK (blocker_id <> blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked
  ON public.user_blocks(blocked_user_id, blocker_id);

ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.user_blocks FROM PUBLIC, anon;
REVOKE ALL ON public.user_blocks FROM authenticated;
GRANT SELECT ON public.user_blocks TO authenticated;

DROP POLICY IF EXISTS "Users can read own blocks" ON public.user_blocks;
CREATE POLICY "Users can read own blocks"
  ON public.user_blocks
  FOR SELECT
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create own blocks" ON public.user_blocks;
CREATE POLICY "Users can create own blocks"
  ON public.user_blocks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    blocker_id = (SELECT auth.uid())
    AND blocker_id <> blocked_user_id
  );

DROP POLICY IF EXISTS "Users can delete own blocks" ON public.user_blocks;
CREATE POLICY "Users can delete own blocks"
  ON public.user_blocks
  FOR DELETE
  TO authenticated
  USING (blocker_id = (SELECT auth.uid()));

CREATE OR REPLACE FUNCTION public.unmatch_user(
  p_other_user_id UUID
)
RETURNS VOID
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

  IF p_other_user_id IS NULL OR p_other_user_id = v_current_user THEN
    RAISE EXCEPTION 'A different member is required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.likes
  SET
    is_match = FALSE,
    matched_at = NULL
  WHERE is_match = TRUE
    AND (
      (from_user_id = v_current_user AND to_user_id = p_other_user_id)
      OR (from_user_id = p_other_user_id AND to_user_id = v_current_user)
    );
END;
$$;

REVOKE ALL ON FUNCTION public.unmatch_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.unmatch_user(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.block_user(
  p_blocked_user_id UUID
)
RETURNS VOID
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

  IF p_blocked_user_id IS NULL OR p_blocked_user_id = v_current_user THEN
    RAISE EXCEPTION 'A different member is required' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.user_blocks (blocker_id, blocked_user_id)
  VALUES (v_current_user, p_blocked_user_id)
  ON CONFLICT (blocker_id, blocked_user_id) DO NOTHING;

  PERFORM public.unmatch_user(p_blocked_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.block_user(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.block_user(UUID) TO authenticated;

COMMIT;
