-- PinayMate safety smoke test for the production hardening migrations.
--
-- Run after applying the full launch migration set in
-- supabase/LAUNCH_MIGRATION_MANIFEST.md, including
-- supabase/migrations/20260611123000_add_notification_preferences.sql,
-- in a staging/local Supabase database with at least two existing profiles.
--
-- This script runs in one transaction and rolls back all data changes.
-- It is intended for SQL Editor or psql with a privileged database role.

BEGIN;

DO $$
DECLARE
  v_first_signup RECORD;
  v_duplicate_signup RECORD;
  v_blocked_duplicate_signup RECORD;
  v_submission_count INTEGER;
  v_invalid_email_rejected BOOLEAN := FALSE;
BEGIN
  IF to_regclass('public.waitlist_signups') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.waitlist_signups';
  END IF;

  IF to_regprocedure('public.submit_waitlist_signup(text, text, text)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.submit_waitlist_signup(text, text, text)';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'waitlist_signups'
      AND indexname = 'idx_waitlist_signups_recent_source_platform'
  )
    OR pg_get_functiondef(
      to_regprocedure('public.submit_waitlist_signup(text, text, text)')
    ) NOT ILIKE '%v_recent_source_count >= 30%'
    OR pg_get_functiondef(
      to_regprocedure('public.submit_waitlist_signup(text, text, text)')
    ) NOT ILIKE '%INTERVAL ''1 minute''%'
    OR pg_get_functiondef(
      to_regprocedure('public.submit_waitlist_signup(text, text, text)')
    ) NOT ILIKE '%waitlist-source:%'
    OR pg_get_functiondef(
      to_regprocedure('public.submit_waitlist_signup(text, text, text)')
    ) NOT ILIKE '%v_source NOT IN (''pm_web'', ''pm_app'')%'
    OR pg_get_functiondef(
      to_regprocedure('public.submit_waitlist_signup(text, text, text)')
    ) NOT ILIKE '%status := ''accepted''%'
  THEN
    RAISE EXCEPTION 'submit_waitlist_signup source/platform burst controls are missing';
  END IF;

  IF has_table_privilege('anon', 'public.waitlist_signups', 'SELECT')
    OR has_table_privilege('anon', 'public.waitlist_signups', 'INSERT')
    OR has_table_privilege('anon', 'public.waitlist_signups', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.waitlist_signups', 'SELECT')
    OR has_table_privilege('authenticated', 'public.waitlist_signups', 'INSERT')
    OR has_table_privilege('authenticated', 'public.waitlist_signups', 'UPDATE')
    OR has_table_privilege('service_role', 'public.waitlist_signups', 'SELECT')
    OR has_table_privilege('service_role', 'public.waitlist_signups', 'INSERT')
    OR has_table_privilege('service_role', 'public.waitlist_signups', 'UPDATE')
    OR has_table_privilege('service_role', 'public.waitlist_signups', 'DELETE')
  THEN
    RAISE EXCEPTION 'waitlist_signups direct table access unexpectedly exposed';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'waitlist_signups'
      AND c.relrowsecurity
      AND c.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'waitlist_signups must have forced RLS';
  END IF;

  SELECT *
  INTO v_first_signup
  FROM public.submit_waitlist_signup(
    'Smoke.Waitlist+First@example.com',
    'ios',
    'pm_web'
  );

  IF v_first_signup.id IS NOT NULL
    OR v_first_signup.email_normalized <> 'smoke.waitlist+first@example.com'
    OR v_first_signup.platform <> 'ios'
    OR v_first_signup.status <> 'accepted'
  THEN
    RAISE EXCEPTION 'submit_waitlist_signup did not return the expected generic accepted response';
  END IF;

  SELECT *
  INTO v_duplicate_signup
  FROM public.submit_waitlist_signup(
    'SMOKE.WAITLIST+FIRST@example.com',
    'ios',
    'support'
  );

  IF v_duplicate_signup.id IS NOT NULL
    OR v_duplicate_signup.status <> 'accepted'
    OR v_duplicate_signup.email_normalized <> 'smoke.waitlist+first@example.com'
  THEN
    RAISE EXCEPTION 'Duplicate waitlist signup leaked existing row metadata';
  END IF;

  SELECT submission_count
  INTO v_submission_count
  FROM public.waitlist_signups
  WHERE email_normalized = 'smoke.waitlist+first@example.com'
    AND platform = 'ios';

  IF v_submission_count <> 1 THEN
    RAISE EXCEPTION 'Duplicate waitlist cooldown did not suppress repeat write';
  END IF;

  UPDATE public.waitlist_signups
  SET status = 'blocked'
  WHERE email_normalized = 'smoke.waitlist+first@example.com'
    AND platform = 'ios';

  SELECT *
  INTO v_blocked_duplicate_signup
  FROM public.submit_waitlist_signup(
    'Smoke.Waitlist+First@example.com',
    'ios',
    'pm_web'
  );

  IF v_blocked_duplicate_signup.id IS NOT NULL
    OR v_blocked_duplicate_signup.status <> 'accepted'
  THEN
    RAISE EXCEPTION 'Blocked waitlist signup leaked existing row metadata';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.waitlist_signups
    WHERE email_normalized = 'smoke.waitlist+first@example.com'
      AND platform = 'ios'
      AND status <> 'blocked'
  ) THEN
    RAISE EXCEPTION 'Blocked waitlist signup was unexpectedly refreshed by duplicate submission';
  END IF;

  BEGIN
    PERFORM public.submit_waitlist_signup(
      'not-an-email',
      'ios',
      'pm_web'
    );
  EXCEPTION
    WHEN SQLSTATE '22023' THEN
      v_invalid_email_rejected := TRUE;
  END;

  IF NOT v_invalid_email_rejected THEN
    RAISE EXCEPTION 'Invalid waitlist signup unexpectedly succeeded';
  END IF;
END;
$$;

DO $$
BEGIN
  IF to_regclass('public.user_reports') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.user_reports';
  END IF;

  IF to_regclass('public.user_blocks') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.user_blocks';
  END IF;

  IF to_regclass('public.ocr_usage_events') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.ocr_usage_events';
  END IF;

  IF to_regclass('public.account_deletion_requests') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.account_deletion_requests';
  END IF;

  IF to_regclass('public.user_privacy_settings') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.user_privacy_settings';
  END IF;

  IF to_regclass('public.user_notification_preferences') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.user_notification_preferences';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'discoverable_profiles'
      AND c.relkind = 'v'
      AND 'security_invoker=true' = ANY(COALESCE(c.reloptions, ARRAY[]::text[]))
  ) THEN
    RAISE EXCEPTION 'public.discoverable_profiles must not use security_invoker=true because it enforces privacy flags from owner-readable rows internally';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'discoverable_profiles'
      AND column_name IN (
        'email',
        'phone',
        'phone_number',
        'verification_selfie',
        'verification_document',
        'verification_extracted_first_name',
        'verification_extracted_last_name',
        'verification_extracted_age',
        'verification_mismatch_reasons',
        'verification_reviewer_id',
        'verification_reviewer_note',
        'verification_reviewed_at',
        'privacy_settings',
        'reporter_id',
        'reported_user_id',
        'reviewer_id',
        'reviewer_note'
      )
  ) THEN
    RAISE EXCEPTION 'discoverable_profiles exposes sensitive or server-owned columns';
  END IF;

  IF to_regprocedure('public.block_user(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.block_user(uuid)';
  END IF;

  IF to_regprocedure('public.unmatch_user(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.unmatch_user(uuid)';
  END IF;

  IF to_regprocedure('public.get_or_create_conversation(uuid, uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.get_or_create_conversation(uuid, uuid)';
  END IF;

  IF to_regprocedure('public.get_user_conversations(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.get_user_conversations(uuid)';
  END IF;

  IF pg_get_functiondef(
      to_regprocedure('public.get_user_conversations(uuid)')
    ) NOT ILIKE '%c.last_message_id IS NOT NULL%'
  THEN
    RAISE EXCEPTION 'get_user_conversations no-empty-inbox guard is missing';
  END IF;

  IF has_function_privilege(
      'anon',
      'public.get_or_create_conversation(uuid, uuid)',
      'EXECUTE'
    )
    OR has_function_privilege(
      'authenticated',
      'public.get_or_create_conversation(uuid, uuid)',
      'EXECUTE'
    )
    OR has_function_privilege(
      'service_role',
      'public.get_or_create_conversation(uuid, uuid)',
      'EXECUTE'
    )
  THEN
    RAISE EXCEPTION 'get_or_create_conversation direct execution unexpectedly exposed';
  END IF;

  IF to_regprocedure('public.send_message(uuid, text, text, text, uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.send_message(uuid, text, text, text, uuid)';
  END IF;

  IF pg_get_functiondef(
      to_regprocedure('public.send_message(uuid, text, text, text, uuid)')
    ) NOT ILIKE '%get_or_create_conversation%'
  THEN
    RAISE EXCEPTION 'send_message must own the get_or_create_conversation path';
  END IF;

  IF to_regprocedure('public.like_profile(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.like_profile(uuid)';
  END IF;

  IF to_regprocedure('public.submit_verification(text, text, text, text, integer, text[])') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.submit_verification(text, text, text, text, integer, text[])';
  END IF;

  IF to_regprocedure('public.claim_ocr_attempt(integer, integer)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.claim_ocr_attempt(integer, integer)';
  END IF;

  IF to_regprocedure('public.save_basic_info(text, text, integer, text)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.save_basic_info(text, text, integer, text)';
  END IF;

  IF to_regprocedure('public.clear_verification_submission()') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.clear_verification_submission()';
  END IF;

  IF to_regprocedure('public.submit_user_report(uuid, text, text, uuid, text)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.submit_user_report(uuid, text, text, uuid, text)';
  END IF;

  IF to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.review_user_report(uuid, text, text, text, text, uuid)';
  END IF;

  IF to_regclass('public.moderation_reviewers') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.moderation_reviewers';
  END IF;

  IF to_regclass('public.moderation_reviewer_audit_log') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.moderation_reviewer_audit_log';
  END IF;

  IF to_regprocedure('public.log_moderation_reviewer_change()') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.log_moderation_reviewer_change()';
  END IF;

  IF to_regprocedure('public.upsert_moderation_reviewer(uuid, text, text, boolean, uuid, text)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.upsert_moderation_reviewer(uuid, text, text, boolean, uuid, text)';
  END IF;

  IF to_regprocedure('public.deactivate_moderation_reviewer(uuid, uuid, text)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.deactivate_moderation_reviewer(uuid, uuid, text)';
  END IF;

  IF has_table_privilege('anon', 'public.moderation_reviewers', 'SELECT')
    OR has_table_privilege('anon', 'public.moderation_reviewers', 'INSERT')
    OR has_table_privilege('anon', 'public.moderation_reviewers', 'UPDATE')
    OR has_table_privilege('anon', 'public.moderation_reviewers', 'DELETE')
    OR has_table_privilege('authenticated', 'public.moderation_reviewers', 'SELECT')
    OR has_table_privilege('authenticated', 'public.moderation_reviewers', 'INSERT')
    OR has_table_privilege('authenticated', 'public.moderation_reviewers', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.moderation_reviewers', 'DELETE')
    OR has_table_privilege('service_role', 'public.moderation_reviewers', 'INSERT')
    OR has_table_privilege('service_role', 'public.moderation_reviewers', 'UPDATE')
    OR has_table_privilege('service_role', 'public.moderation_reviewers', 'DELETE')
  THEN
    RAISE EXCEPTION 'moderation_reviewers direct table access unexpectedly exposed';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'moderation_reviewers'
      AND c.relrowsecurity
      AND c.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'moderation_reviewers must have forced RLS';
  END IF;

  IF has_table_privilege('anon', 'public.moderation_reviewer_audit_log', 'SELECT')
    OR has_table_privilege('anon', 'public.moderation_reviewer_audit_log', 'INSERT')
    OR has_table_privilege('anon', 'public.moderation_reviewer_audit_log', 'UPDATE')
    OR has_table_privilege('anon', 'public.moderation_reviewer_audit_log', 'DELETE')
    OR has_table_privilege('authenticated', 'public.moderation_reviewer_audit_log', 'SELECT')
    OR has_table_privilege('authenticated', 'public.moderation_reviewer_audit_log', 'INSERT')
    OR has_table_privilege('authenticated', 'public.moderation_reviewer_audit_log', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.moderation_reviewer_audit_log', 'DELETE')
    OR has_table_privilege('service_role', 'public.moderation_reviewer_audit_log', 'INSERT')
    OR has_table_privilege('service_role', 'public.moderation_reviewer_audit_log', 'UPDATE')
    OR has_table_privilege('service_role', 'public.moderation_reviewer_audit_log', 'DELETE')
  THEN
    RAISE EXCEPTION 'moderation_reviewer_audit_log direct table access unexpectedly exposed';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'moderation_reviewer_audit_log'
      AND c.relrowsecurity
      AND c.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'moderation_reviewer_audit_log must have forced RLS';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c
      ON c.oid = t.tgrelid
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'moderation_reviewers'
      AND t.tgname = 'trg_log_moderation_reviewer_change'
      AND NOT t.tgisinternal
      AND (t.tgtype & 1) = 1
      AND (t.tgtype & 2) = 0
      AND (t.tgtype & 4) = 4
      AND (t.tgtype & 8) = 8
      AND (t.tgtype & 16) = 16
  ) THEN
    RAISE EXCEPTION 'moderation reviewer audit trigger is missing insert/update/delete row-level coverage';
  END IF;

  IF has_function_privilege(
      'anon',
      'public.upsert_moderation_reviewer(uuid, text, text, boolean, uuid, text)',
      'EXECUTE'
    )
    OR has_function_privilege(
      'authenticated',
      'public.upsert_moderation_reviewer(uuid, text, text, boolean, uuid, text)',
      'EXECUTE'
    )
    OR has_function_privilege(
      'anon',
      'public.deactivate_moderation_reviewer(uuid, uuid, text)',
      'EXECUTE'
    )
    OR has_function_privilege(
      'authenticated',
      'public.deactivate_moderation_reviewer(uuid, uuid, text)',
      'EXECUTE'
    )
  THEN
    RAISE EXCEPTION 'moderation reviewer management RPC unexpectedly exposed to app clients';
  END IF;

  IF pg_get_functiondef(
      to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)')
    ) NOT ILIKE '%Reviewer is not authorized%'
    OR pg_get_functiondef(
      to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)')
    ) NOT ILIKE '%Report already has final review decision%'
  THEN
    RAISE EXCEPTION 'review_user_report reviewer registry or final-decision guard is missing';
  END IF;

  IF to_regprocedure('public.review_profile_verification(uuid, text, text, uuid, text[])') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.review_profile_verification(uuid, text, text, uuid, text[])';
  END IF;

  IF to_regprocedure('public.request_account_deletion(text, text)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.request_account_deletion(text, text)';
  END IF;

  IF to_regprocedure('public.get_privacy_settings()') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.get_privacy_settings()';
  END IF;

  IF to_regprocedure('public.save_privacy_settings(boolean, boolean, boolean, boolean)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.save_privacy_settings(boolean, boolean, boolean, boolean)';
  END IF;

  IF to_regprocedure('public.get_notification_preferences()') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.get_notification_preferences()';
  END IF;

  IF to_regprocedure('public.save_notification_preferences(boolean, boolean, boolean, boolean, boolean)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.save_notification_preferences(boolean, boolean, boolean, boolean, boolean)';
  END IF;

  IF to_regprocedure('public.undo_last_swipe()') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.undo_last_swipe()';
  END IF;

  IF to_regprocedure('public.mark_messages_read(uuid[])') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.mark_messages_read(uuid[])';
  END IF;

  IF to_regprocedure('public.mark_conversation_read(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.mark_conversation_read(uuid)';
  END IF;

  IF to_regprocedure('public.mark_pair_messages_read(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.mark_pair_messages_read(uuid)';
  END IF;

  IF to_regprocedure('public.current_user_allows_read_receipts()') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.current_user_allows_read_receipts()';
  END IF;

  IF to_regprocedure('public.update_message_status(uuid, text)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.update_message_status(uuid, text)';
  END IF;

  IF to_regprocedure('public.delete_message_for_me(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.delete_message_for_me(uuid)';
  END IF;

  IF to_regprocedure('public.delete_message_for_everyone(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.delete_message_for_everyone(uuid)';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n
      ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND NOT EXISTS (
        SELECT 1
        FROM unnest(COALESCE(p.proconfig, ARRAY[]::text[])) setting(value)
        WHERE setting.value IN ('search_path=', 'search_path=""')
      )
  ) THEN
    RAISE EXCEPTION 'SECURITY DEFINER functions must use an empty fixed search_path';
  END IF;

  IF has_function_privilege('anon', 'public.block_user(uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.unmatch_user(uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.get_or_create_conversation(uuid, uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.send_message(uuid, text, text, text, uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.like_profile(uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.submit_verification(text, text, text, text, integer, text[])', 'EXECUTE')
    OR has_function_privilege('anon', 'public.claim_ocr_attempt(integer, integer)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.save_basic_info(text, text, integer, text)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.clear_verification_submission()', 'EXECUTE')
    OR has_function_privilege('anon', 'public.submit_user_report(uuid, text, text, uuid, text)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.review_user_report(uuid, text, text, text, text, uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.review_profile_verification(uuid, text, text, uuid, text[])', 'EXECUTE')
    OR has_function_privilege('anon', 'public.request_account_deletion(text, text)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.get_privacy_settings()', 'EXECUTE')
    OR has_function_privilege('anon', 'public.save_privacy_settings(boolean, boolean, boolean, boolean)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.get_notification_preferences()', 'EXECUTE')
    OR has_function_privilege('anon', 'public.save_notification_preferences(boolean, boolean, boolean, boolean, boolean)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.undo_last_swipe()', 'EXECUTE')
    OR has_function_privilege('anon', 'public.current_user_allows_read_receipts()', 'EXECUTE')
    OR has_function_privilege('anon', 'public.mark_messages_read(uuid[])', 'EXECUTE')
    OR has_function_privilege('anon', 'public.mark_conversation_read(uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.mark_pair_messages_read(uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.update_message_status(uuid, text)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.delete_message_for_me(uuid)', 'EXECUTE')
    OR has_function_privilege('anon', 'public.delete_message_for_everyone(uuid)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.review_user_report(uuid, text, text, text, text, uuid)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.review_profile_verification(uuid, text, text, uuid, text[])', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.update_conversation_on_message()', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'Unsafe function execute privilege is still exposed';
  END IF;

  IF has_table_privilege('authenticated', 'public.profiles', 'DELETE')
    OR has_table_privilege('authenticated', 'public.messages', 'DELETE')
    OR has_table_privilege('authenticated', 'public.messages', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.messages', 'INSERT')
    OR has_table_privilege('authenticated', 'public.likes', 'DELETE')
    OR has_table_privilege('authenticated', 'public.user_reports', 'INSERT')
    OR has_table_privilege('authenticated', 'public.account_deletion_requests', 'INSERT')
    OR has_table_privilege('authenticated', 'public.account_deletion_requests', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.account_deletion_requests', 'DELETE')
    OR has_table_privilege('authenticated', 'public.user_privacy_settings', 'INSERT')
    OR has_table_privilege('authenticated', 'public.user_privacy_settings', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.user_privacy_settings', 'DELETE')
    OR has_table_privilege('authenticated', 'public.user_notification_preferences', 'INSERT')
    OR has_table_privilege('authenticated', 'public.user_notification_preferences', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.user_notification_preferences', 'DELETE')
    OR has_table_privilege('authenticated', 'public.conversations', 'INSERT')
    OR has_table_privilege('authenticated', 'public.conversations', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.conversations', 'DELETE')
    OR has_table_privilege('authenticated', 'public.ocr_usage_events', 'SELECT')
    OR has_table_privilege('authenticated', 'public.ocr_usage_events', 'INSERT')
    OR has_table_privilege('authenticated', 'public.ocr_usage_events', 'UPDATE')
    OR has_table_privilege('authenticated', 'public.ocr_usage_events', 'DELETE')
  THEN
    RAISE EXCEPTION 'authenticated still has unsafe direct table privileges';
  END IF;

  IF has_table_privilege('authenticated', 'public.likes', 'UPDATE') THEN
    RAISE EXCEPTION 'authenticated must not have direct UPDATE on public.likes';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.column_privileges
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND grantee = 'authenticated'
      AND privilege_type = 'UPDATE'
      AND column_name IN ('gender', 'user_type')
  ) THEN
    RAISE EXCEPTION 'authenticated must not update profile gender/user_type directly; use save_basic_info';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.column_privileges
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND grantee = 'authenticated'
      AND privilege_type = 'UPDATE'
      AND column_name IN (
        'preferences_completed',
        'location_type',
        'location_coordinates'
      )
    GROUP BY grantee
    HAVING COUNT(DISTINCT column_name) = 3
  ) THEN
    RAISE EXCEPTION 'authenticated lost intended UPDATE access to non-sensitive profile/location columns';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.column_privileges
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND grantee = 'authenticated'
      AND privilege_type IN ('INSERT', 'UPDATE')
      AND column_name IN (
        'is_verified',
        'verified_at',
        'verification_status',
        'verification_completed',
        'verification_selfie',
        'verification_document',
        'verification_extracted_first_name',
        'verification_extracted_last_name',
        'verification_extracted_age',
        'verification_mismatch_reasons'
      )
  ) THEN
    RAISE EXCEPTION 'authenticated can insert/update server-owned verification columns directly';
  END IF;

  IF (
    SELECT COUNT(DISTINCT policyname)
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname IN ('Users can upload chat images', 'Users can view chat images')
      AND COALESCE(with_check, qual, '') LIKE '%user_blocks%'
  ) < 2 THEN
    RAISE EXCEPTION 'chat image policies must deny blocked conversations';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'profile-photos'
      AND public = TRUE
  ) THEN
    RAISE EXCEPTION 'profile-photos bucket must exist as a public bucket for current profile photo URLs';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM storage.buckets
    WHERE id = 'verification-docs'
      AND public = FALSE
  ) THEN
    RAISE EXCEPTION 'verification-docs bucket must exist as a private bucket';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname IN (
        'Users can upload own profile photos',
        'Users can replace own profile photos',
        'Users can delete own profile photos'
      )
      AND COALESCE(with_check, qual, '') LIKE '%profile-photos%'
      AND COALESCE(with_check, qual, '') LIKE '%auth.uid%'
  ) < 3 THEN
    RAISE EXCEPTION 'profile photo storage policies must restrict writes to the authenticated user folder';
  END IF;

  IF (
    SELECT COUNT(DISTINCT policyname)
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname IN (
        'Users can upload own verification documents',
        'Users can read own verification documents',
        'Users can delete own verification documents'
      )
      AND COALESCE(with_check, qual, '') LIKE '%verification-docs%'
      AND COALESCE(with_check, qual, '') LIKE '%auth.uid%'
  ) < 3 THEN
    RAISE EXCEPTION 'verification document storage policies must keep evidence private to the authenticated user folder';
  END IF;
END;
$$;

CREATE TEMP TABLE _pinaymate_verification_object_paths (
  kind TEXT PRIMARY KEY,
  path TEXT NOT NULL
);

CREATE TEMP TABLE _pinaymate_smoke_users AS
SELECT
  CASE ROW_NUMBER() OVER (ORDER BY created_at NULLS LAST, id)
    WHEN 1 THEN 'actor'
    ELSE 'other'
  END AS label,
  id
FROM (
  SELECT id, created_at
  FROM public.profiles
  WHERE COALESCE(is_active, TRUE) = TRUE
  ORDER BY created_at NULLS LAST, id
  LIMIT 2
) picked_profiles;

DO $$
BEGIN
  IF (SELECT COUNT(*) FROM _pinaymate_smoke_users) < 2 THEN
    RAISE EXCEPTION 'Safety smoke test requires at least two active profiles in staging/local data';
  END IF;
END;
$$;

GRANT SELECT ON _pinaymate_smoke_users TO authenticated;

INSERT INTO _pinaymate_verification_object_paths (kind, path)
SELECT 'selfie', id::TEXT || '/smoke-selfie.jpg'
FROM _pinaymate_smoke_users
WHERE label = 'actor';

INSERT INTO _pinaymate_verification_object_paths (kind, path)
SELECT 'document', id::TEXT || '/smoke-document.jpg'
FROM _pinaymate_smoke_users
WHERE label = 'actor';

DO $$
DECLARE
  v_actor_id UUID;
  v_path TEXT;
  v_columns TEXT[];
  v_values TEXT[];
  v_owner_type TEXT;
  v_owner_id_type TEXT;
BEGIN
  SELECT id
  INTO v_actor_id
  FROM _pinaymate_smoke_users
  WHERE label = 'actor';

  SELECT udt_name
  INTO v_owner_type
  FROM information_schema.columns
  WHERE table_schema = 'storage'
    AND table_name = 'objects'
    AND column_name = 'owner';

  SELECT udt_name
  INTO v_owner_id_type
  FROM information_schema.columns
  WHERE table_schema = 'storage'
    AND table_name = 'objects'
    AND column_name = 'owner_id';

  FOR v_path IN
    SELECT path
    FROM _pinaymate_verification_object_paths
  LOOP
    v_columns := ARRAY['bucket_id', 'name', 'metadata'];
    v_values := ARRAY[
      quote_literal('verification-docs'),
      quote_literal(v_path),
      quote_literal('{"mimetype":"image/jpeg","size":1}') || '::jsonb'
    ];

    IF v_owner_type IS NOT NULL THEN
      v_columns := array_append(v_columns, 'owner');
      v_values := array_append(
        v_values,
        CASE
          WHEN v_owner_type = 'uuid' THEN quote_literal(v_actor_id::TEXT) || '::uuid'
          ELSE quote_literal(v_actor_id::TEXT)
        END
      );
    END IF;

    IF v_owner_id_type IS NOT NULL THEN
      v_columns := array_append(v_columns, 'owner_id');
      v_values := array_append(
        v_values,
        CASE
          WHEN v_owner_id_type = 'uuid' THEN quote_literal(v_actor_id::TEXT) || '::uuid'
          ELSE quote_literal(v_actor_id::TEXT)
        END
      );
    END IF;

    EXECUTE format(
      'INSERT INTO storage.objects (%s)
       SELECT %s
       WHERE NOT EXISTS (
         SELECT 1
         FROM storage.objects
         WHERE bucket_id = %L
           AND name = %L
       )',
      array_to_string(v_columns, ', '),
      array_to_string(v_values, ', '),
      'verification-docs',
      v_path
    );
  END LOOP;
END;
$$;

-- Guarantee the first chat attempt is genuinely unmatched.
DELETE FROM public.likes l
USING _pinaymate_smoke_users actor,
      _pinaymate_smoke_users other_user
WHERE actor.label = 'actor'
  AND other_user.label = 'other'
  AND (
    (l.from_user_id = actor.id AND l.to_user_id = other_user.id)
    OR (l.from_user_id = other_user.id AND l.to_user_id = actor.id)
  );

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'actor'),
  TRUE
);

DO $$
DECLARE
  v_unmatched_send_succeeded BOOLEAN := FALSE;
BEGIN
  BEGIN
    PERFORM public.send_message(
      (SELECT id FROM _pinaymate_smoke_users WHERE label = 'other'),
      'Unmatched smoke test message',
      'text',
      NULL,
      NULL
    );

    v_unmatched_send_succeeded := TRUE;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE 'Expected unmatched conversation rejection: %', SQLERRM;
  END;

  IF v_unmatched_send_succeeded THEN
    RAISE EXCEPTION 'Unmatched conversation unexpectedly succeeded';
  END IF;
END;
$$;

RESET ROLE;

-- Privacy settings must be RPC-backed and profile visibility must affect discovery.
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'other'),
  TRUE
);

SELECT public.save_privacy_settings(FALSE, TRUE, FALSE, TRUE);

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'actor'),
  TRUE
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.discoverable_profiles p
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
     AND other_user.id = p.id
    WHERE COALESCE(p.is_active, TRUE) = FALSE
      AND p.last_active_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Online status privacy setting did not mask discoverable_profiles activity fields';
  END IF;
END;
$$;

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'other'),
  TRUE
);

SELECT public.save_privacy_settings(FALSE, TRUE, FALSE, FALSE);

RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'actor'),
  TRUE
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.discoverable_profiles p
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
     AND other_user.id = p.id
  ) THEN
    RAISE EXCEPTION 'Profile visibility privacy setting did not hide member from discoverable_profiles';
  END IF;
END;
$$;

-- App clients must not be able to call the private conversation helper directly.
DO $$
DECLARE
  v_conversation_id UUID;
BEGIN
  BEGIN
    SELECT public.get_or_create_conversation(actor.id, other_user.id)
    INTO v_conversation_id
    FROM _pinaymate_smoke_users actor
    CROSS JOIN _pinaymate_smoke_users other_user
    WHERE actor.label = 'actor'
      AND other_user.label = 'other';

    RAISE EXCEPTION 'Private conversation helper direct execution unexpectedly succeeded: %', v_conversation_id;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected private conversation helper rejection: %', SQLERRM;
  END;
END;
$$;

-- Account deletion request submission must go through the hardened RPC.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.account_deletion_requests (
      user_id,
      reason,
      source
    )
    SELECT
      actor.id,
      'Direct insert should fail',
      'smoke_test'
    FROM _pinaymate_smoke_users actor
    WHERE actor.label = 'actor';

    RAISE EXCEPTION 'Direct account deletion request insert unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected direct account deletion request insert rejection: %', SQLERRM;
  END;
END;
$$;

SELECT public.request_account_deletion(
  'Smoke test account deletion request',
  'app'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.account_deletion_requests d
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
     AND actor.id = d.user_id
    WHERE d.status IN ('pending', 'reviewing')
  ) THEN
    RAISE EXCEPTION 'request_account_deletion did not create or update a pending request';
  END IF;
END;
$$;

-- Notification preferences must be RPC-backed and direct writes denied.
DO $$
BEGIN
  BEGIN
    INSERT INTO public.user_notification_preferences (
      user_id,
      push_enabled,
      new_matches,
      new_messages,
      new_likes,
      email_updates
    )
    SELECT
      actor.id,
      TRUE,
      TRUE,
      TRUE,
      TRUE,
      TRUE
    FROM _pinaymate_smoke_users actor
    WHERE actor.label = 'actor';

    RAISE EXCEPTION 'Direct notification preference insert unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected direct notification preference insert rejection: %', SQLERRM;
  END;
END;
$$;

SELECT public.save_notification_preferences(TRUE, TRUE, TRUE, FALSE, TRUE);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.get_notification_preferences() prefs
    WHERE prefs.push_enabled = TRUE
      AND prefs.new_matches = TRUE
      AND prefs.new_messages = TRUE
      AND prefs.new_likes = FALSE
      AND prefs.email_updates = TRUE
  ) THEN
    RAISE EXCEPTION 'save_notification_preferences did not persist expected launch preferences';
  END IF;
END;
$$;

SELECT public.save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.get_notification_preferences() prefs
    WHERE prefs.push_enabled = FALSE
      AND prefs.new_matches = FALSE
      AND prefs.new_messages = FALSE
      AND prefs.new_likes = FALSE
      AND prefs.email_updates = TRUE
  ) THEN
    RAISE EXCEPTION 'save_notification_preferences did not clear push-dependent flags when push was disabled';
  END IF;
END;
$$;

RESET ROLE;

-- Prepare a temporary mutual match as the privileged migration/test role.
INSERT INTO public.likes (from_user_id, to_user_id, is_match, matched_at)
SELECT actor.id, other_user.id, TRUE, NOW()
FROM _pinaymate_smoke_users actor
CROSS JOIN _pinaymate_smoke_users other_user
WHERE actor.label = 'actor'
  AND other_user.label = 'other'
ON CONFLICT (from_user_id, to_user_id)
DO UPDATE SET is_match = TRUE, matched_at = EXCLUDED.matched_at;

INSERT INTO public.likes (from_user_id, to_user_id, is_match, matched_at)
SELECT other_user.id, actor.id, TRUE, NOW()
FROM _pinaymate_smoke_users actor
CROSS JOIN _pinaymate_smoke_users other_user
WHERE actor.label = 'actor'
  AND other_user.label = 'other'
ON CONFLICT (from_user_id, to_user_id)
DO UPDATE SET is_match = TRUE, matched_at = EXCLUDED.matched_at;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'actor'),
  TRUE
);

-- Report submission must go through the hardened RPC and preserve allowed sources.
SELECT public.submit_user_report(
  (SELECT id FROM _pinaymate_smoke_users WHERE label = 'other'),
  'Smoke test report',
  'Rollback-only safety validation',
  NULL,
  'chat'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_reports r
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
     AND actor.id = r.reporter_id
    WHERE r.source = 'chat'
      AND r.reason = 'Smoke test report'
  ) THEN
    RAISE EXCEPTION 'Authenticated reporter could not read own report';
  END IF;
END;
$$;

-- Unknown report sources should normalize to app instead of storing arbitrary
-- source values from clients.
SELECT public.submit_user_report(
  (SELECT id FROM _pinaymate_smoke_users WHERE label = 'other'),
  'Smoke invalid source report',
  'Rollback-only report source normalization validation',
  NULL,
  'smoke_test_invalid'
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_reports r
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
     AND actor.id = r.reporter_id
    WHERE r.source = 'app'
      AND r.reason = 'Smoke invalid source report'
  ) THEN
    RAISE EXCEPTION 'Invalid report source was not normalized to app';
  END IF;
END;
$$;

SELECT public.submit_user_report(
  (SELECT id FROM _pinaymate_smoke_users WHERE label = 'other'),
  'Smoke invalid source report',
  'Duplicate report should merge into the existing open queue row.',
  NULL,
  'app'
);

DO $$
BEGIN
  IF (
    SELECT COUNT(*)
    FROM public.user_reports r
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
     AND actor.id = r.reporter_id
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
     AND other_user.id = r.reported_user_id
    WHERE r.source = 'app'
      AND r.reason = 'Smoke invalid source report'
      AND r.status IN ('open', 'reviewing')
  ) <> 1 THEN
    RAISE EXCEPTION 'Duplicate same-pair report was not merged into one open queue row';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_reports r
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
     AND actor.id = r.reporter_id
    WHERE r.source = 'app'
      AND r.reason = 'Smoke invalid source report'
      AND r.details = 'Duplicate report should merge into the existing open queue row.'
  ) THEN
    RAISE EXCEPTION 'Duplicate same-pair report did not refresh the existing report details';
  END IF;
END;
$$;

-- Forging a report for a different reporter should fail RLS.
DO $$
DECLARE
  v_report_id UUID;
  v_reviewed_report RECORD;
BEGIN
  SELECT r.id
  INTO v_report_id
  FROM public.user_reports r
  JOIN _pinaymate_smoke_users actor
    ON actor.label = 'actor'
   AND actor.id = r.reporter_id
  WHERE r.source = 'app'
    AND r.reason = 'Smoke invalid source report'
  LIMIT 1;

  BEGIN
    PERFORM public.review_user_report(
      v_report_id,
      'resolved',
      'medium',
      'dismissed',
      'This authenticated call should be rejected.',
      NULL
    );

    RAISE EXCEPTION 'Authenticated user unexpectedly reviewed a user report';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected report review privilege rejection: %', SQLERRM;
  END;
END;
$$;

RESET ROLE;

DO $$
DECLARE
  v_report_id UUID;
  v_reviewed_report RECORD;
BEGIN
  SELECT r.id
  INTO v_report_id
  FROM public.user_reports r
  JOIN _pinaymate_smoke_users actor
    ON actor.label = 'actor'
   AND actor.id = r.reporter_id
  WHERE r.source = 'app'
    AND r.reason = 'Smoke invalid source report'
  LIMIT 1;

  PERFORM public.upsert_moderation_reviewer(
    '11111111-1111-4111-8111-111111111111'::UUID,
    'Smoke safety reviewer',
    'safety',
    TRUE,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
    'Smoke seed active reviewer'
  );

  PERFORM public.upsert_moderation_reviewer(
    '33333333-3333-4333-8333-333333333333'::UUID,
    'Inactive smoke reviewer',
    'safety',
    FALSE,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
    'Smoke seed inactive reviewer'
  );

  IF NOT EXISTS (
    SELECT 1
    FROM public.moderation_reviewer_audit_log
    WHERE reviewer_id = '11111111-1111-4111-8111-111111111111'::UUID
      AND action IN ('insert', 'update')
      AND changed_by_subject = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID
      AND change_reason = 'Smoke seed active reviewer'
  ) THEN
    RAISE EXCEPTION 'moderation reviewer registry change was not audited';
  END IF;

  BEGIN
    PERFORM public.review_user_report(
      v_report_id,
      'resolved',
      'medium',
      'dismissed',
      'This missing reviewer id call should be rejected.',
      NULL
    );

    RAISE EXCEPTION 'review_user_report did not reject a missing reviewer identity';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      RAISE NOTICE 'Expected missing report reviewer rejection: %', SQLERRM;
  END;

  BEGIN
    PERFORM public.review_user_report(
      v_report_id,
      'resolved',
      'medium',
      'dismissed',
      'This unregistered reviewer id call should be rejected.',
      '22222222-2222-4222-8222-222222222222'::UUID
    );

    RAISE EXCEPTION 'review_user_report did not reject an unauthorized reviewer identity';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      RAISE NOTICE 'Expected unauthorized report reviewer rejection: %', SQLERRM;
  END;

  BEGIN
    PERFORM public.review_user_report(
      v_report_id,
      'resolved',
      'medium',
      'dismissed',
      'This inactive reviewer id call should be rejected.',
      '33333333-3333-4333-8333-333333333333'::UUID
    );

    RAISE EXCEPTION 'review_user_report did not reject an inactive reviewer identity';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      RAISE NOTICE 'Expected inactive report reviewer rejection: %', SQLERRM;
  END;

  PERFORM public.deactivate_moderation_reviewer(
    '33333333-3333-4333-8333-333333333333'::UUID,
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID,
    'Smoke deactivate inactive reviewer'
  );

  IF NOT EXISTS (
    SELECT 1
    FROM public.moderation_reviewer_audit_log
    WHERE reviewer_id = '33333333-3333-4333-8333-333333333333'::UUID
      AND action = 'update'
      AND changed_by_subject = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::UUID
      AND change_reason = 'Smoke deactivate inactive reviewer'
  ) THEN
    RAISE EXCEPTION 'moderation reviewer registry deactivation was not audited';
  END IF;

  SELECT *
  INTO v_reviewed_report
  FROM public.review_user_report(
    v_report_id,
    'resolved',
    'medium',
    'dismissed',
    'Smoke reviewed report; transaction rolls back.',
    '11111111-1111-4111-8111-111111111111'::UUID
  );

  IF v_reviewed_report.status <> 'resolved'
    OR v_reviewed_report.severity <> 'medium'
    OR v_reviewed_report.action_taken <> 'dismissed'
    OR v_reviewed_report.reviewed_at IS NULL
  THEN
    RAISE EXCEPTION 'review_user_report did not persist expected review metadata';
  END IF;

  BEGIN
    PERFORM public.review_user_report(
      v_report_id,
      'dismissed',
      'low',
      'dismissed',
      'This finalized report overwrite should be rejected.',
      '11111111-1111-4111-8111-111111111111'::UUID
    );

    RAISE EXCEPTION 'review_user_report did not reject a finalized report overwrite';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      RAISE NOTICE 'Expected finalized report overwrite rejection: %', SQLERRM;
  END;
END;
$$;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'actor'),
  TRUE
);

DO $$
BEGIN
  BEGIN
    INSERT INTO public.user_reports (
      reporter_id,
      reported_user_id,
      reason,
      details,
      source
    )
    SELECT
      other_user.id,
      actor.id,
      'Forged smoke test report',
      'This insert should be rejected by RLS',
      'smoke_test_forged'
    FROM _pinaymate_smoke_users actor
    CROSS JOIN _pinaymate_smoke_users other_user
    WHERE actor.label = 'actor'
      AND other_user.label = 'other';

    RAISE EXCEPTION 'RLS allowed a forged report insert';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected forged report rejection: %', SQLERRM;
  END;
END;
$$;

-- Verification submissions should work through the RPC, while direct column
-- updates remain denied to browser/mobile clients.
SELECT public.submit_verification(
  (SELECT path FROM _pinaymate_verification_object_paths WHERE kind = 'selfie'),
  (SELECT path FROM _pinaymate_verification_object_paths WHERE kind = 'document'),
  'Smoke',
  'Tester',
  30,
  ARRAY[]::TEXT[]
);

DO $$
BEGIN
  BEGIN
    PERFORM public.submit_verification(
      'forged-user-id/smoke-selfie.jpg',
      (SELECT path FROM _pinaymate_verification_object_paths WHERE kind = 'document'),
      'Smoke',
      'Tester',
      30,
      ARRAY[]::TEXT[]
    );

    RAISE EXCEPTION 'Forged verification storage path unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected forged verification path rejection: %', SQLERRM;
  END;

  BEGIN
    PERFORM public.submit_verification(
      (SELECT id::TEXT || '/missing-selfie.jpg' FROM _pinaymate_smoke_users WHERE label = 'actor'),
      (SELECT path FROM _pinaymate_verification_object_paths WHERE kind = 'document'),
      'Smoke',
      'Tester',
      30,
      ARRAY[]::TEXT[]
    );

    RAISE EXCEPTION 'Missing verification storage object unexpectedly succeeded';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      RAISE NOTICE 'Expected missing verification object rejection: %', SQLERRM;
  END;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
     AND actor.id = p.id
    WHERE p.verification_completed = TRUE
      AND COALESCE(p.is_verified, FALSE) = FALSE
      AND p.verification_status = 'pending'
  ) THEN
    RAISE EXCEPTION 'submit_verification did not set the expected pending review state';
  END IF;

  BEGIN
    PERFORM public.review_profile_verification(
      (SELECT id FROM _pinaymate_smoke_users WHERE label = 'actor'),
      'approved',
      'Authenticated caller should not be able to approve verification.',
      '11111111-1111-4111-8111-111111111111'::UUID,
      ARRAY[]::TEXT[]
    );

    RAISE EXCEPTION 'Authenticated user unexpectedly reviewed profile verification';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected authenticated profile verification review rejection: %', SQLERRM;
  END;

  BEGIN
    UPDATE public.profiles p
    SET verification_completed = FALSE
    FROM _pinaymate_smoke_users actor
    WHERE actor.label = 'actor'
      AND actor.id = p.id;

    RAISE EXCEPTION 'Direct verification column update unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected direct verification update rejection: %', SQLERRM;
  END;
END;
$$;

RESET ROLE;

DO $$
DECLARE
  v_review RECORD;
BEGIN
  BEGIN
    PERFORM public.review_profile_verification(
      (SELECT id FROM _pinaymate_smoke_users WHERE label = 'other'),
      'approved',
      'Smoke reviewer should not approve missing evidence.',
      '11111111-1111-4111-8111-111111111111'::UUID,
      ARRAY[]::TEXT[]
    );

    RAISE EXCEPTION 'review_profile_verification unexpectedly approved a profile without submitted evidence';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      RAISE NOTICE 'Expected profile verification missing-evidence rejection: %', SQLERRM;
  END;

  SELECT *
  INTO v_review
  FROM public.review_profile_verification(
    (SELECT id FROM _pinaymate_smoke_users WHERE label = 'actor'),
    'approved',
    'Smoke reviewer approved pending evidence; transaction rolls back.',
    '11111111-1111-4111-8111-111111111111'::UUID,
    ARRAY[]::TEXT[]
  );

  IF v_review.verification_status <> 'approved'
    OR COALESCE(v_review.is_verified, FALSE) <> TRUE
    OR v_review.verified_at IS NULL
    OR v_review.verification_reviewed_at IS NULL
  THEN
    RAISE EXCEPTION 'review_profile_verification did not approve pending evidence';
  END IF;
END;
$$;

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'actor'),
  TRUE
);

-- Direct client attempts to forge match state should fail; match creation
-- must go through public.like_profile().
DO $$
BEGIN
  BEGIN
    UPDATE public.likes l
    SET is_match = TRUE,
        matched_at = NOW()
    FROM _pinaymate_smoke_users actor,
         _pinaymate_smoke_users other_user
    WHERE actor.label = 'actor'
      AND other_user.label = 'other'
      AND l.from_user_id = actor.id
      AND l.to_user_id = other_user.id;

    RAISE EXCEPTION 'Direct likes.is_match update unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected direct match-forging rejection: %', SQLERRM;
  END;
END;
$$;

-- unmatch_user should clear mutual match state without needing direct table update privileges.
SELECT public.unmatch_user(
  (SELECT id FROM _pinaymate_smoke_users WHERE label = 'other')
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.likes l
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
    WHERE l.is_match = TRUE
      AND (
        (l.from_user_id = actor.id AND l.to_user_id = other_user.id)
        OR (l.from_user_id = other_user.id AND l.to_user_id = actor.id)
      )
  ) THEN
    RAISE EXCEPTION 'unmatch_user did not clear mutual match state';
  END IF;
END;
$$;

RESET ROLE;

-- Recreate the temporary mutual match before testing block_user.
UPDATE public.likes l
SET is_match = TRUE,
    matched_at = NOW()
FROM _pinaymate_smoke_users actor,
     _pinaymate_smoke_users other_user
WHERE actor.label = 'actor'
  AND other_user.label = 'other'
  AND (
    (l.from_user_id = actor.id AND l.to_user_id = other_user.id)
    OR (l.from_user_id = other_user.id AND l.to_user_id = actor.id)
  );

SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'actor'),
  TRUE
);

-- Open a conversation through the app-owned path. Direct client execution of
-- get_or_create_conversation is revoked; send_message owns conversation
-- creation and should leave a real last_message_id for inbox visibility.
SELECT public.send_message(
  other_user.id,
  'Conversation creation smoke test message',
  'text',
  NULL,
  NULL
)
FROM _pinaymate_smoke_users other_user
WHERE other_user.label = 'other';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.get_user_conversations(
      (SELECT id FROM _pinaymate_smoke_users WHERE label = 'actor')
    ) c
    WHERE c.other_user_is_active = FALSE
      AND c.other_user_last_active_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Online status privacy setting did not mask get_user_conversations activity fields';
  END IF;
END;
$$;

SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'other'),
  TRUE
);

SELECT public.send_message(
  (SELECT id FROM _pinaymate_smoke_users WHERE label = 'actor'),
  'Matched smoke test message',
  'text',
  NULL,
  c.id
)
FROM public.conversations c
JOIN _pinaymate_smoke_users actor
  ON actor.label = 'actor'
JOIN _pinaymate_smoke_users other_user
  ON other_user.label = 'other'
WHERE (
  c.participant_1_id = actor.id
  AND c.participant_2_id = other_user.id
)
OR (
  c.participant_1_id = other_user.id
  AND c.participant_2_id = actor.id
)
LIMIT 1;

SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM _pinaymate_smoke_users WHERE label = 'actor'),
  TRUE
);

-- Image messages must use existing chat-images storage objects under the
-- conversation folder, not external URLs or forged paths.
DO $$
BEGIN
  BEGIN
    PERFORM public.send_message(
      other_user.id,
      '',
      'image',
      'https://evil.example/forged-chat-image.jpg',
      c.id
    )
    FROM public.conversations c
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
    WHERE (
      c.participant_1_id = actor.id
      AND c.participant_2_id = other_user.id
    )
    OR (
      c.participant_1_id = other_user.id
      AND c.participant_2_id = actor.id
    );

    RAISE EXCEPTION 'Forged chat image URL unexpectedly succeeded';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      RAISE NOTICE 'Expected forged chat image URL rejection: %', SQLERRM;
  END;

  BEGIN
    PERFORM public.send_message(
      other_user.id,
      '',
      'image',
      c.id::text || '/missing-smoke-image.jpg',
      c.id
    )
    FROM public.conversations c
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
    WHERE (
      c.participant_1_id = actor.id
      AND c.participant_2_id = other_user.id
    )
    OR (
      c.participant_1_id = other_user.id
      AND c.participant_2_id = actor.id
    );

    RAISE EXCEPTION 'Missing chat image object unexpectedly succeeded';
  EXCEPTION
    WHEN invalid_parameter_value THEN
      RAISE NOTICE 'Expected missing chat image object rejection: %', SQLERRM;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    UPDATE public.messages m
    SET status = 'read'
    FROM _pinaymate_smoke_users actor
    WHERE actor.label = 'actor'
      AND m.recipient_id = actor.id
      AND m.content = 'Matched smoke test message';

    RAISE EXCEPTION 'Direct message status update unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected direct message update rejection: %', SQLERRM;
  END;
END;
$$;

SELECT public.mark_conversation_read(c.id)
FROM public.conversations c
JOIN _pinaymate_smoke_users actor
  ON actor.label = 'actor'
JOIN _pinaymate_smoke_users other_user
  ON other_user.label = 'other'
WHERE (
  c.participant_1_id = actor.id
  AND c.participant_2_id = other_user.id
)
OR (
  c.participant_1_id = other_user.id
  AND c.participant_2_id = actor.id
)
LIMIT 1;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.messages m
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
     AND actor.id = m.recipient_id
    WHERE m.content = 'Matched smoke test message'
      AND (
        COALESCE(m.status, 'sent') = 'read'
        OR m.read_at IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION 'Read receipt privacy off should not expose message read status';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.conversations c
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
    WHERE (
      c.participant_1_id = actor.id
      AND c.participant_2_id = other_user.id
      AND COALESCE(c.participant_1_unread_count, 0) <> 0
    )
    OR (
      c.participant_1_id = other_user.id
      AND c.participant_2_id = actor.id
      AND COALESCE(c.participant_2_unread_count, 0) <> 0
    )
  ) THEN
    RAISE EXCEPTION 'Conversation unread count was not cleared when read receipts were hidden';
  END IF;
END;
$$;

-- block_user should persist the block and also unmatch.
SELECT public.block_user(
  (SELECT id FROM _pinaymate_smoke_users WHERE label = 'other')
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.user_blocks b
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
     AND actor.id = b.blocker_id
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
     AND other_user.id = b.blocked_user_id
  ) THEN
    RAISE EXCEPTION 'block_user did not persist user_blocks row';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.likes l
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
    WHERE l.is_match = TRUE
      AND (
        (l.from_user_id = actor.id AND l.to_user_id = other_user.id)
        OR (l.from_user_id = other_user.id AND l.to_user_id = actor.id)
      )
  ) THEN
    RAISE EXCEPTION 'block_user did not clear mutual match state';
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.get_user_conversations(
      (SELECT id FROM _pinaymate_smoke_users WHERE label = 'actor')
    )
  ) THEN
    RAISE EXCEPTION 'Blocked conversation is still visible in get_user_conversations';
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.discoverable_profiles p
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
     AND other_user.id = p.id
  ) THEN
    RAISE EXCEPTION 'Blocked member is still visible in discoverable_profiles';
  END IF;
END;
$$;

-- App clients must still be unable to call the private helper after a block.
DO $$
DECLARE
  v_conversation_id UUID;
BEGIN
  BEGIN
    SELECT public.get_or_create_conversation(actor.id, other_user.id)
    INTO v_conversation_id
    FROM _pinaymate_smoke_users actor
    CROSS JOIN _pinaymate_smoke_users other_user
    WHERE actor.label = 'actor'
      AND other_user.label = 'other';

    RAISE EXCEPTION 'Private conversation helper direct execution unexpectedly succeeded after block: %', v_conversation_id;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected private conversation helper rejection after block: %', SQLERRM;
  END;
END;
$$;

-- Existing conversations should not allow new messages once either pair is blocked.
DO $$
BEGIN
  BEGIN
    PERFORM public.send_message(
      other_user.id,
      'Blocked smoke test message',
      'text',
      NULL,
      c.id
    )
    FROM public.conversations c
    JOIN _pinaymate_smoke_users actor
      ON actor.label = 'actor'
    JOIN _pinaymate_smoke_users other_user
      ON other_user.label = 'other'
    WHERE (
      c.participant_1_id = actor.id
      AND c.participant_2_id = other_user.id
    )
    OR (
      c.participant_1_id = other_user.id
      AND c.participant_2_id = actor.id
    );

    RAISE EXCEPTION 'Blocked message RPC unexpectedly succeeded';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Expected blocked message RPC rejection: %', SQLERRM;
  END;
END;
$$;

RESET ROLE;

-- Source/runtime guard: verification approval must reject reviewer IDs that are
-- not active in moderation_reviewers before touching a profile row.
DO $$
BEGIN
  BEGIN
    PERFORM *
    FROM public.review_profile_verification(
      gen_random_uuid(),
      'approved',
      'unauthorized verification reviewer should be rejected',
      gen_random_uuid(),
      ARRAY[]::TEXT[]
    );

    RAISE EXCEPTION 'Expected unauthorized verification reviewer to be rejected';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM <> 'Reviewer is not authorized' THEN
        RAISE;
      END IF;
  END;
END;
$$;

-- Source/runtime guard: inactive verification reviewers must also be rejected,
-- not only reviewer IDs that are absent from the registry.
DO $$
DECLARE
  v_inactive_reviewer_id UUID := gen_random_uuid();
  v_operator_id UUID := gen_random_uuid();
BEGIN
  PERFORM *
  FROM public.upsert_moderation_reviewer(
    v_inactive_reviewer_id,
    'Inactive verification reviewer',
    'safety',
    FALSE,
    v_operator_id,
    'safety smoke inactive reviewer seed'
  );

  BEGIN
    PERFORM *
    FROM public.review_profile_verification(
      gen_random_uuid(),
      'approved',
      'inactive verification reviewer should be rejected',
      v_inactive_reviewer_id,
      ARRAY[]::TEXT[]
    );

    RAISE EXCEPTION 'Expected inactive verification reviewer to be rejected';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM <> 'Reviewer is not authorized' THEN
        RAISE;
      END IF;
  END;
END;
$$;

-- Source/runtime guard: pending verification storage evidence must have a
-- restrictive delete policy that calls the pending-review guard function.
DO $$
DECLARE
  v_policy_qual TEXT;
  v_function_definition TEXT;
BEGIN
  SELECT qual
  INTO v_policy_qual
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname = 'Pending verification docs cannot be deleted'
    AND permissive = 'RESTRICTIVE';

  IF v_policy_qual IS NULL
    OR v_policy_qual NOT LIKE '%can_delete_verification_document(name)%'
    OR v_policy_qual NOT LIKE '%verification-docs%'
  THEN
    RAISE EXCEPTION 'Pending verification evidence delete policy must call the document guard';
  END IF;

  SELECT pg_get_functiondef('public.can_delete_verification_document(text)'::regprocedure)
  INTO v_function_definition;

  IF v_function_definition NOT LIKE '%verification_completed%'
    OR v_function_definition NOT LIKE '%verification_status%'
    OR v_function_definition NOT LIKE '%pending%'
    OR v_function_definition NOT LIKE '%verification_selfie%'
    OR v_function_definition NOT LIKE '%verification_document%'
  THEN
    RAISE EXCEPTION 'can_delete_verification_document must protect pending verification evidence paths';
  END IF;
END;
$$;

-- Source/runtime guard: public waitlist traffic must go through the Edge
-- Function path; app clients must not execute the database RPC directly.
DO $$
DECLARE
  v_first_attempt RECORD;
  v_second_attempt RECORD;
BEGIN
  IF to_regprocedure('public.claim_waitlist_edge_attempt(text, text, text, text, integer)') IS NULL THEN
    RAISE EXCEPTION 'Missing function: public.claim_waitlist_edge_attempt(text, text, text, text, integer)';
  END IF;

  IF has_function_privilege('anon', 'public.submit_waitlist_signup(text, text, text)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.submit_waitlist_signup(text, text, text)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'submit_waitlist_signup direct execution unexpectedly exposed to app clients';
  END IF;

  IF has_function_privilege('anon', 'public.claim_waitlist_edge_attempt(text, text, text, text, integer)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.claim_waitlist_edge_attempt(text, text, text, text, integer)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'claim_waitlist_edge_attempt unexpectedly exposed to app clients';
  END IF;

  IF to_regclass('public.waitlist_edge_attempts') IS NULL THEN
    RAISE EXCEPTION 'Missing table: public.waitlist_edge_attempts';
  END IF;

  IF has_table_privilege('anon', 'public.waitlist_edge_attempts', 'SELECT')
    OR has_table_privilege('anon', 'public.waitlist_edge_attempts', 'INSERT')
    OR has_table_privilege('authenticated', 'public.waitlist_edge_attempts', 'SELECT')
    OR has_table_privilege('authenticated', 'public.waitlist_edge_attempts', 'INSERT')
    OR has_table_privilege('service_role', 'public.waitlist_edge_attempts', 'INSERT')
    OR has_table_privilege('service_role', 'public.waitlist_edge_attempts', 'UPDATE')
  THEN
    RAISE EXCEPTION 'waitlist_edge_attempts direct table access unexpectedly exposed';
  END IF;

  SELECT *
  INTO v_first_attempt
  FROM public.claim_waitlist_edge_attempt(
    repeat('a', 64),
    '203.0.113.0/24',
    'ios',
    'pm_web',
    1
  );

  IF NOT COALESCE(v_first_attempt.allowed, FALSE)
    OR COALESCE(v_first_attempt.attempt_count, 0) <> 1
  THEN
    RAISE EXCEPTION 'First waitlist edge attempt should be allowed';
  END IF;

  SELECT *
  INTO v_second_attempt
  FROM public.claim_waitlist_edge_attempt(
    repeat('a', 64),
    '203.0.113.0/24',
    'ios',
    'pm_web',
    1
  );

  IF COALESCE(v_second_attempt.allowed, TRUE)
    OR COALESCE(v_second_attempt.retry_after_seconds, 0) <= 0
  THEN
    RAISE EXCEPTION 'Second waitlist edge attempt should be rate limited';
  END IF;
END;
$$;

SELECT
  'PASS: production hardening report/block/unmatch/messaging/privacy discovery safety smoke test completed; transaction will roll back' AS result;

ROLLBACK;
