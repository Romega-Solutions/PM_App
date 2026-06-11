# Backend waitlist interest capture

Date: 2026-06-11
Owner: Codex

## Scope

This source-only update adds a backend contract for PinayMate launch-interest capture.

## What changed

- Added `supabase/migrations/20260611125000_add_waitlist_interest_capture.sql`.
- Added a minimal `waitlist_signups` table for email, platform, source, status, and timestamps.
- Added idempotent column/default/not-null hardening for partially existing waitlist tables.
- Added duplicate-write throttling fields and RPC behavior for same email/platform submissions.
- Added a constrained `submit_waitlist_signup` RPC.
- Kept direct table access revoked from `PUBLIC`, `anon`, and `authenticated`.
- Added preflight audit checks for `submit_waitlist_signup`, `waitlist_signups` RLS, and direct table-access denial.
- Added static-contract markers and release/operator documentation.

## Launch boundary

This does not make PM_Web backend waitlist capture live by itself. PM_Web can continue using launch-interest email until the release owner applies the full migration set through `20260611140000_add_waitlist_edge_abuse_control.sql`, deploys `waitlist-signup`, proves direct RPC denial, proves edge-attempt throttling, approves the public abuse-control posture, and captures production evidence.

## Validation status

Not run. This is source evidence only.

Required proof before public backend waitlist capture:

- Apply the migration in staging and production.
- Run release preflight and static Supabase checks.
- Prove `anon` and `authenticated` cannot read or write `waitlist_signups` directly.
- Prove `submit_waitlist_signup` accepts valid minimal email/platform input and rejects malformed email.
- Decide and document abuse protection, rate limiting, or CAPTCHA posture before routing public PM_Web traffic to the RPC. See `docs/WAITLIST_ABUSE_RATE_LIMIT_DECISION.md`.
