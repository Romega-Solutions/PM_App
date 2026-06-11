# Waitlist abuse/rate-limit decision

Date: 2026-06-11
Owner: Codex

## Scope

This source-only update adds proof requirements before the backend waitlist RPC can receive public PM_Web traffic.

## What changed

- Added `docs/WAITLIST_ABUSE_RATE_LIMIT_DECISION.md`.
- Added rollback-only waitlist smoke coverage to `supabase/tests/04_safety_smoke_test.sql`.
- Expanded `scripts/check-supabase-static-contract.mjs` to require waitlist smoke markers.
- Added the waitlist abuse/rate-limit decision to `scripts/check-launch-file-contract.mjs`.

## Smoke coverage added

- `waitlist_signups` table exists.
- `submit_waitlist_signup(text, text, text)` exists.
- `anon` and `authenticated` cannot directly select, insert, or update `waitlist_signups`.
- Valid waitlist email/platform submission returns a normalized row.
- Duplicate email/platform submission reuses the existing row.
- Duplicate email/platform submission inside the cooldown window does not rewrite the row.
- Blocked waitlist rows are not refreshed by duplicate public submissions.
- Malformed email is rejected.

## Launch boundary

The public PM_Web path remains email capture until staging and production evidence prove the waitlist RPC and a public abuse-control layer is chosen.

## Validation status

Not run. This is source evidence only.
