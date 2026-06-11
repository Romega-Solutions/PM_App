# PinayMate Launch Migration Manifest

Date: 2026-06-11
Status: Source manifest only - applied state must be proven in staging and production

Apply these migrations in filename-runner order for the launch security, privacy, messaging, storage, OCR, and safety contract:

1. `00_complete_database_setup.sql`
2. `02_chat_schema_updates.sql`
3. `03_add_conversations_table.sql`
4. `04_production_security_hardening.sql`
5. `20260610094806_add_pinaymate_storage_buckets.sql`
6. `20260610100323_add_ocr_rate_limit.sql`
7. `20260610100523_add_basic_info_rpc.sql`
8. `20260610112000_add_account_deletion_requests.sql`
9. `20260610113000_add_privacy_settings.sql`
10. `20260610114000_respect_read_receipts_privacy.sql`
11. `20260610115000_respect_online_status_privacy.sql`
12. `20260611040010_pass_profile_rpc.sql`
13. `20260611120000_secure_send_message_rpc.sql`
14. `20260611121000_harden_user_report_payload.sql`
15. `20260611122000_fix_discovery_privacy_read_model.sql`
16. `20260611123000_add_notification_preferences.sql`
17. `20260611124000_repair_profile_creation_trigger.sql`
18. `20260611125000_add_waitlist_interest_capture.sql`
19. `20260611130000_add_report_review_workflow.sql`
20. `20260611131000_add_verification_review_workflow.sql`
21. `20260611132000_harden_report_abuse_and_discovery_read_model.sql`
22. `20260611133000_require_report_reviewer_and_waitlist_burst_control.sql`
23. `20260611134000_harden_moderation_audit_privileges.sql`
24. `20260611135000_harden_verification_review_and_evidence_retention.sql`
25. `20260611140000_add_waitlist_edge_abuse_control.sql`
26. `20260611141000_restrict_conversation_creation_rpc.sql`
27. `20260611142000_hide_empty_conversations_from_inbox.sql`
28. `999_restore_profile_visibility_filter.sql`
29. `99_final_release_security_hardening.sql`

## Migration purposes

- `20260611040010_pass_profile_rpc.sql` adds the `pass_profile` RPC so pass actions can be validated against the discovery read model before writing to `passes`, and it includes `REVOKE INSERT ON public.passes FROM authenticated` so direct app-client pass writes stay denied.
- `20260611123000_add_notification_preferences.sql` creates the RPC-backed `user_notification_preferences` table contract for saved notification intent while keeping direct client writes denied. It also repairs partially existing tables with idempotent column/default/not-null hardening and enforces `user_notification_preferences_push_children_check` so push-dependent child flags cannot remain enabled when `push_enabled` is false.
- `20260611124000_repair_profile_creation_trigger.sql` re-tracks the auth user to profile lifecycle as an idempotent migration. It recreates `public.handle_new_user()` with `SECURITY DEFINER SET search_path = ''`, revokes direct client execute grants, creates both confirmed-at-insert and email-verified update triggers, and preserves completed onboarding values if a client fallback profile already exists.
- `20260611125000_add_waitlist_interest_capture.sql` creates the minimal `waitlist_signups` table and `submit_waitlist_signup` RPC so PM_Web/PM_App launch interest can become backend-backed without granting direct table writes.
- `20260611130000_add_report_review_workflow.sql` adds service-role-only report review metadata and `review_user_report` so safety/support can move reports through `reviewing`, `resolved`, or `dismissed` without app-client table writes; later reviewer hardening blocks overwrite of a final review decision.
- `20260611131000_add_verification_review_workflow.sql` adds service-role-only profile verification review metadata, including `verification_reviewer_id`, and `review_profile_verification` so reviewers can move pending submitted evidence to `approved` or `rejected` without app-client table writes.
- `20260611132000_harden_report_abuse_and_discovery_read_model.sql` merges duplicate open reports, suppresses repeated same-pair report writes during a short cooldown, and documents the privileged discovery view as a narrow profile-card read model.
- `20260611133000_require_report_reviewer_and_waitlist_burst_control.sql` requires reviewer identity on report review decisions, requires that identity to be an active reviewer in `moderation_reviewers`, routes reviewer registry create/update/deactivation through service-role reviewer management RPCs with operator/reason capture, records reviewer registry changes in a reviewer audit log, blocks finalized report decision overwrites, and adds source/platform burst throttling for new waitlist rows with matching advisory bucket locking, public source restriction, and generic accepted responses.
- `20260611134000_harden_moderation_audit_privileges.sql` removes direct service-role writes to `moderation_reviewer_audit_log`, keeps reviewer registry writes behind the reviewer-management RPCs, and forces RLS on moderation reviewer, moderation audit, and waitlist tables.
- `20260611135000_harden_verification_review_and_evidence_retention.sql` requires profile verification reviewers to be active registry entries and blocks deletion of pending verification evidence through a restrictive storage policy.
- `20260611140000_add_waitlist_edge_abuse_control.sql` moves public waitlist capture behind the `waitlist-signup` Edge Function, adds service-role-only edge-attempt throttling, revokes direct table grants from `waitlist_signups`, and makes `submit_waitlist_signup` service-role-only for public launch.
- `20260611141000_restrict_conversation_creation_rpc.sql` makes `get_or_create_conversation` a private helper for `send_message` so app clients cannot create empty visible conversation rows without sending a message.
- `20260611142000_hide_empty_conversations_from_inbox.sql` hardens `get_user_conversations` so app inboxes only show matched, unblocked conversations that already have a real last message.

## Required proof after apply

- Capture migration history/list output for the target environment.
- Run `supabase/tests/05_release_preflight_audit.sql`.
- Run `supabase/tests/04_safety_smoke_test.sql`.
- Confirm preflight covers `user_notification_preferences_push_children_check`.
- Confirm preflight covers `public.handle_new_user()` and the `on_auth_user_created` / `on_auth_user_verified` triggers on `auth.users`.
- Confirm preflight covers `waitlist_signups`, direct table-write denial, and `submit_waitlist_signup`.
- Confirm preflight covers `review_user_report` and proves app clients cannot execute it.
- Confirm preflight covers `review_profile_verification`, reviewer metadata columns, pending evidence requirements, and proves app clients cannot execute it.
- Confirm preflight covers report abuse controls and forbids sensitive columns in `discoverable_profiles`.
- Confirm preflight covers required report reviewer identity, active reviewer authorization, reviewer management RPCs, reviewer audit logging, denial of direct audit-log writes, finalized report decision protection, waitlist burst controls, matching advisory bucket locking, public source restriction, and generic waitlist responses.
- Confirm preflight covers `waitlist_edge_attempts`, `claim_waitlist_edge_attempt`, direct table-grant denial for `waitlist_signups`, service-role-only `submit_waitlist_signup`, and `waitlist-signup` Edge Function deploy/secrets proof before PM_Web backend capture flags are enabled.
- Confirm preflight covers direct execution denial for `get_or_create_conversation` while `send_message` remains the only authenticated message/conversation creation path.
- Confirm preflight covers `get_user_conversations` hiding conversations where `last_message_id` is still null.
- Confirm preflight covers `pass_profile` and direct `INSERT` denial on `public.passes`.
- Confirm smoke SQL covers `save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE)` and proves child flags are cleared when push is disabled.
- Record redacted output in `docs/LAUNCH_EVIDENCE_PACKET.md`.

This file is not deployment proof. It is the source-of-truth order that staging and production evidence must match.

## Legacy filename ordering note

`99_final_release_security_hardening.sql` and `999_restore_profile_visibility_filter.sql` are legacy tail migrations whose filenames sort after the timestamped `202606...` migrations in a normal filename-ordered runner. They must remain safe if applied last:

- `99_final_release_security_hardening.sql` must not grant direct `INSERT` on `public.messages`; message creation must stay behind `public.send_message`.
- `99_final_release_security_hardening.sql` must not grant direct execute on `public.get_or_create_conversation`; conversation creation must stay behind `public.send_message`.
- `99_final_release_security_hardening.sql` must not grant direct `INSERT` on `public.passes`; pass actions must stay behind `public.pass_profile`.
- `99_final_release_security_hardening.sql` must keep `public.get_user_conversations` filtered to rows with `last_message_id IS NOT NULL`.
- `99_final_release_security_hardening.sql`, `999_restore_profile_visibility_filter.sql`, and `20260611122000_fix_discovery_privacy_read_model.sql` must keep `public.discoverable_profiles` as `security_invoker = false` and enforce `user_privacy_settings.profile_visible`.
- Staging and production evidence must record the actual migration history/list output before claiming the backend privacy contract is live.
