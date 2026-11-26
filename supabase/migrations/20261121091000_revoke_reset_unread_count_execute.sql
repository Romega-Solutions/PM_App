-- Stop app clients from calling public.reset_unread_count(uuid, uuid).
--
-- The function is SECURITY DEFINER and was granted to authenticated in
-- 02_chat_schema_updates.sql and 03_add_conversations_table.sql. Its body
-- zeroes the unread counter for p_user_id in p_conversation_id without
-- checking auth.uid(), so any signed-in user could reset the unread count of
-- a conversation they are not part of and cannot even read.
--
-- No app or web client calls it: the app marks conversations read through
-- public.mark_conversation_read(uuid), which checks the caller. So this
-- migration only removes the grant. service_role keeps EXECUTE for
-- operational use. The function body is not changed.

BEGIN;

DO $$
BEGIN
  IF to_regprocedure('public.reset_unread_count(uuid, uuid)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.reset_unread_count(uuid, uuid) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.reset_unread_count(uuid, uuid) TO service_role;
  END IF;
END;
$$;

COMMIT;
