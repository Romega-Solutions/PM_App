-- Repair account deletion request RPC conflict predicate ambiguity.

BEGIN;

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
  ON CONFLICT (user_id)
    WHERE public.account_deletion_requests.status IN ('pending', 'reviewing')
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

COMMIT;
