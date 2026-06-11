-- Account deletion request queue
-- Gives users a backend-backed privacy request without performing immediate
-- destructive account deletion from the client.

CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'completed', 'cancelled')),
  reason TEXT,
  source TEXT NOT NULL DEFAULT 'privacy_settings',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_account_deletion_requests_one_pending
  ON public.account_deletion_requests(user_id)
  WHERE status IN ('pending', 'reviewing');

CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status
  ON public.account_deletion_requests(status, requested_at DESC);

ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.account_deletion_requests FROM PUBLIC, anon;
REVOKE ALL ON public.account_deletion_requests FROM authenticated;
GRANT SELECT ON public.account_deletion_requests TO authenticated;

DROP POLICY IF EXISTS "Users can read own account deletion requests"
  ON public.account_deletion_requests;
CREATE POLICY "Users can read own account deletion requests"
  ON public.account_deletion_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.request_account_deletion(
  p_reason TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'privacy_settings'
)
RETURNS TABLE (
  id UUID,
  status TEXT,
  requested_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current_user UUID := auth.uid();
  v_request public.account_deletion_requests%ROWTYPE;
BEGIN
  IF v_current_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.account_deletion_requests (
    user_id,
    reason,
    source,
    status,
    requested_at,
    updated_at
  )
  VALUES (
    v_current_user,
    NULLIF(BTRIM(COALESCE(p_reason, '')), ''),
    COALESCE(NULLIF(BTRIM(p_source), ''), 'privacy_settings'),
    'pending',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) WHERE status IN ('pending', 'reviewing')
  DO UPDATE SET
    reason = COALESCE(EXCLUDED.reason, public.account_deletion_requests.reason),
    source = EXCLUDED.source,
    updated_at = NOW()
  RETURNING *
  INTO v_request;

  RETURN QUERY
  SELECT
    v_request.id,
    v_request.status,
    v_request.requested_at;
END;
$$;

REVOKE ALL ON FUNCTION public.request_account_deletion(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_account_deletion(TEXT, TEXT) TO authenticated;
