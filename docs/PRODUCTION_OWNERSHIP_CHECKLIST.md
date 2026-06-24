# PinayMate Production Ownership Checklist

Status: required before public launch.

Purpose: make sure PinayMate is owned by Romega-controlled accounts, not a personal developer account, and that every sensitive launch surface has a named owner, backup, and recovery path.

## Required signoff table

| Area                        | Required owner            | Backup owner | Required proof                                                         | Evidence path / date | Status  |
| --------------------------- | ------------------------- | ------------ | ---------------------------------------------------------------------- | -------------------- | ------- |
| Expo / EAS project          | Romega engineering owner  | named backup | EAS project visible under Romega-controlled account or team            |                      | Pending |
| Apple Developer account     | Romega app release owner  | named backup | Bundle ID, team ID, and App Store Connect access captured              |                      | Pending |
| Google Play Console         | Romega app release owner  | named backup | Package name, app access, and release track access captured            |                      | Pending |
| Supabase staging project    | Backend owner             | named backup | project ref, migration access, SQL Editor access, secret access policy |                      | Pending |
| Supabase production project | Backend owner             | named backup | project ref, migration access, SQL Editor access, secret access policy |                      | Pending |
| OCR provider account        | Backend owner             | named backup | provider account owner, quota, billing owner, API key rotation process |                      | Pending |
| DNS / production domain     | Web owner                 | named backup | registrar/DNS admin access and production host mapping                 |                      | Pending |
| Support mailbox             | Support owner             | named backup | `support@pinaymate.com` inbox access, SLA, escalation path             |                      | Pending |
| Legal mailbox               | Legal/support owner       | named backup | `legal@pinaymate.com` inbox access and response owner                  |                      | Pending |
| Safety moderation           | Safety owner              | named backup | report reviewer, verification reviewer, critical escalation path       |                      | Pending |
| Incident response           | Product/engineering owner | named backup | rollback owner, communication owner, emergency contact path            |                      | Pending |

## Stop conditions

Do not mark ownership ready while any of these are true:

- only one person can access or recover a launch-critical account
- an account is owned by an unclear personal login instead of a Romega-controlled account or team
- the owner cannot prove backup access without exposing passwords, tokens, or recovery codes
- staging and production ownership are mixed together without separate project refs and owners
- support, legal, safety, and incident response have no named backup
- a deferred row has no product-owner risk acceptance note

## Ownership evidence rule

Do not mark any row `Verified` unless the evidence path/date column points to proof that another Romega-approved owner can access or recover the account without depending on one developer's personal login.

## Expo / EAS requirements

Current repo risk: `app.json` still contains an Expo `owner` value that must be confirmed as Romega-controlled before launch.

Static contract:

```powershell
cd PM_App
node scripts/check-production-ownership-contract.mjs
```

This contract should fail until the Expo owner is either proven Romega-controlled or transferred to a Romega-owned account/team.

Required evidence:

- `eas whoami` output captured by owner without exposing tokens.
- EAS project owner/team screenshot or CLI evidence.
- Android package: `com.romegasolutions.Pinaymate`.
- iOS bundle ID: `com.romegasolutions.Pinaymate`.
- Release builds can be created by a shared Romega account or team, not only one personal login.
- Recovery access exists for at least two people.

## Supabase requirements

Required evidence for staging and production:

- Project ref recorded.
- Migration push owner assigned.
- SQL smoke-test runner assigned.
- Secrets owner assigned.
- `OCR_SPACE_API_KEY` exists only in the intended project environment.
- `04_safety_smoke_test.sql` pass output is captured after migrations.

Required migrations are listed in `supabase/LAUNCH_MIGRATION_MANIFEST.md`:

- `04_production_security_hardening.sql`
- `99_final_release_security_hardening.sql`
- `20260610094806_add_pinaymate_storage_buckets.sql`
- `20260610100323_add_ocr_rate_limit.sql`
- `20260610100523_add_basic_info_rpc.sql`
- `20260610112000_add_account_deletion_requests.sql`
- `20260610113000_add_privacy_settings.sql`
- `20260610114000_respect_read_receipts_privacy.sql`
- `20260610115000_respect_online_status_privacy.sql`
- `20260611120000_secure_send_message_rpc.sql`
- `20260611141000_restrict_conversation_creation_rpc.sql`
- `20260611142000_hide_empty_conversations_from_inbox.sql`
- `20260611121000_harden_user_report_payload.sql`
- `999_restore_profile_visibility_filter.sql`
- `20260611122000_fix_discovery_privacy_read_model.sql`
- `20260611123000_add_notification_preferences.sql`

Supabase owner acceptance criteria:

- staging and production project refs are recorded separately
- at least two approved people can access SQL Editor, project settings, API settings, logs, storage, and Edge Functions
- secrets can be rotated without depending on one personal account
- the migration runner and smoke-test runner are named before deployment
- rollback/escalation owner is named before production migration

## Domain and email requirements

Before launch:

- Production website domain is final.
- Supabase Site URL uses the production domain, not localhost.
- Redirect URLs include production web/native callbacks.
- `support@pinaymate.com` receives mail.
- `legal@pinaymate.com` receives mail.
- Mailbox owners and backups are named.

Required mailbox proof:

- send and receive test for `support@pinaymate.com`
- send and receive test for `legal@pinaymate.com`
- owner confirms where replies are handled
- backup confirms access
- response SLA is recorded in `SAFETY_MODERATION_RUNBOOK.md`

## Safety operations requirements

Before launch:

- Report queue owner is named.
- Verification reviewer is named.
- Critical escalation owner is named.
- Abuse SLA is accepted.
- Evidence handling rules are accepted.
- User-facing support wording avoids promising guaranteed safety, identity, or outcomes.

Required safety ownership proof:

- report owner and backup
- verification reviewer and backup
- account deletion owner and backup
- critical escalation owner and emergency path
- evidence-handling acceptance by everyone with queue access
- first-response SLA for each queue

## Launch decision rule

Do not mark PinayMate production-ready until every `Pending` row above is either:

- marked `Verified` with owner/date/evidence, or
- explicitly deferred by the product owner with a written risk acceptance note.
