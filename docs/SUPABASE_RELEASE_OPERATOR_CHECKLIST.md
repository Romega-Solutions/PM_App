# PinayMate Supabase Release Operator Checklist

Last updated: 2026-06-11

Purpose: give the backend/release owner a single, executable checklist for staging and production Supabase release evidence.

Status: required before backend launch signoff. This checklist does not apply migrations by itself and does not prove live state until the commands are run against the target project.

Launch-state source: use `docs/PINAYMATE_LAUNCH_STATE_MATRIX.md` before backend signoff. The matrix maps each user-facing capability to its source/backend artifact and required proof before launch-ready claims are allowed.

## Rules before running anything

- Use a Romega-owned Supabase account, not a personal-only account.
- Never paste secrets, access tokens, database passwords, anon keys, service-role keys, private user IDs, raw ID documents, or private messages into docs or chat.
- Record only redacted command output, pass/fail status, target environment, owner, date, and evidence path.
- Run staging first. Do not touch production until staging evidence is signed off.
- Confirm command flags with `supabase --help` and each subcommand help before live execution.
- Stop on first failed migration, SQL smoke test, preflight audit, OCR deploy, or secret ownership issue.

## Required operator fields

| Field | Value |
| ----- | ----- |
| Environment | staging / production |
| Supabase project ref | |
| Operator | |
| Backup operator | |
| Date | |
| CLI version | |
| Evidence folder/path | |
| Release decision | Hold / Staging pass / Production pass / Deferred with risk acceptance |

## 1. CLI and project link proof

Run from `PM_App`.

```powershell
npx -y supabase@latest --version
npx -y supabase@latest --help
npx -y supabase@latest link --help
npx -y supabase@latest db push --help
npx -y supabase@latest migration list --help
```

Then link the target project:

```powershell
$env:PROJECT_REF = "<target-project-ref>"
npx -y supabase@latest login
npx -y supabase@latest link --project-ref $env:PROJECT_REF
```

Evidence to record:

- CLI version.
- Project ref redacted enough to identify environment without leaking unrelated account data.
- Link command result.
- Whether a database password was requested.

Fail-stop:

- operator is not using a Romega-owned account
- CLI cannot link to the intended target project
- project ref is unclear
- login requires an unapproved personal token

## 2. Migration order proof

Use `supabase/LAUNCH_MIGRATION_MANIFEST.md` as the expected source order.

```powershell
npx -y supabase@latest migration list --linked
npx -y supabase@latest db push --dry-run --linked
```

Evidence to record:

- Migration list/history output.
- Dry-run output.
- Confirmation that these migrations are present and ordered as expected:

```text
00_complete_database_setup.sql
02_chat_schema_updates.sql
03_add_conversations_table.sql
04_production_security_hardening.sql
20260610094806_add_pinaymate_storage_buckets.sql
20260610100323_add_ocr_rate_limit.sql
20260610100523_add_basic_info_rpc.sql
20260610112000_add_account_deletion_requests.sql
20260610113000_add_privacy_settings.sql
20260610114000_respect_read_receipts_privacy.sql
20260610115000_respect_online_status_privacy.sql
99_final_release_security_hardening.sql
20260611120000_secure_send_message_rpc.sql
20260611121000_harden_user_report_payload.sql
999_restore_profile_visibility_filter.sql
20260611122000_fix_discovery_privacy_read_model.sql
20260611123000_add_notification_preferences.sql
20260611124000_repair_profile_creation_trigger.sql
20260611125000_add_waitlist_interest_capture.sql
20260611130000_add_report_review_workflow.sql
20260611131000_add_verification_review_workflow.sql
20260611132000_harden_report_abuse_and_discovery_read_model.sql
20260611133000_require_report_reviewer_and_waitlist_burst_control.sql
20260611134000_harden_moderation_audit_privileges.sql
20260611135000_harden_verification_review_and_evidence_retention.sql
20260611140000_add_waitlist_edge_abuse_control.sql
20260611141000_restrict_conversation_creation_rpc.sql
20260611142000_hide_empty_conversations_from_inbox.sql
```

- Confirmation that `20260611123000_add_notification_preferences.sql` includes idempotent repair for pre-existing `user_notification_preferences` tables, default/not-null hardening, and `user_notification_preferences_push_children_check`.
- Confirmation that `20260611124000_repair_profile_creation_trigger.sql` recreates `public.handle_new_user()` with `SECURITY DEFINER SET search_path = ''`, revokes direct client execute grants, and installs both `on_auth_user_created` and `on_auth_user_verified` triggers.
- Confirmation that `20260611125000_add_waitlist_interest_capture.sql` creates `waitlist_signups`, keeps direct table access denied, and exposes only `submit_waitlist_signup` for constrained launch-interest capture.
- Confirmation that `20260611130000_add_report_review_workflow.sql` adds service-role-only `review_user_report` and review metadata for controlled safety/support decisions.
- Confirmation that `20260611131000_add_verification_review_workflow.sql` adds service-role-only `review_profile_verification`, requires pending submitted evidence, and keeps app clients unable to approve verification badges.
- Confirmation that `20260611132000_harden_report_abuse_and_discovery_read_model.sql` merges duplicate open reports, suppresses short-window repeated same-pair report writes, and documents discovery as a narrow profile-card read model.
- Confirmation that `20260611133000_require_report_reviewer_and_waitlist_burst_control.sql` requires `p_reviewer_id` for `review_user_report`, requires that reviewer to be active in `moderation_reviewers`, routes reviewer registry create/update/deactivation through service-role reviewer management RPCs with operator/reason capture, records reviewer registry changes in `moderation_reviewer_audit_log`, blocks finalized report decision overwrites, keeps `review_user_report` service-role-only, locks the same source/platform waitlist bucket it counts, limits public waitlist source values to `pm_web`/`pm_app`, and returns generic accepted responses so public callers cannot infer existing waitlist status.
- Confirmation that `20260611134000_harden_moderation_audit_privileges.sql` removes direct service-role writes to `moderation_reviewer_audit_log`, keeps reviewer registry writes behind the reviewer-management RPCs, and forces RLS on moderation reviewer, moderation audit, and waitlist tables.
- Confirmation that `20260611135000_harden_verification_review_and_evidence_retention.sql` requires profile verification reviewers to be active registry entries and blocks deletion of pending verification evidence through a restrictive storage policy.
- Confirmation that `20260611140000_add_waitlist_edge_abuse_control.sql` creates service-role-only `waitlist_edge_attempts` / `claim_waitlist_edge_attempt`, revokes direct table grants from `waitlist_signups`, revokes public execute from `submit_waitlist_signup`, and requires PM_Web backend capture to route through the `waitlist-signup` Edge Function.
- Confirmation that `20260611141000_restrict_conversation_creation_rpc.sql` keeps `get_or_create_conversation` private to `send_message` so app clients cannot create empty visible conversations without sending a message.
- Confirmation that `20260611142000_hide_empty_conversations_from_inbox.sql` keeps `get_user_conversations` from returning conversations with no real last message.

Fail-stop:

- migration history is missing a launch migration
- an unexpected manual repair script is pending
- `99_` / `999_` legacy tail migrations would weaken the final privacy/message contract
- dry run includes unrelated destructive changes

## 3. Migration apply proof

Only after the dry run is reviewed:

```powershell
npx -y supabase@latest db push --linked
npx -y supabase@latest migration list --linked
```

Evidence to record:

- Apply command output.
- Final migration list/history.
- Operator decision: pass, fail, or rollback/escalate.

Fail-stop:

- apply fails
- history does not show the expected final migrations
- migration output includes unreviewed destructive changes
- project target is staging/production mismatch

## 4. Release preflight audit

Run the structural audit against the target database.

Preferred SQL Editor file:

```text
supabase/tests/05_release_preflight_audit.sql
```

Alternative with `psql`:

```powershell
$env:DATABASE_URL = "<percent-encoded-target-database-url>"
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\05_release_preflight_audit.sql
```

Required pass marker:

```text
PASS: release preflight audit completed; transaction will roll back
```

Evidence to record:

- Pass marker.
- Any warning or failure text.
- Confirmation that output was redacted.

Fail-stop:

- missing private `verification-docs` bucket
- missing `public.handle_new_user()` profile creation trigger function
- missing `on_auth_user_created` or `on_auth_user_verified` auth trigger
- `public.handle_new_user()` is directly executable by `anon` or `authenticated`
- missing `waitlist_signups` table/RLS or `submit_waitlist_signup` RPC
- `waitlist_signups` direct table access is granted to `anon`, `authenticated`, or `service_role`
- missing `review_user_report` RPC or report review metadata
- `review_user_report` is executable by `anon` or `authenticated`
- missing `review_profile_verification` RPC or profile verification review metadata
- `review_profile_verification` is executable by `anon` or `authenticated`
- missing report duplicate/cooldown controls
- `review_user_report` accepts null/missing `reviewer_id`, accepts an inactive/unregistered reviewer, reviewer registry changes bypass the management RPCs, reviewer registry changes are not audited with operator/reason, finalized report decisions can be overwritten, or non-service-role execution is allowed
- waitlist Edge Function, edge-attempt throttle, service-role-only RPC boundary, source/platform burst control, advisory bucket lock, public source restriction, or generic accepted response missing
- `discoverable_profiles` exposes sensitive, private verification, moderation, contact, or reviewer columns
- missing launch RPC
- missing RLS on launch-critical table
- missing `user_notification_preferences_push_children_check`
- discovery view does not reference `profile_visible`
- discovery view uses the wrong security posture

## 5. Safety smoke test

Run the behavioral smoke test after migrations and preflight pass.

Preferred SQL Editor file:

```text
supabase/tests/04_safety_smoke_test.sql
```

Alternative with `psql`:

```powershell
$env:DATABASE_URL = "<percent-encoded-target-database-url>"
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\04_safety_smoke_test.sql
```

Required pass marker:

```text
PASS: production hardening report/block/unmatch/messaging/privacy discovery safety smoke test completed; transaction will roll back
```

Evidence to record:

- Pass marker.
- Redacted failure text if it fails.
- Confirmation that no real customer accounts were used.
- Confirmation that notification preference direct writes are denied, RPC save/load works, and `save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE)` clears push-dependent child flags.
- Confirmation that profile verification review cannot be executed by app clients, cannot approve a profile without submitted evidence, and can approve pending evidence only through the service-role path.

Fail-stop:

- reports can be forged
- blocks do not remove discovery/chat access
- unmatched users can chat
- direct message table mutation is allowed
- direct `get_or_create_conversation` execution is allowed
- `get_user_conversations` returns empty conversation rows
- privacy settings do not hide profile/online/read-receipt state
- chat image path or storage policy checks fail
- notification preference RPC allows push-dependent flags to stay enabled when push is disabled

## 5a. Backend feature proof map

After preflight and smoke tests, compare the Supabase rows in `docs/PINAYMATE_LAUNCH_STATE_MATRIX.md` against captured evidence.

Use `docs/evidence/TEMPLATE-supabase-live-proof.md` as the capture format for staging and production proof. Save a dated copy with redacted command output, SQL smoke results, OCR function proof, and notification delivery boundary notes before changing any Supabase launch row from blocked/source-only to pass.

Use `docs/SUPABASE_LIVE_PROOF_COMMANDS.md` for the exact operator command sequence and capture checklist.

Required backend proof coverage:

- Discovery privacy: applied migrations plus discovery privacy smoke SQL.
- Likes/matches: match-forging rejection and two-account QA before public matching claims.
- Messaging: secure send-message RPC proof, direct message-write rejection, direct conversation-helper execution rejection, empty-conversation inbox hiding, and blocked/unmatched-chat rejection.
- Read receipts: unread count clears without exposing sender-visible read status when disabled.
- Reports/block/unmatch: report RPC, block persistence, unmatch behavior, blocked discovery, and blocked chat proof.
- Report review operations: `review_user_report` service-role-only proof, active reviewer registry proof, reviewer management RPC proof, reviewer registry audit proof with operator/reason, finalized-decision overwrite rejection, review metadata proof, and authenticated client execute denial.
- Report abuse controls: duplicate open reports merge into one queue row, short-window repeated same-pair writes are suppressed, and direct forged inserts still fail.
- Verification/OCR: private storage, OCR function deploy, JWT enforcement, valid/invalid/rate-limit behavior, service-role `review_profile_verification` proof, and reviewer workflow proof.
- Notification settings: applied migration, `user_notification_preferences_push_children_check`, RPC smoke SQL, and provider delivery proof before delivery claims.
- Account deletion: request RPC proof, direct-write rejection, support owner proof, and retention workflow proof.
- Waitlist capture: `waitlist_signups` RLS proof, direct table access denial, valid/invalid `submit_waitlist_signup` proof, source/platform bucket-lock proof, public source restriction proof, generic accepted response proof, and Edge Function abuse/rate-limit proof before public PM_Web traffic is routed to `waitlist-signup`.
- Report review operations: service-role-only `review_user_report` proof with active reviewer identity capture, reviewer management RPC proof, reviewer registry audit proof with operator/reason, `reviewer_id` persistence, and finalized-report overwrite rejection.
- Waitlist capture controls: `waitlist-signup` Edge Function deploy proof, `claim_waitlist_edge_attempt` throttling proof, service-role-only `submit_waitlist_signup` proof, advisory bucket-lock behavior proof, public source restriction proof, generic duplicate/blocked response proof, and denied burst behavior proof before public capture hardening claims.

Evidence to record:

- Which matrix rows are proven in staging.
- Which matrix rows are proven in production.
- Which matrix rows remain source-only or blocked.

Fail-stop:

- a customer-facing capability is marked launch-ready without matching target-environment proof
- notification provider delivery is claimed from preference RPC proof only
- source migrations are treated as applied backend proof without migration history and smoke/preflight output

## 5b. Waitlist Edge Function proof

Run only after migrations, preflight, and safety smoke SQL pass.

```powershell
npx -y supabase@latest functions deploy waitlist-signup --project-ref $env:PROJECT_REF --no-verify-jwt
npx -y supabase@latest secrets list --project-ref $env:PROJECT_REF
```

Required secrets or platform env values:

- `SUPABASE_URL` present in the Edge Function runtime.
- `SUPABASE_SERVICE_ROLE_KEY` present in the Edge Function runtime and never exposed to PM_Web.
- `WAITLIST_ALLOWED_ORIGINS` contains only approved PM_Web origins.
- `WAITLIST_RATE_LIMIT_SALT` is present and high entropy.
- `WAITLIST_TURNSTILE_SECRET_KEY` and `WAITLIST_REQUIRE_TURNSTILE=true` are present if challenge-provider proof is required for the launch decision.

Evidence to record:

- Function deployment success.
- Secret presence only, never values.
- `WAITLIST_ALLOWED_ORIGINS` approved by release owner.
- `WAITLIST_ALLOW_NO_ORIGIN` is not enabled in production unless explicitly risk-accepted.
- Direct browser/client execution of `submit_waitlist_signup` is denied.
- Direct `service_role` table grants on `waitlist_signups` are denied; service-role write access routes through the RPC.
- `waitlist-signup` accepts a valid request from an approved origin and returns the generic accepted shape.
- Repeated requests from the same client bucket hit `claim_waitlist_edge_attempt` and return rate-limit behavior.
- Honeypot-filled requests return generic accepted response without creating a waitlist row.

Fail-stop:

- service-role key is exposed to PM_Web or PM_App
- `WAITLIST_ALLOWED_ORIGINS` is missing or contains unapproved origins
- `WAITLIST_RATE_LIMIT_SALT` is missing
- direct anon/authenticated execution of `submit_waitlist_signup` is still allowed
- PM_Web backend capture flag is enabled before deploy, secret, rate-limit, and production URL proof is captured
## 6. OCR Edge Function proof

Confirm function config and deploy.

```powershell
npx -y supabase@latest functions deploy --help
npx -y supabase@latest secrets list --project-ref $env:PROJECT_REF
npx -y supabase@latest functions deploy ocr --project-ref $env:PROJECT_REF --use-api
```

Evidence to record:

- `OCR_SPACE_API_KEY` presence only, never its value.
- Deploy output.
- Confirmation that `[functions.ocr] verify_jwt = true` remains in `supabase/config.toml`.

Fail-stop:

- secret missing
- function deployed with JWT verification disabled
- deploy target is wrong project
- logs expose document content or provider secret

## 7. OCR behavior proof

Set local variables without recording their raw values:

```powershell
$env:FUNCTION_URL = "https://$env:PROJECT_REF.functions.supabase.co/ocr"
$env:ACCESS_TOKEN = "<signed-in-test-user-access-token>"
$env:ANON_KEY = "<target-anon-or-publishable-key>"
$env:VALID_DOC = "C:\path\to\valid-test-document.jpg"
$env:INVALID_DOC = "C:\path\to\invalid-or-blank-image.jpg"
```

Unauthenticated request must fail:

```powershell
curl.exe -i -X POST $env:FUNCTION_URL -F "document=@$env:VALID_DOC"
```

Authenticated valid document request must pass:

```powershell
curl.exe -i -X POST $env:FUNCTION_URL `
  -H "Authorization: Bearer $env:ACCESS_TOKEN" `
  -H "apikey: $env:ANON_KEY" `
  -F "document=@$env:VALID_DOC"
```

Authenticated invalid document request must fail safely:

```powershell
curl.exe -i -X POST $env:FUNCTION_URL `
  -H "Authorization: Bearer $env:ACCESS_TOKEN" `
  -H "apikey: $env:ANON_KEY" `
  -F "document=@$env:INVALID_DOC"
```

Evidence to record:

- HTTP status summaries.
- Redacted response shape.
- Confirmation that no provider internals, secret values, tokens, private document image, or raw OCR text were pasted into public docs.

Fail-stop:

- unauthenticated OCR succeeds
- valid authenticated request cannot process test document
- invalid request exposes provider details or secret values
- rate limit behavior is missing or crashy

## 8. Evidence packet update

After each stage, update `docs/LAUNCH_EVIDENCE_PACKET.md`:

- `## 2. Supabase staging evidence`
- `## 3. OCR live evidence`
- `## 7. Final launch decision`

Each row needs:

- Result
- Owner
- Date
- Evidence link or note

Accepted result values:

- `Pass`
- `Deferred with risk acceptance`

Anything else remains launch-blocking.

## References

- Supabase CLI reference: https://supabase.com/docs/reference/cli/introduction
- Supabase local development and migrations overview: https://supabase.com/docs/guides/local-development/overview

## Verification reviewer and evidence-retention gate

Before marking profile verification review launch-ready, confirm:

- `review_profile_verification` rejects reviewer IDs that are not active in `moderation_reviewers`.
- Verification reviewers are active registry entries created through the service-role reviewer-management RPCs.
- Users cannot delete `verification-docs` objects that are referenced by a pending verification review.
- The ordered migration set includes `20260611135000_harden_verification_review_and_evidence_retention.sql` and the smoke/preflight SQL checks pass after it is applied.
