-- PinayMate release preflight audit.
--
-- Purpose:
-- - Read-only structural audit for launch-critical Supabase objects.
-- - Complements 04_safety_smoke_test.sql, which exercises behavior.
-- - Run in Supabase SQL Editor or psql with a privileged role after migrations.
--
-- Expected final line:
-- PASS: release preflight audit completed; transaction will roll back

BEGIN;

DO $$
DECLARE
  missing_items text[] := ARRAY[]::text[];
  bucket_is_public boolean;
  view_definition text;
  view_options text[];
BEGIN
  -- Storage buckets.
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'profile-photos'
  ) THEN
    missing_items := array_append(missing_items, 'storage bucket: profile-photos');
  END IF;

  SELECT public INTO bucket_is_public
  FROM storage.buckets
  WHERE id = 'verification-docs';

  IF bucket_is_public IS NULL THEN
    missing_items := array_append(missing_items, 'storage bucket: verification-docs');
  ELSIF bucket_is_public THEN
    missing_items := array_append(missing_items, 'verification-docs bucket must not be public');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (
        COALESCE(qual, '') ILIKE '%verification-docs%'
        OR COALESCE(with_check, '') ILIKE '%verification-docs%'
      )
  ) THEN
    missing_items := array_append(
      missing_items,
      'storage policy coverage for verification-docs'
    );
  END IF;

  -- Launch-critical RPCs.
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
  ) THEN
    missing_items := array_append(missing_items, 'trigger function: handle_new_user');
  ELSE
    IF has_function_privilege('anon', 'public.handle_new_user()', 'EXECUTE')
      OR has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE')
    THEN
      missing_items := array_append(
        missing_items,
        'handle_new_user must not be directly executable by app clients'
      );
    END IF;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgname = 'on_auth_user_created'
      AND NOT t.tgisinternal
  ) THEN
    missing_items := array_append(missing_items, 'auth trigger: on_auth_user_created');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'auth'
      AND c.relname = 'users'
      AND t.tgname = 'on_auth_user_verified'
      AND NOT t.tgisinternal
  ) THEN
    missing_items := array_append(missing_items, 'auth trigger: on_auth_user_verified');
  END IF;

  IF to_regprocedure('public.get_or_create_conversation(uuid, uuid)') IS NULL THEN
    missing_items := array_append(
      missing_items,
      'private helper: get_or_create_conversation'
    );
  ELSIF has_function_privilege(
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
    missing_items := array_append(
      missing_items,
      'get_or_create_conversation must not be directly executable by app clients or service role'
    );
  END IF;

  IF to_regprocedure('public.get_user_conversations(uuid)') IS NULL THEN
    missing_items := array_append(
      missing_items,
      'RPC: get_user_conversations'
    );
  ELSIF pg_get_functiondef(
      to_regprocedure('public.get_user_conversations(uuid)')
    ) NOT ILIKE '%c.last_message_id IS NOT NULL%'
  THEN
    missing_items := array_append(
      missing_items,
      'get_user_conversations must hide empty conversations'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'submit_user_report'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: submit_user_report');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'user_reports'
      AND indexname = 'idx_user_reports_open_report_dedupe'
  ) THEN
    missing_items := array_append(
      missing_items,
      'index: idx_user_reports_open_report_dedupe'
    );
  END IF;

  IF to_regprocedure('public.submit_user_report(uuid, text, text, uuid, text)') IS NOT NULL
    AND (
      pg_get_functiondef(
        to_regprocedure('public.submit_user_report(uuid, text, text, uuid, text)')
      ) NOT ILIKE '%pg_advisory_xact_lock%'
      OR pg_get_functiondef(
        to_regprocedure('public.submit_user_report(uuid, text, text, uuid, text)')
      ) NOT ILIKE '%INTERVAL ''10 minutes''%'
    )
  THEN
    missing_items := array_append(
      missing_items,
      'submit_user_report duplicate/cooldown abuse controls'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'review_user_report'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: review_user_report');
  ELSIF has_function_privilege(
      'anon',
      'public.review_user_report(uuid, text, text, text, text, uuid)',
      'EXECUTE'
    )
    OR has_function_privilege(
      'authenticated',
      'public.review_user_report(uuid, text, text, text, text, uuid)',
      'EXECUTE'
    )
  THEN
    missing_items := array_append(
      missing_items,
      'review_user_report must not be executable by app clients'
    );
  END IF;

  IF to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)') IS NOT NULL
    AND pg_get_functiondef(
      to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)')
    ) NOT ILIKE '%Reviewer ID is required%'
  THEN
    missing_items := array_append(
      missing_items,
      'review_user_report must require reviewer identity'
    );
  END IF;

  IF to_regclass('public.moderation_reviewers') IS NULL THEN
    missing_items := array_append(missing_items, 'table: moderation_reviewers');
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'moderation_reviewers'
      AND c.relrowsecurity
      AND c.relforcerowsecurity
  ) THEN
    missing_items := array_append(
      missing_items,
      'moderation_reviewers must have forced RLS'
    );
  ELSIF has_table_privilege('anon', 'public.moderation_reviewers', 'SELECT')
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
    missing_items := array_append(
      missing_items,
      'moderation_reviewers direct access must stay denied'
    );
  END IF;

  IF to_regclass('public.moderation_reviewer_audit_log') IS NULL THEN
    missing_items := array_append(
      missing_items,
      'table: moderation_reviewer_audit_log'
    );
  ELSIF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n
      ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'moderation_reviewer_audit_log'
      AND c.relrowsecurity
      AND c.relforcerowsecurity
  ) THEN
    missing_items := array_append(
      missing_items,
      'moderation_reviewer_audit_log must have forced RLS'
    );
  ELSIF has_table_privilege('anon', 'public.moderation_reviewer_audit_log', 'SELECT')
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
    missing_items := array_append(
      missing_items,
      'moderation_reviewer_audit_log direct access must stay denied'
    );
  END IF;

  IF to_regprocedure('public.log_moderation_reviewer_change()') IS NULL THEN
    missing_items := array_append(
      missing_items,
      'function: log_moderation_reviewer_change'
    );
  END IF;

  IF to_regprocedure('public.upsert_moderation_reviewer(uuid, text, text, boolean, uuid, text)') IS NULL THEN
    missing_items := array_append(
      missing_items,
      'function: upsert_moderation_reviewer'
    );
  ELSIF has_function_privilege(
      'anon',
      'public.upsert_moderation_reviewer(uuid, text, text, boolean, uuid, text)',
      'EXECUTE'
    )
    OR has_function_privilege(
      'authenticated',
      'public.upsert_moderation_reviewer(uuid, text, text, boolean, uuid, text)',
      'EXECUTE'
    )
  THEN
    missing_items := array_append(
      missing_items,
      'upsert_moderation_reviewer must not be executable by app clients'
    );
  END IF;

  IF to_regprocedure('public.deactivate_moderation_reviewer(uuid, uuid, text)') IS NULL THEN
    missing_items := array_append(
      missing_items,
      'function: deactivate_moderation_reviewer'
    );
  ELSIF has_function_privilege(
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
    missing_items := array_append(
      missing_items,
      'deactivate_moderation_reviewer must not be executable by app clients'
    );
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
    missing_items := array_append(
      missing_items,
      'trigger: trg_log_moderation_reviewer_change insert/update/delete row coverage'
    );
  END IF;

  IF to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)') IS NOT NULL
    AND pg_get_functiondef(
      to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)')
    ) NOT ILIKE '%Reviewer is not authorized%'
  THEN
    missing_items := array_append(
      missing_items,
      'review_user_report must require authorized reviewer identity'
    );
  END IF;

  IF to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)') IS NOT NULL
    AND pg_get_functiondef(
      to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)')
    ) NOT ILIKE '%AND mr.active%'
  THEN
    missing_items := array_append(
      missing_items,
      'review_user_report must require active reviewer identity'
    );
  END IF;

  IF to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)') IS NOT NULL
    AND pg_get_functiondef(
      to_regprocedure('public.review_user_report(uuid, text, text, text, text, uuid)')
    ) NOT ILIKE '%Report already has final review decision%'
  THEN
    missing_items := array_append(
      missing_items,
      'review_user_report must reject finalized report overwrites'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'review_profile_verification'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: review_profile_verification');
  ELSIF has_function_privilege(
      'anon',
      'public.review_profile_verification(uuid, text, text, uuid, text[])',
      'EXECUTE'
    )
    OR has_function_privilege(
      'authenticated',
      'public.review_profile_verification(uuid, text, text, uuid, text[])',
      'EXECUTE'
    )
  THEN
    missing_items := array_append(
      missing_items,
      'review_profile_verification must not be executable by app clients'
    );
  END IF;

  IF (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name IN (
        'verification_reviewer_id',
        'verification_reviewer_note',
        'verification_reviewed_at'
      )
  ) <> 3 THEN
    missing_items := array_append(
      missing_items,
      'profiles verification review metadata columns'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'block_user'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: block_user');
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
    missing_items := array_append(
      missing_items,
      'discoverable_profiles must not expose sensitive or server-owned columns'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'unmatch_user'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: unmatch_user');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'claim_ocr_attempt'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: claim_ocr_attempt');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'save_basic_info'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: save_basic_info');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'submit_waitlist_signup'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: submit_waitlist_signup');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'waitlist_signups'
      AND indexname = 'idx_waitlist_signups_recent_source_platform'
  ) THEN
    missing_items := array_append(
      missing_items,
      'index: idx_waitlist_signups_recent_source_platform'
    );
  END IF;

  IF to_regprocedure('public.submit_waitlist_signup(text, text, text)') IS NOT NULL
    AND (
      pg_get_functiondef(
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
    )
  THEN
    missing_items := array_append(
      missing_items,
      'submit_waitlist_signup source/platform burst controls'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_privacy_settings'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: get_privacy_settings');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'send_message'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: send_message');
  ELSIF pg_get_functiondef(
      to_regprocedure('public.send_message(uuid, text, text, text, uuid)')
    ) NOT ILIKE '%get_or_create_conversation%'
  THEN
    missing_items := array_append(
      missing_items,
      'send_message must own the private conversation creation helper path'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'save_privacy_settings'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: save_privacy_settings');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'get_notification_preferences'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: get_notification_preferences');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'save_notification_preferences'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: save_notification_preferences');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'request_account_deletion'
  ) THEN
    missing_items := array_append(missing_items, 'RPC: request_account_deletion');
  END IF;

  -- RLS-owned tables.
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'profiles'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'RLS enabled table: profiles');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'messages'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'RLS enabled table: messages');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'matches'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'RLS enabled table: matches');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'user_reports'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'RLS enabled table: user_reports');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_reports'
      AND column_name IN ('severity', 'action_taken', 'reviewer_id', 'reviewer_note', 'reviewed_at')
    GROUP BY table_schema, table_name
    HAVING COUNT(DISTINCT column_name) = 5
  ) THEN
    missing_items := array_append(
      missing_items,
      'user_reports review metadata columns'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'user_blocks'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'RLS enabled table: user_blocks');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'user_privacy_settings'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'RLS enabled table: user_privacy_settings');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'user_notification_preferences'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'RLS enabled table: user_notification_preferences');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'waitlist_signups'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'RLS enabled table: waitlist_signups');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'waitlist_signups'
      AND c.relrowsecurity
      AND c.relforcerowsecurity
  ) THEN
    missing_items := array_append(missing_items, 'forced RLS table: waitlist_signups');
  END IF;

  IF to_regclass('public.waitlist_signups') IS NOT NULL
    AND (
      has_table_privilege('anon', 'public.waitlist_signups', 'INSERT')
      OR has_table_privilege('authenticated', 'public.waitlist_signups', 'INSERT')
      OR has_table_privilege('anon', 'public.waitlist_signups', 'UPDATE')
      OR has_table_privilege('authenticated', 'public.waitlist_signups', 'UPDATE')
      OR has_table_privilege('anon', 'public.waitlist_signups', 'SELECT')
      OR has_table_privilege('authenticated', 'public.waitlist_signups', 'SELECT')
      OR has_table_privilege('service_role', 'public.waitlist_signups', 'SELECT')
      OR has_table_privilege('service_role', 'public.waitlist_signups', 'INSERT')
      OR has_table_privilege('service_role', 'public.waitlist_signups', 'UPDATE')
      OR has_table_privilege('service_role', 'public.waitlist_signups', 'DELETE')
    )
  THEN
    missing_items := array_append(
      missing_items,
      'waitlist_signups direct access must stay denied'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t
      ON t.oid = c.conrelid
    JOIN pg_namespace n
      ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'user_notification_preferences'
      AND c.conname = 'user_notification_preferences_push_children_check'
  ) THEN
    missing_items := array_append(
      missing_items,
      'constraint: user_notification_preferences_push_children_check'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'account_deletion_requests'
      AND c.relrowsecurity
  ) THEN
    missing_items := array_append(
      missing_items,
      'RLS enabled table: account_deletion_requests'
    );
  END IF;

  -- Discovery visibility view should exist and include profile visibility filtering.
  IF to_regclass('public.discoverable_profiles') IS NULL THEN
    missing_items := array_append(missing_items, 'view: discoverable_profiles');
  ELSE
    SELECT pg_get_viewdef('public.discoverable_profiles'::regclass, true)
    INTO view_definition;

    SELECT COALESCE(c.reloptions, ARRAY[]::text[])
    INTO view_options
    FROM pg_class c
    WHERE c.oid = 'public.discoverable_profiles'::regclass;

    IF view_definition NOT ILIKE '%profile_visible%' THEN
      missing_items := array_append(
        missing_items,
        'discoverable_profiles must reference profile_visible'
      );
    END IF;

    IF 'security_invoker=true' = ANY(view_options) THEN
      missing_items := array_append(
        missing_items,
        'discoverable_profiles must enforce privacy flags internally instead of using security_invoker=true'
      );
    END IF;
  END IF;

  IF array_length(missing_items, 1) IS NOT NULL THEN
    RAISE EXCEPTION 'Release preflight audit failed. Missing or unsafe items: %',
      array_to_string(missing_items, '; ');
  END IF;

  RAISE NOTICE 'PASS: storage buckets, launch RPCs, RLS tables, and discovery visibility view are present.';
END $$;

-- Verification review approvals must require an active moderation reviewer.
DO $$
DECLARE
  v_definition TEXT;
BEGIN
  SELECT pg_get_functiondef(
    'public.review_profile_verification(uuid,text,text,uuid,text[])'::regprocedure
  )
  INTO v_definition;

  IF v_definition !~ 'FROM\s+public\.moderation_reviewers'
    OR v_definition !~ 'AND\s+mr\.active'
    OR v_definition NOT LIKE '%Reviewer is not authorized%'
  THEN
    RAISE EXCEPTION 'review_profile_verification must require an active moderation reviewer';
  END IF;
END;
$$;

-- Verification evidence cannot be user-deletable while a review is pending.
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
-- Public waitlist capture must route through the Edge Function and private RPC.
DO $$
DECLARE
  v_claim_definition TEXT;
BEGIN
  IF to_regclass('public.waitlist_edge_attempts') IS NULL THEN
    RAISE EXCEPTION 'table: waitlist_edge_attempts';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'waitlist_edge_attempts'
      AND c.relrowsecurity
      AND c.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'waitlist_edge_attempts must have forced RLS';
  END IF;

  IF has_table_privilege('anon', 'public.waitlist_edge_attempts', 'SELECT')
    OR has_table_privilege('anon', 'public.waitlist_edge_attempts', 'INSERT')
    OR has_table_privilege('authenticated', 'public.waitlist_edge_attempts', 'SELECT')
    OR has_table_privilege('authenticated', 'public.waitlist_edge_attempts', 'INSERT')
    OR has_table_privilege('service_role', 'public.waitlist_edge_attempts', 'INSERT')
    OR has_table_privilege('service_role', 'public.waitlist_edge_attempts', 'UPDATE')
  THEN
    RAISE EXCEPTION 'waitlist_edge_attempts direct access must stay denied';
  END IF;

  IF to_regprocedure('public.claim_waitlist_edge_attempt(text, text, text, text, integer)') IS NULL THEN
    RAISE EXCEPTION 'function: claim_waitlist_edge_attempt';
  END IF;

  IF has_function_privilege('anon', 'public.claim_waitlist_edge_attempt(text, text, text, text, integer)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.claim_waitlist_edge_attempt(text, text, text, text, integer)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'claim_waitlist_edge_attempt must not be executable by app clients';
  END IF;

  SELECT pg_get_functiondef('public.claim_waitlist_edge_attempt(text, text, text, text, integer)'::regprocedure)
  INTO v_claim_definition;

  IF v_claim_definition NOT LIKE '%waitlist-edge:%'
    OR v_claim_definition NOT LIKE '%p_max_per_hour%'
    OR v_claim_definition NOT LIKE '%attempt_count%'
    OR v_claim_definition NOT LIKE '%retry_after_seconds%'
  THEN
    RAISE EXCEPTION 'claim_waitlist_edge_attempt must enforce hourly edge attempt limits';
  END IF;

  IF has_function_privilege('anon', 'public.submit_waitlist_signup(text, text, text)', 'EXECUTE')
    OR has_function_privilege('authenticated', 'public.submit_waitlist_signup(text, text, text)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'submit_waitlist_signup must be service-role-only behind the waitlist Edge Function';
  END IF;
END;
$$;

SELECT 'PASS: release preflight audit completed; transaction will roll back' AS result;

ROLLBACK;
