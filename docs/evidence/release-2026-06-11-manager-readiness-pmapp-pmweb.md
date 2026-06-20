# PinayMate Readiness Report (PM_App + PM_Web) — 2026-06-11

**Status: Not launch-ready**

This is a manager-facing readiness summary based on repository evidence only. It separates what is currently complete in source from what still requires external proof.

## What is done (source posture)

### Product and release-control foundation
- The team has implemented a guarded launch state for both products, with clear paths for waitlist/support messaging and feature exposure control.
- Core PM_App product controls exist for onboarding, location setup, matching/safety messaging behaviors, privacy/account settings, and report/block-style moderation flows.
- PM_Web has release-safe messaging patterns and claim-control checks to prevent over-promising features before proof.

### Security and backend controls
- PM_App and PM_Web have documented migration/runbook artifacts for staged rollout, security posture, moderation, and launch evidence collection.
- PM_App includes an OCR path through edge functions using authenticated request flow and secret handling patterns.
- A centralized risk register and launch matrix are already in place to track critical/high items and owners.

### Product-readiness discipline
- Guardrails exist for copy quality, claim validation, and launch ownership handoff.
- Delivery documents define how evidence should be packaged for sign-off.

### Hardening update (this checkpoint)

- Waitlist capture now routes through `waitlist-signup` with source-level abuse controls, honeypot handling, and service-role/private RPC behavior.
- Direct empty-conversation creation is restricted by migration hardening; inbox filtering now excludes rows with no last message.
- Messaging path now creates conversation state on first successful send to avoid pre-created empty chats.
- `PM_App` chat and report safety flows are source-review complete, but runtime proof for direct helper denial, blocking, and message sequencing is still pending.

**Source-complete vs live-verified status for launch decisions**

| Area | Source-complete | Runtime-verified | Remaining proof gap |
| ---- | --------------- | ---------------- | ------------------ |
| Waitlist abuse control | ✅ | ⛔ | Staging/prod waitlist function deploy + repeated-request + direct-RPC denial evidence |
| Conversation helper boundary | ✅ | ⛔ | `04_safety_smoke_test.sql` direct helper rejection and empty-conversation assertions |
| First-send conversation behavior | ✅ | ⛔ | Native QA trace for first-text send then image upload |
| OCR proxy + secret scope | ✅ | ⛔ | Function deploy, 401 check, valid/invalid/rate-limit probes |

Recommended operator commands for this release packet:

- `supabase db push --dry-run --linked` → `supabase db push --linked` (staging then production)
- `supabase tests` using `supabase/tests/04_safety_smoke_test.sql` and `supabase/tests/05_release_preflight_audit.sql`
- `supabase functions deploy waitlist-signup` and `supabase functions deploy ocr`
- `docs\testing\NATIVE_QA_SCRIPT.md` pass/fail evidence capture

## What remains (must be proven for launch)

### PM_App (mobile product)
- Missing live proof of end-to-end behavior on devices (iOS/Android) for:
  - login/session
  - location permissions
  - matching and discovery
  - likes/chat flow
  - report/block/unmatch actions
- Without this evidence, launch readiness is still a source-state estimate, not an operational certification.

### PM_Web (web product)
- Missing production-level proof for final domain/URL behavior.
- Missing current smoke checks across desktop/mobile for key CTAs, support routing, and waitlist flows.
- Missing mailbox/replying proof for support/legal contact paths.

### Backend and operations
- Migration scripts exist, but there is no verified record in this review that staging/prod rollout has been executed.
- Storage/security policy checks and safety smoke queries have not been attached as verified evidence here.
- OCR secret/config health has not been confirmed in this source-only review.

### Governance and ownership
- `.env` hygiene blocker remains open and affects launch confidence.
- Safety and production ownership signoffs (primary/secondary owners, escalation path, and SLA expectations) are not fully completed.

## Main risks if launch proceeds now

1. **User trust risk**: unproven auth/location/chat/moderation behavior on real devices could fail unexpectedly.
2. **Compliance and moderation risk**: safety routes are documented but unvalidated live flow could cause delayed incident response.
3. **Operational risk**: backend migrations and policy gaps could diverge from documented assumptions after deployment.
4. **Governance risk**: unresolved ownership and key-management hygiene increases post-launch incident response time.

## Business value and manager takeaway

- If completed, this readiness track enables a controlled release of a moderated, privacy-aware social matching workflow with lower exposure risk than a broad unrestricted launch.
- The current score is **not “good-to-launch”**, but it is **good-to-run-to-launch**: architecture and controls are in place, and remaining work is mostly evidence and environment validation.
- The highest-value next action is not more code, but closing proof gaps that convert assumptions into verifiable launch readiness.

## Immediate management actions (next 5 working steps)

1. Clear `.env` hygiene blocker and document approval.
2. Re-run PM_App and PM_Web local checksets on current HEAD and attach evidence index.
3. Execute and capture staged backend verification (migrations, policy checks, smoke tests, OCR checks).
4. Complete native QA evidence packet with build/version-tagged results.
5. Finalize ownership and escalation signoffs (production, safety, support/legal), then move risks from “blocked” to “go/no-go” posture.

## Decision

Current state is **ready in design and control intent, but not ready for external release**. The blocking condition is live evidence, not missing product implementation.
