# Pinaymate Release Readiness (Docs Evidence, 2026-06-10)

**Document scope:** mobile launch + website messaging readiness, Supabase readiness, OCR, and release-blocker tracking.
**Status governance:** This is a release-control document; do not claim launch-ready in external comms until all `Blocked` items are cleared and owner/date sign-off is recorded below.
**Execution checklist:** use `docs/LAUNCH_SIGNOFF_CHECKLIST.md` for the exact staging, production, OCR, native QA, and PM_Web evidence gates.
**Safety operations:** use `docs/SAFETY_MODERATION_RUNBOOK.md` for report triage, verification review, block/unmatch escalation, and support response rules.
**Native QA script:** use `docs/NATIVE_QA_SCRIPT.md` for device/emulator execution and pass/fail evidence capture.
**Ownership gate:** use `docs/PRODUCTION_OWNERSHIP_CHECKLIST.md` to confirm Romega-owned production accounts and owner backups.
**Evidence packet:** use `docs/LAUNCH_EVIDENCE_PACKET.md` as the final launch proof pack.
**Launch-state source of truth:** use `docs/PINAYMATE_LAUNCH_STATE_MATRIX.md` to keep PM_Web, PM_App, Supabase, OCR, notification, support, legal, and safety claims aligned.

**Last reviewed:** 2026-06-11
**Reviewer note:** This file was refreshed to reflect current implemented-vs-verified status after recent product/security updates. Live environment checks still remain to be completed.

## Scope

- Mobile launch readiness for PM_App
- PM_Web release posture for marketing/site presentation
- Supabase migration and policy readiness
- OCR endpoint readiness and verification behavior
- QA coverage and dependency/ops readiness

### Local Docker / Supabase limitation note

- This repo currently does not include a committed local Docker compose or equivalent local Supabase runtime for Edge Function end-to-end execution.
- Local checks can prove migration/smoke SQL behavior, but OCR extraction success/error handling must be validated against a live deployed function endpoint with `OCR_SPACE_API_KEY` configured in Supabase secrets.

## Release Proof Rule

Every launch-ready claim must have owner, date, environment, command/source, and evidence path recorded in `docs/LAUNCH_EVIDENCE_PACKET.md`. A blank evidence field means the gate is still blocked, even if the implementation exists in code.

Every customer-facing claim must also match `docs/PINAYMATE_LAUNCH_STATE_MATRIX.md`. If the matrix says a feature is waitlist-only, gated, source-only, or blocked pending proof, PM_Web and PM_App copy must not imply that the feature is live.

### Source-complete lanes introduced by June 2026 hardening

The following controls are implemented in source and are not yet runtime-verified on this checkout:

- Waitlist capture now routes through `waitlist-signup`, with origin allowlist/honeypot/abuse-control in source and `submit_waitlist_signup` kept service-role-only.
- `get_or_create_conversation` is restricted to internal paths; the inbox list hides rows with `last_message_id IS NULL`.
- Mobile chat creation flow is now first-send centered to avoid empty conversation rows and improve message integrity.
- OCR now expects deployed function + JWT + secret-side provider integration before trust claims can be made.

Management implication:

- Keep product claims at waitlist-stage / gated behavior until staging+production function and DB proofs are attached.
- Live evidence remains required for every lane above before those controls can be called "launch-ready."

Minimum unblock commands:

- `supabase db push --dry-run --linked` then `supabase db push --linked` (staging then production).
- `npx supabase secrets list` + `supabase functions deploy waitlist-signup` + repeated `/functions/v1/waitlist-signup` probes (origin, duplicate, blocked, malformed).
- `npx supabase functions deploy ocr` + unauthenticated and authenticated `/functions/v1/ocr` probes (valid/invalid/rate-limit).
- `supabase/tests/04_safety_smoke_test.sql` proof for direct `get_or_create_conversation` denial + empty-conversation filtering + blocked/unmatched-chat behavior.
- `docs/NATIVE_QA_SCRIPT.md` evidence for first-send conversation creation and image-upload gating.

| Gate                         | Required proof before green                                                                  | Current decision                 |
| ---------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| PM_App local code quality    | tests, typecheck, lint, and web export output                                                | Needs rerun after latest source/script changes; older local passes are historical until recaptured |
| PM_App native experience     | device/emulator QA evidence for auth, onboarding, location, verification, matching, safety   | Blocked until native QA evidence |
| Auth and email redirects     | signed-build signup, resend verification, password reset, cold-start, expired-link evidence  | Blocked until live auth proof    |
| Supabase security            | staged and production migration history, advisors, and safety smoke SQL output               | Blocked until target DB proof    |
| OCR verification             | deployed function, JWT enforcement, secret presence, valid/invalid/rate-limit evidence       | Blocked until live OCR proof     |
| PM_Web launch page           | lint/build, desktop/mobile smoke, final domain, CTA/mailbox verification                     | Partially local; live proof open |
| Safety and moderation        | named report/review/escalation owners and two-account report/block/unmatch QA                | Blocked until ops signoff        |
| Production account ownership | Romega-owned Expo/EAS, app stores, Supabase, DNS, OCR, support/legal mailbox recovery access | Blocked until owner signoff      |

## Status (Manager-Action View)

### Done

- Auth gate paths are implemented:
  - `app/index.tsx` routes auth state to `(auth)` and `(main)`.
  - `app/(main)/_layout.tsx` blocks core tabs when unauthenticated.
- Location feature includes:
  - manual city selection and current-location path in `app/(auth)/account-setup/location.tsx`
  - foreground location request + reverse geocode + coordinate persistence in `useLocationSearch.ts`
- OCR service path is wired:
  - `src/services/ocrService.ts` reads `EXPO_PUBLIC_OCR_ENDPOINT`
  - if `EXPO_PUBLIC_OCR_ENDPOINT` is omitted, the app derives the bundled Supabase Edge Function URL from `EXPO_PUBLIC_SUPABASE_URL`
  - `src/features/account/hooks/useVerificationUpload.ts` uses extracted OCR data in identity checks
  - `supabase/functions/ocr` provides a deployable OCR proxy that keeps the provider key server-side
  - `claim_ocr_attempt` records a per-user quota claim before the function spends an OCR provider call
  - selfie capture no longer auto-verifies locally; successful OCR comparison submits verification for review instead of setting profile `is_verified`
- Security hardening migration files are available:
  - `supabase/migrations/04_production_security_hardening.sql` and `supabase/migrations/99_final_release_security_hardening.sql`
  - `supabase/migrations/20260610094806_add_pinaymate_storage_buckets.sql` defines `profile-photos` and private `verification-docs` storage buckets plus user-folder storage policies
  - `supabase/migrations/20260610100323_add_ocr_rate_limit.sql` defines OCR quota tracking and `claim_ocr_attempt`
  - `supabase/migrations/20260610100523_add_basic_info_rpc.sql` defines `save_basic_info` and removes direct client mutation of `gender`/`user_type`
  - `supabase/migrations/20260611120000_secure_send_message_rpc.sql` defines RPC-owned message creation
  - `supabase/migrations/20260611121000_harden_user_report_payload.sql` caps and normalizes report payloads
  - `supabase/migrations/20260611122000_fix_discovery_privacy_read_model.sql` finalizes hidden-profile and online-status enforcement for discovery
  - `supabase/migrations/20260611123000_add_notification_preferences.sql` defines backend-backed notification preferences and enforces push-disabled child flag clearing
  - `supabase/migrations/20260611124000_repair_profile_creation_trigger.sql` recreates the confirmed-auth-user to profile-row lifecycle trigger
  - `supabase/migrations/20260611125000_add_waitlist_interest_capture.sql` defines minimal backend-backed waitlist interest capture while direct table writes remain denied
  - `supabase/migrations/20260611130000_add_report_review_workflow.sql` defines service-role-only report review metadata and `review_user_report`
  - `supabase/migrations/20260611131000_add_verification_review_workflow.sql` defines service-role-only profile verification review metadata and `review_profile_verification`
  - `supabase/migrations/20260611132000_harden_report_abuse_and_discovery_read_model.sql` defines duplicate-report abuse controls and a sensitive-column guard for the privileged discovery read model
  - `supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql` requires `reviewer_id` in `review_user_report`, requires the reviewer to be active in `moderation_reviewers`, routes reviewer registry create/update/deactivation through service-role reviewer management RPCs with operator/reason capture, records reviewer registry changes in `moderation_reviewer_audit_log`, blocks finalized report decision overwrites, and adds source/platform waitlist burst control with matching bucket locking, public source restriction, and generic accepted responses
  - `supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql` moves public waitlist capture behind the `waitlist-signup` Edge Function, adds service-role-only edge-attempt throttling, and makes `submit_waitlist_signup` service-role-only for public launch
  - `supabase/migrations/20260611141000_restrict_conversation_creation_rpc.sql` keeps `get_or_create_conversation` private to `send_message` so clients cannot create empty visible conversations without sending a message
  - `supabase/migrations/20260611142000_hide_empty_conversations_from_inbox.sql` keeps `get_user_conversations` from returning empty conversations with no real last message
  - final least-privilege grants revoke older broad table permissions for profiles, likes, passes, conversations, and messages
  - profile insert/update grants are column-restricted so client-created profiles cannot set server-owned verification approval fields
  - account type and gender setup is RPC-owned after initial onboarding selection
  - discovery reads use a constrained app-facing view that can enforce privacy flags internally while exposing only approved profile-card fields
  - verification submission/clear flows are RPC-owned instead of direct client column updates
  - verification selfie/document evidence is uploaded to private Supabase Storage before durable storage paths are submitted for review
  - conversations and message sends are match-gated at the database layer, not only by client navigation
  - report submission and message state changes are RPC-owned instead of direct client table updates
  - message schema compatibility supports the current `text/type` app payload and the legacy `content/message_type` columns
- Chat safety and media hardening includes:
  - durable chat image storage paths with signed display URLs
  - safe conversation-card RPC for member display fields
  - backend-backed report, block, and unmatch paths for mobile safety flows
  - likes-to-chat navigation through the backend conversation RPC
- Privacy/account deletion readiness includes:
  - backend-backed `user_privacy_settings` controls for online status, approximate distance, read receipts, and discovery visibility
  - authenticated `get_privacy_settings` and `save_privacy_settings` RPCs
  - `discoverable_profiles` filtering that removes profiles with visibility turned off
  - read-receipt-aware message RPCs that clear unread counts without exposing sender-visible read status when read receipts are off
  - a backend-backed `account_deletion_requests` queue
  - an authenticated `request_account_deletion` RPC
  - a mobile privacy settings action that submits a pending support-review request instead of showing manual-only instructions
- The full ordered migration source of truth is `supabase/LAUNCH_MIGRATION_MANIFEST.md`; legacy `99_` and `999_` tail migrations must remain safe even if a filename-ordered runner applies them after timestamped launch migrations.
- Non-production repair/audit SQL has been moved to `supabase/manual-repair-scripts` so `supabase/migrations` stays focused on ordered deployable migrations.
- `supabase/config.toml` sets `functions.ocr.verify_jwt = true`; the OCR function also validates the caller session before contacting the OCR provider.
- Auth session persistence now uses `expo-secure-store` on native builds through `src/config/authStorage.ts`, with a web-compatible fallback for browser builds.

### Implemented source evidence, not current release verification

- Evidence in this repository confirms source implementation of the above features, but it is not current release verification after the latest source and script changes.
- `PM_App/README.md` and migration references are now aligned with this tracker.
- No live endpoint or production-environment verification is recorded in these docs.
- The following proof artifacts are in-repo evidence only; they are not production validation:
  - `app/index.tsx` auth gate routing
  - `app/(main)/_layout.tsx` unauthenticated route guard
  - `app/(auth)/account-setup/location.tsx` and `src/features/account/hooks/useLocationSearch.ts` location path
  - `src/services/ocrService.ts`, `src/features/account/hooks/useVerificationUpload.ts` OCR path
  - `src/services/__tests__/ocrService.test.ts`, `src/features/account/api/__tests__/verificationApi.test.ts`
  - `supabase/migrations/04_production_security_hardening.sql`, `supabase/migrations/99_final_release_security_hardening.sql`, `supabase/migrations/20260610094806_add_pinaymate_storage_buckets.sql`, `supabase/migrations/20260610100323_add_ocr_rate_limit.sql`, and `supabase/migrations/20260610100523_add_basic_info_rpc.sql`
  - `app/(modals)/report-user.tsx`, `src/features/safety/api/safetyApi.ts`
  - `src/features/safety/api/__tests__/safetyApi.test.ts`
  - `src/features/messaging/api/messages.api.ts`, `src/features/messaging/api/conversations.api.ts`, `src/features/matching/screens/LikesScreen.tsx`
  - `src/features/messaging/api/__tests__/messages.api.test.ts`
- Expo SDK 54 dependency compatibility is aligned:
  - `npx expo install --check` passes after updating the SDK-compatible native module versions.
  - PM_App lint, typecheck, and web export still pass after dependency alignment.
  - Safe transitive overrides for `brace-expansion@1.1.13` and `postcss@8.5.10` reduced PM_App audit findings without forcing an Expo SDK jump.

### Blocked

- Native runtime validation for location permission, denial handling, and coordinate persistence is pending.
- OCR Edge Function deployment, provider secret configuration, and real-document success/failure behavior remain unverified in production-like environments.
- Supabase migration execution and advisor checks for RLS/storage/chat policy behavior are pending, including the `profile-photos`, private `verification-docs`, OCR quota, basic-info RPC, report abuse controls, active reviewer registry, reviewer management RPCs, reviewer registry audit logging with operator/reason, finalized report decision protection, review identity requirements, waitlist Edge Function attempt throttling, service-role-only waitlist RPC boundary, private conversation creation helper boundary, empty-conversation inbox hiding, public source restriction, generic waitlist response behavior, discovery read-model guards, and profile verification review policies.
- End-to-end release QA for sign-up → onboarding → matching → chat remains pending across app build environments.
- Backend-backed report/block/unmatch and match-forging protections remain pending live Supabase migration execution and QA.
- Backend-backed privacy settings and read-receipt behavior remain pending live Supabase migration execution and native QA.
- Backend-backed account deletion requests remain pending live Supabase migration execution and native QA.
- PM_App dependency audit remains blocked by Expo-chain moderate advisories rooted in `uuid -> xcode -> @expo/config-plugins`; clearing the remaining 16 moderate findings requires a dedicated Expo upgrade path rather than release-branch `npm audit fix --force`.
- Local Docker/Supabase boundary remains a blocker: OCR behavior that depends on Edge Function secrets cannot be treated as green from local-only runs.

### Next

- **Mobile App**
  - Complete the owner/date evidence fields in `docs/LAUNCH_SIGNOFF_CHECKLIST.md`.
  - Build on device/emulator and complete `docs/NATIVE_QA_SCRIPT.md`.
  - Confirm auth gate behavior after cold-start and session expiry.
  - Confirm native auth session persistence survives app restart and clears on sign-out.
- **Web**
  - Validate PM_Web landing links and CTAs for app download/support.
  - Verify production build and static hosting behavior before launch comms.
- **Backend / Supabase**
  - Apply the full ordered migration set in staging/local first, then production, ending with `20260611142000_hide_empty_conversations_from_inbox.sql`. Use `supabase/LAUNCH_MIGRATION_MANIFEST.md` as the source of truth instead of manually copying the migration list into this readiness note.
  - Record table/column/function checks, storage-policy checks, and advisor outputs.
  - Run `supabase/tests/04_safety_smoke_test.sql` after applying the full ordered migration set to validate report RPC behavior, block persistence, unmatch behavior, storage bucket/policy presence, OCR quota controls, basic-info RPC controls, privacy settings RPC controls, notification preference RPC controls, push-disabled child flag clearing, hidden-profile discovery filtering, read-receipt privacy behavior, account deletion request controls, direct match-forging rejection, direct message-update rejection, direct conversation-helper execution rejection, empty-conversation inbox hiding, unmatched-chat rejection, discovery filtering, and blocked-chat enforcement.
- **OCR**
  - Deploy `supabase/functions/ocr` and configure `OCR_SPACE_API_KEY` as a Supabase secret.
  - Record deployment evidence (`npx supabase functions deploy ocr`) and secret confirmation (`npx supabase secrets list`) before production claims.
  - Optionally set `EXPO_PUBLIC_OCR_ENDPOINT`; otherwise confirm the derived Supabase Functions URL is correct.
  - Run valid/invalid image checks and document error-handling behavior.
- **QA**
  - Complete release sign-off checklist owner/date fields for each blocker.
  - Fill `docs/LAUNCH_EVIDENCE_PACKET.md` with staging, production, OCR, native, and PM_Web proof.
  - Complete `docs/PRODUCTION_OWNERSHIP_CHECKLIST.md` before any public launch claim.
  - Assign report, verification, support inbox, and critical escalation owners in `docs/SAFETY_MODERATION_RUNBOOK.md`.
- **Dependencies**
  - Confirm app env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` (and optionally `EXPO_PUBLIC_OCR_ENDPOINT`, otherwise derivation from `EXPO_PUBLIC_SUPABASE_URL` is used).
  - Confirm native/runtime deps and `app.json` permission copy for location, camera, and photo-library access are present in release builds.
  - Keep `npm run check:dependency-audit` passing before release-local output is treated as releasable evidence.
  - Keep `npx expo install --check` passing before each release candidate.
  - Plan and test a dedicated Expo upgrade branch before running any force audit fix that changes Expo major/minor runtime dependencies.

## Evidence Summary (from repo docs, no new runtime claims)

- `app/(auth)/account-setup/location.tsx`
- `src/features/account/hooks/useLocationSearch.ts`
- `app/index.tsx`
- `app/(main)/_layout.tsx`
- `src/config/deepLinking.ts`
- `src/services/ocrService.ts`
- `src/features/account/hooks/useVerificationUpload.ts`
- Full ordered migration set in `supabase/LAUNCH_MIGRATION_MANIFEST.md`
- `supabase/functions/ocr/README.md` and `supabase/functions/ocr/index.ts` (secret dependency + deployment behavior)
- `app/(modals)/report-user.tsx`
- `src/features/safety/api/safetyApi.ts`
- `src/features/messaging/api/messages.api.ts`
- `src/features/messaging/api/conversations.api.ts`
- `src/features/matching/screens/LikesScreen.tsx`
- `supabase/tests/04_safety_smoke_test.sql`

## Suggested verification commands (repo evidence + live checks)

### Offline-safe repository evidence checks

- `rg -n "EXPO_PUBLIC_OCR_ENDPOINT|Use Current Location|extractTextFromImage|04_production_security_hardening|discoverable_profiles" PM_App`
- `rg -n "app/index.tsx|app/\\(main\\)/_layout.tsx|ocrService.ts|useVerificationUpload|useLocationSearch|04_production_security_hardening.sql|safetyApi.ts|messages.api.ts" PM_App`
- `npm test -- src/services/__tests__/ocrService.test.ts src/features/account/api/__tests__/verificationApi.test.ts --runInBand` from `PM_App`
- `npm test -- src/features/matching/api/__tests__/matchingApi.test.ts --runInBand` from `PM_App`
- `npm test -- src/features/safety/api/__tests__/safetyApi.test.ts --runInBand` from `PM_App`
- `npm test -- src/features/messaging/api/__tests__/messages.api.test.ts --runInBand` from `PM_App`
- `npm run check:local-quality` from `PM_App`
- `npm run check:release-local` from `PM_App`
- `rg -n "src/main.tsx|Download|CTA|pinaymate" PM_Web`
- `npm run check:local-quality` from `PM_Web`
- `npm run check:release-local` from `PM_Web`

### Live/blocked validation commands (must run against live/target environments)

- `supabase db diff` and `supabase db push` (staging first, then production): confirm the full ordered migration set through `20260611142000_hide_empty_conversations_from_inbox.sql` is applied.
- `npx supabase secrets list` (target project): confirm `OCR_SPACE_API_KEY` is present and only accessible in intended scope.
- In Supabase SQL editor, run `supabase/tests/04_safety_smoke_test.sql` and record pass/fail output for:
  - report write/read behavior
  - block and unmatch persistence
  - direct `likes.is_match` update rejection
  - blocked-chat enforcement
  - discovery filter behavior
- Mobile QA smoke checks (device/emulator):
  - onboarding → auth gate → location capture (manual + current-location path)
  - matches/safety actions (report, block, unmatch)
  - chat text/image send/receive behavior
  - OCR valid/invalid image path against `EXPO_PUBLIC_OCR_ENDPOINT`
- Web QA smoke checks:
  - `npm run build` and `npm run lint` from `PM_Web`
  - validate marketing landing CTAs and links are accurate to current release destinations
- Dependency/security checks:
  - `npm audit --audit-level=moderate` from `PM_App`
  - `npm audit --audit-level=moderate` from `PM_Web`
  - If PM_App still reports the `uuid -> xcode -> @expo/config-plugins` Expo-chain advisories, open a dedicated Expo upgrade task instead of using `npm audit fix --force` directly on the release branch.

### Blocked item evidence table

| Owner         | Blocker                                                                      | Required evidence                                                                | Status  |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------- |
| PM_App        | Location runtime permissions and coordinate persistence                      | emulator/device logs + pass scenario + denial scenario                           | Blocked |
| PM_App        | OCR Edge Function deployment and document extraction resilience              | function deploy logs + provider-secret check + valid/invalid document assertions | Blocked |
| PM_App        | Supabase migrations 04, 99, storage, OCR quota, and basic-info RPC execution | migration plan + SQL checks + smoke test outputs                                 | Blocked |
| PM_App        | Expo-chain dependency audit advisories                                       | dedicated Expo upgrade branch + lint/typecheck/build/native smoke evidence       | Blocked |
| PM_App/PM_Web | Launch comms correctness (CTAs and deep links)                               | post-build verification notes                                                    | Blocked |
| PM_App/PM_Web | Production ownership and launch evidence packet                              | completed ownership checklist + filled launch evidence packet                    | Blocked |
