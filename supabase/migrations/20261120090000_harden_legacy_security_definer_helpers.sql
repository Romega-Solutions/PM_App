-- Harden legacy SECURITY DEFINER helpers so a rebuilt database matches the
-- launch security contract.
--
-- These functions were last defined in 03_add_conversations_table.sql or
-- 04_production_core_hardening.sql. Their hardening lived only in the
-- archived duplicate supabase/archived_migrations/04_production_security_hardening.sql,
-- so a database rebuilt from supabase/migrations failed
-- supabase/tests/04_safety_smoke_test.sql with:
--   1. "SECURITY DEFINER functions must use an empty fixed search_path"
--   2. "Unsafe function execute privilege is still exposed"
--      (authenticated could execute the trigger function
--      public.update_conversation_on_message()).
--
-- Every body already uses schema-qualified names (public.*, auth.uid()) and
-- pg_catalog built-ins, so an empty search_path does not change behavior.
-- ALTER FUNCTION only changes configuration, not the body. Trigger functions
-- do not need EXECUTE for the role that fires the trigger.
-- Each change is skipped when the exact signature does not exist, so the
-- migration is safe on environments whose function set differs.

BEGIN;

DO $$
DECLARE
  v_signature TEXT;
BEGIN
  FOREACH v_signature IN ARRAY ARRAY[
    'public.can_message_profile(uuid, uuid)',
    'public.can_view_profile(uuid)',
    'public.current_app_role()',
    'public.has_block_between(uuid, uuid)',
    'public.is_admin()',
    'public.is_conversation_participant(uuid, uuid)',
    'public.reset_unread_count(uuid, uuid)',
    'public.sync_profile_membership_from_subscription()',
    'public.sync_profile_verification_from_event()',
    'public.update_conversation_on_message()',
    'public.upsert_match_from_like()'
  ]
  LOOP
    IF to_regprocedure(v_signature) IS NOT NULL THEN
      EXECUTE format('ALTER FUNCTION %s SET search_path = %L', v_signature, '');
    END IF;
  END LOOP;

  IF to_regprocedure('public.update_conversation_on_message()') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.update_conversation_on_message() FROM PUBLIC, anon, authenticated;
  END IF;
END;
$$;

COMMIT;
