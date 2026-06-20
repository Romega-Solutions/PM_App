# PinayMate Launch Sign-off Checklist

Last updated: 2026-06-11

Purpose: define the evidence required before PinayMate can be called production-ready. This is a release-control checklist, not marketing copy.

## Current release decision

Status: not launch-ready until the blocked evidence below is captured.

PM_App and PM_Web local quality checks passed on the current worktree on 2026-06-11. PM_App release-local still fails because the production ownership contract rejects the current Expo owner until it is proven Romega-controlled or transferred. Production readiness still requires live Supabase migration proof, deployed OCR proof, native device QA, safety/support/legal/release owner assignment, production PM_Web and mailbox proof, and final launch-link validation.

Use `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md` as the shared claim contract, `docs\release\PRODUCTION_OWNERSHIP_CHECKLIST.md` for account ownership signoff, `docs\operations\SUPABASE_RELEASE_OPERATOR_CHECKLIST.md` for backend release execution, and `docs\release\LAUNCH_EVIDENCE_PACKET.md` for the final proof pack.

## Go/no-go rule

PinayMate cannot be called production-ready while any launch-control lane below is still blocked, unowned, stale, or source-only. The release owner may only mark a lane ready when its owner, date, environment, command/source, and redacted evidence are recorded in `docs\release\LAUNCH_EVIDENCE_PACKET.md`.

Customer-facing copy, release notes, support responses, safety language, and manager summaries must match `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md`. If the matrix marks a capability as waitlist-only, gated, source-only, or blocked pending proof, no PM_App or PM_Web surface may imply that the capability is live.

| Launch-control lane | Go condition | Stop condition |
| ------------------- | ------------ | -------------- |
| Secret hygiene | secret-hygiene passes and any previously tracked values have a rotation/recovery decision | unreviewed exposure risk, pasted secret values, or failed guard |
| Local release gates | current-head PM_App and PM_Web local gates pass after latest source/script changes | old pass output, needs-rerun status, or unchecked guard change |
| Launch-state claims | PM_App, PM_Web, support, safety, legal, and manager-facing copy match `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md` | copy implies live matching, payments, app-store availability, automatic verification, instant moderation, SMS/calls, provider delivery, or production backend proof before evidence |
| Supabase backend | staging then production migrations and safety smoke pass | local/static-only proof, failed migration, skipped smoke SQL, or missing target project proof |
| Waitlist Edge Function | `waitlist-signup` deploy, approved origins, server-only service-role key, rate-limit salt, direct RPC denial, honeypot behavior, and repeated-request throttle are proven | direct browser RPC path, missing origin allowlist, missing rate-limit salt, service-role key exposed to clients, or no live function proof |
| OCR verification | deployed function proves JWT auth, quota, valid/invalid document behavior, and safe errors | missing secret, unauthenticated OCR success, provider-detail leak, or no live deploy proof |
| Native PM_App QA | native QA script passes required flows with device/build evidence | web-only proof, Expo limitation not disclosed, auth/privacy/safety fail-stop, or missing screenshots/notes |
| PM_Web production | final domain loads, CTAs/legal/support work, mobile/desktop smoke passes, and claims stay waitlist-safe | local-only proof, fake availability/payment/matching/safety claims, broken mailbox, or mobile overflow |
| Safety operations | report, verification, support, escalation, evidence-handling, and backup owners are assigned | no named owner, no SLA, no escalation path, or one-person dependency |
| Production ownership | Romega-owned accounts and backups are documented for every launch-critical service | personal-only access, missing recovery, unclear app-store/provider ownership, or no backup |

## Operator map for active hardening lanes

The following source-complete controls are in place and still require environment proof before any launch-signoff:

| Lane | Source implementation evidence | Operator proof required |
| ---- | ----------------------------- | ---------------------- |
| Waitlist abuse control | Edge function + allowlist + CORS boundary + no-store response + honeypot + IP-anonymized HMAC rate bucket + optional Turnstile + private `submit_waitlist_signup` path + proof flags in web handoff | Staging + production deploy evidence, origin/header validation, repeated-request behavior, honeypot/challenge behavior, retry-after behavior, and direct RPC denial output |
| Conversation creation boundary | `send_message` RPC path + revoked direct `get_or_create_conversation` execution + `get_user_conversations` null-last-message filter | Smoke SQL assertions for direct helper rejection and empty-conversation filtering |
| Mobile first-send chat behavior | Chat composer/render path no longer assumes pre-created conversation; message history reloads by active conversation ID; read state is marked after messages load; image upload is guarded by active conversation | Native QA trace showing first text send creates conversation, read/unread state clears on open, and image upload remains disabled until then |
| Waitlist fallback governance | PM_Web handoff keeps email fallback when proof flags are not accepted | Proof-flag values, production URL validation, and mailbox fallback evidence |
| OCR control posture | OCR function and verification review path are now source-complete with secret-side processing | JWT-required probe, valid/invalid/rate-limit checks, and secret-scope evidence in staging/prod |

## Evidence acceptance rules

- Every gate must record a named owner, backup owner where applicable, date, environment, command/source, and evidence link or file path.
- Screenshots, command output, SQL output, and provider dashboard proof must redact secrets, tokens, private IDs, private messages, and real user documents.
- `Implemented`, `available in code`, or `locally inspected` is not enough for production signoff when the gate depends on Supabase, native devices, support mailboxes, app stores, OCR providers, DNS, or deployed URLs.
- Blank owner/date/evidence fields are release blockers.
- Staging evidence does not automatically approve production; production requires its own captured proof.

## Required owners

| Area                          | Owner                     | Required evidence                                                                                                                                                  | Status                                        |
| ----------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| Supabase migrations           | Backend owner             | `docs\operations\SUPABASE_RELEASE_OPERATOR_CHECKLIST.md` completed with `db push --dry-run`, `db push`, migration list/history, smoke-test output                             | Blocked by target project access              |
| Supabase RLS/storage/security | Backend owner             | `docs\operations\SUPABASE_RELEASE_OPERATOR_CHECKLIST.md` completed with `05_release_preflight_audit.sql` and `04_safety_smoke_test.sql` pass output on staging and production | Blocked by target database access             |
| Waitlist Edge Function       | Backend/product owner     | `docs\operations\SUPABASE_RELEASE_OPERATOR_CHECKLIST.md` completed with deploy, secret-presence, approved-origin, direct-RPC-denial, honeypot, and repeated-request throttle proof | Blocked by Supabase project access            |
| OCR Edge Function             | Backend owner             | `docs\operations\SUPABASE_RELEASE_OPERATOR_CHECKLIST.md` completed with secret list evidence, deploy output, 401 unauthenticated check, valid/invalid document checks         | Blocked by Supabase project + provider secret |
| PM_App native QA              | Product/design owner      | `docs\testing\NATIVE_QA_SCRIPT.md` completed with device/emulator proof for auth, onboarding, location, verification, discovery, matching, messaging, report/block/unmatch | Blocked by device/emulator QA                 |
| Product design QA             | Product/design owner      | `docs\testing\PRODUCT_DESIGN_QA_STANDARD.md` completed with PM_App native screenshots and PM_Web desktop/mobile screenshots                                      | Blocked by screenshot/design review evidence  |
| Launch-state claim alignment  | Product owner             | PM_App, PM_Web, support, safety, legal, and manager-facing copy reviewed against `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md`                                 | Source checks pass locally; final owner review still required |
| PM_Web launch page            | Product/design owner      | `npm run check:local-quality`, browser desktop/mobile smoke, final support mailbox/domain confirmation                                                             | Local quality passed; production URL/mailbox proof still required |
| Secret hygiene                | Engineering owner         | `npm run check:secret-hygiene` pass output plus rotation/recovery decision for any previously tracked values                                                       | Local guard passed; rotation/recovery review still required |
| Support operations            | Product owner             | support inbox owner, response SLA, escalation path for reports/verification                                                                                        | Needs owner sign-off                          |
| Safety moderation             | Safety/support owner      | `docs\operations\SAFETY_MODERATION_RUNBOOK.md` reviewed with report, verification, and escalation owners assigned                                                             | Needs owner sign-off                          |
| Production ownership          | Product/engineering owner | `docs\release\PRODUCTION_OWNERSHIP_CHECKLIST.md` completed                                                                                                                 | Needs owner sign-off                          |
| Production ownership static contract | Product/engineering owner | `node scripts/check-production-ownership-contract.mjs` output plus EAS owner/team proof                                                                             | Blocked by current owner proof/transfer       |
| Launch evidence packet        | Release owner             | `docs\release\LAUNCH_EVIDENCE_PACKET.md` completed with owner/date/evidence                                                                                                | Needs owner sign-off                          |

## Owner decision checklist

Fill this before final launch review. Blank rows are blockers.

| Decision | Named owner | Backup owner | Evidence location | Decision |
| -------- | ----------- | ------------ | ----------------- | -------- |
| Launch, staging-only, or hold decision | | | `docs\release\LAUNCH_EVIDENCE_PACKET.md` | |
| `.env` cleanup and rotation decision | | | `docs/evidence/` | |
| PM_App release-local evidence approval | | | `docs/evidence/` | |
| PM_App dependency risk approval | | | `docs\operations\DEPENDENCY_AUDIT_REMEDIATION.md` | |
| Supabase staging migration approval | | | `docs/evidence/` | |
| Waitlist Edge Function approval | | | `docs/evidence/` | |
| Supabase production migration approval | | | `docs/evidence/` | |
| OCR provider and verification-review approval | | | `docs/evidence/` | |
| Native QA approval | | | `docs\testing\NATIVE_QA_SCRIPT.md` | |
| Product design QA approval | | | `docs\testing\PRODUCT_DESIGN_QA_STANDARD.md` | |
| Launch-state claim approval | | | `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md` | |
| PM_Web production approval | | | `PM_Web/RELEASE_CHECKLIST.md` | |
| Safety/support operations approval | | | `docs\operations\SAFETY_MODERATION_RUNBOOK.md` | |
| Production account ownership approval | | | `docs\release\PRODUCTION_OWNERSHIP_CHECKLIST.md` | |

## Manager gate map

Use this table to make the launch decision without reading implementation details.

| Decision area             | Proof source                             | Green means                                                                        | Current state              |
| ------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------- |
| Conversion and web trust  | PM_Web gate + evidence packet            | final site loads, CTAs are honest, support/legal paths work                        | local source pass; production proof blocked |
| Launch-state claim control | launch-state matrix + evidence packet    | app, web, support, safety, legal, and manager copy do not overclaim live capabilities | source checks pass locally; final owner review required |
| Mobile onboarding quality | native QA script + evidence packet       | user can sign up, verify, onboard, recover, and continue without dead ends         | blocked by native QA       |
| Product design QA         | product design QA standard + screenshots | PM_App and PM_Web are usable, coherent, accessible, honest, and visually launch-ready | blocked by design QA evidence |
| Backend safety            | Supabase migration/smoke/advisor outputs | users cannot forge matches, bypass RLS, read private evidence, or chat wrong users | blocked by target DB proof |
| Waitlist backend capture  | waitlist Edge Function proof              | public waitlist capture is origin-gated, rate-limited, honeypot-aware, and RPC-private | blocked by function deploy proof |
| Identity verification     | OCR deploy and native verification QA    | OCR is authenticated, quota-gated, private, and review-based                       | blocked by deploy proof    |
| Dating safety operations  | safety runbook + two-account QA          | report, block, unmatch, escalation, and review ownership are operational           | blocked by owner signoff   |
| Business ownership        | production ownership checklist           | Romega owns accounts, recovery, secrets, domains, app-store access                 | blocked by owner signoff   |

## 0. Local release gate before external proof

Run this before staging or production signoff work:

```powershell
cd PM_App

# Keeps local app posture current while external ownership and live-service evidence are still blocked.
npm run check:local-quality

# Source contracts grouped by package script. Does not include approval-bound ownership proof.
npm run check:source-contracts

# Static app ownership and EAS metadata check.
node scripts/check-production-ownership-contract.mjs

# Static Supabase auth redirect and deep-link contract.
node scripts/check-auth-redirect-contract.mjs

# Static safe environment template contract.
node scripts/check-env-template-contract.mjs

# Dependency audit is now part of release-local, but can be run separately while investigating advisories.
npm run check:dependency-audit

# Required PM_App release gate. It currently fails until ownership, safety, and launch evidence are complete.
npm run check:release-local

cd ..\PM_Web
npm run check:local-quality
```

Current known blockers:

- `npm run check:local-quality`, `npm run check:source-contracts`, `npm run check:secret-hygiene`, and dependency audit passed locally on 2026-06-11.
- `npm run check:release-local` still fails at `check:production-ownership-contract` because `app.json` declares `expo.owner: canthought`.
- `npx eas-cli whoami` returns `Not logged in`, so EAS ownership cannot be verified from this session.
- `npx supabase migration list --linked` returns `Cannot find project ref`, so live migration state cannot be verified from this checkout yet.
- `npm run check:safety-operations-contract` fails until real safety, support, legal, and release owners are assigned.
- `npm run check:launch-evidence-contract` fails until Supabase, OCR, native QA, PM_Web production, safety/moderation, and final signoff evidence rows are filled.
- Do not paste env values into evidence.
- Record whether any previously tracked Supabase anon/publishable key needs rotation based on where the repository has been shared.

## 1. Staging Supabase migration run

Run from `PM_App`.

PowerShell:

```powershell
$env:PROJECT_REF = "<staging-project-ref>"

npx -y supabase@latest login
npx -y supabase@latest link --project-ref $env:PROJECT_REF
npx -y supabase@latest db push --dry-run --linked
npx -y supabase@latest db push --linked
```

Required evidence:

- The dry run lists only intended ordered production migrations and matches `supabase/LAUNCH_MIGRATION_MANIFEST.md` filename-runner order.
- `99_final_release_security_hardening.sql` remains safe as a legacy tail migration and is recorded in the actual migration history/list output.
- `20260610094806_add_pinaymate_storage_buckets.sql` is included so `profile-photos` and private `verification-docs` buckets/policies are migration-backed.
- `20260610100323_add_ocr_rate_limit.sql` is included so OCR provider calls are quota-gated by `claim_ocr_attempt`.
- `20260610100523_add_basic_info_rpc.sql` is included so basic info setup uses `save_basic_info` and direct account-type mutation is blocked.
- `20260610112000_add_account_deletion_requests.sql` is included so account deletion requests are backend-backed and direct client writes are blocked.
- `20260610113000_add_privacy_settings.sql` is included so privacy toggles are backend-backed and profile visibility affects discovery.
- `20260610114000_respect_read_receipts_privacy.sql` is included so read receipts off clears unread counts without exposing sender-visible read status.
- `20260610115000_respect_online_status_privacy.sql` is included so online status is masked when members opt out.
- `20260611120000_secure_send_message_rpc.sql` is included so message creation goes through `send_message` instead of direct table inserts.
- `20260611141000_restrict_conversation_creation_rpc.sql` is included so conversation creation remains private to `send_message` and cannot be triggered directly to create empty inbox rows.
- `20260611142000_hide_empty_conversations_from_inbox.sql` is included so legacy or accidental empty conversation rows stay hidden from the Messages list.
- `20260611121000_harden_user_report_payload.sql` is included so report payloads are capped and normalized.
- `999_restore_profile_visibility_filter.sql` and `20260611122000_fix_discovery_privacy_read_model.sql` are included so the final discovery read model can enforce hidden-profile filtering while still exposing only approved profile-card fields.
- `20260611123000_add_notification_preferences.sql` is included so notification settings are backend-backed and push-dependent flags are cleared when push is disabled.
- No files from `supabase/manual-repair-scripts` are applied as migrations.
- The final command exits successfully.

Do not continue to production if staging fails.

## 2. Staging SQL smoke test

Run after staging migrations are applied. Run the structural preflight audit first, then the behavioral safety smoke test.

Preferred: paste and run `supabase/tests/05_release_preflight_audit.sql` in the Supabase SQL Editor using a privileged database role.

Alternative with `psql`:

```powershell
$env:DATABASE_URL = "<percent-encoded-staging-database-url>"
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\05_release_preflight_audit.sql
```

Required pass evidence:

- `profile-photos` bucket exists.
- `verification-docs` bucket exists and is not public.
- `verification-docs` has storage policy coverage.
- launch-critical RPCs exist.
- launch-critical tables have RLS enabled.
- `discoverable_profiles` exists and references `profile_visible`.

Expected final line:

```text
PASS: release preflight audit completed; transaction will roll back
```

Preferred: paste and run `supabase/tests/04_safety_smoke_test.sql` in the Supabase SQL Editor using a privileged database role.

Alternative with `psql`:

```powershell
$env:DATABASE_URL = "<percent-encoded-staging-database-url>"
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\04_safety_smoke_test.sql
```

Required pass evidence:

- report RPC behavior passes
- block persistence passes
- unmatch behavior passes
- direct match-forging rejection passes
- direct message-update rejection passes
- direct `get_or_create_conversation` execution rejection passes
- empty-conversation inbox hiding passes
- unmatched-chat rejection passes
- blocked-chat enforcement passes
- discovery filtering after block passes
- account deletion request RPC and direct-write rejection pass
- privacy settings RPC, direct-write rejection, and hidden-profile discovery filtering pass
- notification preferences RPC, direct-write rejection, and push-disabled child flag clearing pass
- read receipt privacy passes: unread counts clear while message status/read_at stay hidden when disabled

Expected final line:

```text
PASS: production hardening report/block/unmatch/messaging/privacy discovery safety smoke test completed; transaction will roll back
```

## 3. OCR Edge Function staging deploy

Run from `PM_App`.

PowerShell:

```powershell
$env:PROJECT_REF = "<staging-project-ref>"
$env:OCR_SPACE_API_KEY = "<provider-key>"

npx -y supabase@latest secrets set OCR_SPACE_API_KEY="$env:OCR_SPACE_API_KEY" --project-ref $env:PROJECT_REF
npx -y supabase@latest secrets list --project-ref $env:PROJECT_REF
npx -y supabase@latest functions deploy ocr --project-ref $env:PROJECT_REF --use-api
```

Important:

- Do not deploy with `--no-verify-jwt`.
- `supabase/config.toml` must keep `[functions.ocr] verify_jwt = true`.
- The deployed function must call `claim_ocr_attempt` before provider calls.
- If `EXPO_PUBLIC_OCR_ENDPOINT` points to a custom backend instead of the bundled Supabase function, that backend must validate `Authorization: Bearer <Supabase access token>` before processing ID images.
- Do not paste secret values into release notes. Record only presence, environment, and owner.

## 4. OCR staging checks

Set:

```powershell
$env:PROJECT_REF = "<staging-project-ref>"
$env:FUNCTION_URL = "https://$env:PROJECT_REF.functions.supabase.co/ocr"
$env:ACCESS_TOKEN = "<signed-in-user-access-token>"
$env:ANON_KEY = "<staging-anon-or-publishable-key>"
$env:VALID_DOC = "C:\path\to\valid-test-document.jpg"
$env:INVALID_DOC = "C:\path\to\invalid-or-blank-image.jpg"
```

Unauthenticated request must fail:

```powershell
curl.exe -i -X POST $env:FUNCTION_URL -F "document=@$env:VALID_DOC"
```

Expected: `401` with a client-safe sign-in error.

Valid authenticated request must pass:

```powershell
curl.exe -i -X POST $env:FUNCTION_URL `
  -H "Authorization: Bearer $env:ACCESS_TOKEN" `
  -H "apikey: $env:ANON_KEY" `
  -F "document=@$env:VALID_DOC"
```

Expected:

- HTTP `200`
- JSON has `result.fullText`
- extracted names/date are recorded if available

Invalid authenticated request must fail safely:

```powershell
curl.exe -i -X POST $env:FUNCTION_URL `
  -H "Authorization: Bearer $env:ACCESS_TOKEN" `
  -H "apikey: $env:ANON_KEY" `
  -F "document=@$env:INVALID_DOC"
```

Expected:

- non-2xx response
- no provider internals or secret values in client-visible output
- user-recoverable message

## 5. PM_App native QA gate

Run on at least one iOS or Android emulator/device before launch.

Use `docs\testing\NATIVE_QA_SCRIPT.md` as the execution script and evidence template.

Required flows:

- sign up
- sign in
- auth gate redirects unauthenticated users away from main tabs
- basic profile setup
- manual location setup
- current-location permission accept
- current-location permission deny
- auth session restore after cold app restart
- auth session clears after sign-out
- photo upload
- verification upload with OCR success
- verification upload with OCR failure
- discovery empty/loading/error states
- like
- pass
- mutual match
- open conversation only after mutual match
- send text message
- send image message
- mark conversation read
- report user
- block user
- blocked user disappears from discovery/conversation access
- unmatch user
- voice/video unavailable states are honest and do not simulate calls

Required evidence:

- device type and OS
- build command or Expo run command
- pass/fail notes per flow
- screenshots or short clips for critical flows

## 6. PM_Web launch page gate

Run from `PM_Web`.

```powershell
npm run lint
npm run check:dependency-audit
npm run build
npm run check:release-local
npm run dev -- --host 127.0.0.1
```

Browser checks:

- desktop page has no console errors/warnings
- mobile viewport has no horizontal overflow
- hero, trust, safety, membership, FAQ, waitlist, footer sections are reachable
- CTAs point only to approved support/waitlist destinations
- no fake app-store links
- no fake active-user counts
- no fake billing/checkout claims
- no fake AI accuracy or verification guarantees
- verification selfie/document evidence stores durable private Supabase Storage paths, not device-local file URIs
- OCR repeated-attempt behavior returns a recoverable rate-limit message
- basic info saves through `save_basic_info` instead of direct account-type/gender updates
- privacy controls load/save through `get_privacy_settings` and `save_privacy_settings`, and toggles stay locked behind retry if saved settings cannot load
- account deletion submits through `request_account_deletion` instead of manual-only support instructions

## 7. Production promotion

Only after staging is signed off:

```powershell
$env:PROJECT_REF = "<production-project-ref>"

npx -y supabase@latest link --project-ref $env:PROJECT_REF
npx -y supabase@latest db push --dry-run --linked
npx -y supabase@latest db push --linked
npx -y supabase@latest secrets set OCR_SPACE_API_KEY="<provider-key>" --project-ref $env:PROJECT_REF
npx -y supabase@latest secrets list --project-ref $env:PROJECT_REF
npx -y supabase@latest functions deploy ocr --project-ref $env:PROJECT_REF --use-api
```

Then rerun:

- SQL smoke test
- OCR 401 check
- OCR valid document check
- OCR invalid document check
- PM_App native QA smoke
- PM_Web production URL smoke

## 8. Final sign-off fields

| Gate                               | Owner | Date | Evidence link/path                  | Decision |
| ---------------------------------- | ----- | ---- | ----------------------------------- | -------- |
| Staging migration dry run          |       |      |                                     |          |
| Staging migration applied          |       |      |                                     |          |
| Staging SQL smoke test             |       |      |                                     |          |
| Staging release preflight audit    |       |      |                                     |          |
| Staging OCR deploy                 |       |      |                                     |          |
| Staging OCR valid/invalid checks   |       |      |                                     |          |
| PM_App native QA                   |       |      |                                     |          |
| PM_Web local/browser QA            |       |      |                                     |          |
| Production migration dry run       |       |      |                                     |          |
| Production migration applied       |       |      |                                     |          |
| Production SQL smoke test          |       |      |                                     |          |
| Production release preflight audit |       |      |                                     |          |
| Staging waitlist Edge Function proof |       |      |                                     |          |
| Production waitlist Edge Function proof |       |      |                                     |          |
| Production OCR deploy/checks       |       |      |                                     |          |
| Production launch URL QA           |       |      |                                     |          |
| Support inbox and escalation       |       |      |                                     |          |
| Safety moderation runbook reviewed |       |      | `docs\operations\SAFETY_MODERATION_RUNBOOK.md` |          |

## References

- Supabase CLI reference: https://supabase.com/docs/reference/cli/introduction
- Supabase Edge Function configuration: https://supabase.com/docs/guides/functions/function-configuration
- Supabase Edge Function auth: https://supabase.com/docs/guides/functions/auth
