-- Restrict conversation creation to the message-send RPC.
--
-- public.send_message() still calls public.get_or_create_conversation()
-- internally as a SECURITY DEFINER helper, but app clients must not execute
-- the helper directly because that can create visible empty inbox rows for
-- matched members without sending a message.

BEGIN;

DO $$
BEGIN
  IF to_regprocedure('public.get_or_create_conversation(uuid, uuid)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.get_or_create_conversation(UUID, UUID) FROM PUBLIC, anon, authenticated, service_role';
    EXECUTE 'COMMENT ON FUNCTION public.get_or_create_conversation(UUID, UUID) IS ''Private helper for send_message; direct client execution is denied to prevent empty conversation creation.''';
  END IF;
END;
$$;

COMMIT;
