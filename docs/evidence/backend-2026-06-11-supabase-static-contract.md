# Supabase Static Contract Audit

Date: 2026-06-11
Generated at: 2026-06-11T06:16:16.478Z
Command: `npm run check:supabase-static-contract`
Status: PASS

This is static-only proof. It checks that required migration, SQL smoke-test, OCR function, client-call, and forbidden privacy-risk markers match the local repository contract.

It does not prove migrations were applied to a live Supabase project, that RLS/storage policies are active in production, that Supabase advisors pass, or that the OCR endpoint/rate limit works against a deployed database.

## Passed Contracts

- Launch migration manifest
- Conversation creation RPC boundary
- No empty conversation inbox rows
- Waitlist interest capture
- Profile creation trigger
- Security-definer search path hardening
- Safety reports
- Block and unmatch
- Account deletion queue
- Privacy settings
- Read receipts privacy
- Online status privacy
- Storage buckets
- Verification private review controls
- Privilege boundary smoke checks
- Account deletion request controls
- Read receipt privacy controls
- Notification preferences
- OCR rate limiting
- Discovery read model
- Conversations and messages

## Missing Contracts

- None

## Static Files Inspected

- `app/(main)/profile-settings/notifications.tsx`
- `src/features/account/api/notificationSettingsApi.ts`
- `src/features/matching/screens/LikesScreen.tsx`
- `src/features/messaging/api/__tests__/messages.api.test.ts`
- `src/features/messaging/api/messages.api.ts`
- `src/features/messaging/screens/ChatScreen.tsx`
- `src/services/ocrService.ts`
- `supabase/LAUNCH_MIGRATION_MANIFEST.md`
- `supabase/config.toml`
- `supabase/functions/create-profile-on-signup.sql`
- `supabase/functions/ocr/index.ts`
- `supabase/functions/waitlist-signup/README.md`
- `supabase/functions/waitlist-signup/index.ts`
- `supabase/migrations/03_add_conversations_table.sql`
- `supabase/migrations/20260610090000_restore_legacy_security_primitives.sql`
- `supabase/migrations/20260610094806_add_pinaymate_storage_buckets.sql`
- `supabase/migrations/20260610100323_add_ocr_rate_limit.sql`
- `supabase/migrations/20260610112000_add_account_deletion_requests.sql`
- `supabase/migrations/20260610113000_add_privacy_settings.sql`
- `supabase/migrations/20260610114000_respect_read_receipts_privacy.sql`
- `supabase/migrations/20260610115000_respect_online_status_privacy.sql`
- `supabase/migrations/20260611120000_secure_send_message_rpc.sql`
- `supabase/migrations/20260611121000_harden_user_report_payload.sql`
- `supabase/migrations/20260611122000_fix_discovery_privacy_read_model.sql`
- `supabase/migrations/20260611123000_add_notification_preferences.sql`
- `supabase/migrations/20260611124000_repair_profile_creation_trigger.sql`
- `supabase/migrations/20260611125000_add_waitlist_interest_capture.sql`
- `supabase/migrations/20260611130000_add_report_review_workflow.sql`
- `supabase/migrations/20260611131000_add_verification_review_workflow.sql`
- `supabase/migrations/20260611132000_harden_report_abuse_and_discovery_read_model.sql`
- `supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql`
- `supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql`
- `supabase/migrations/20260611141000_restrict_conversation_creation_rpc.sql`
- `supabase/migrations/20260611142000_hide_empty_conversations_from_inbox.sql`
- `supabase/migrations/999_restore_profile_visibility_filter.sql`
- `supabase/migrations/20260611144000_final_release_security_hardening.sql`
- `supabase/tests/04_safety_smoke_test.sql`
- `supabase/tests/05_release_preflight_audit.sql`

## Residual Live Blockers

- Run Supabase migration history/list against the linked project.
- Apply pending migrations to the target environment if migration history is behind.
- Run Supabase DB lint/advisors against local or linked Postgres.
- Run `supabase/tests/04_safety_smoke_test.sql` in a staging/local database with two active profiles.
- Verify deployed OCR Edge Function rate limiting with real authenticated requests.
