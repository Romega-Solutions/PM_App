# Notification Preferences Static Contract Expansion

Date: 2026-06-11
Owner: Codex
Result: Source guard added, checks not rerun

## What changed

- Updated `scripts/check-supabase-static-contract.mjs` so the notification preferences check now requires:
  - idempotent `ADD COLUMN IF NOT EXISTS` repair markers
  - null backfill/default/not-null enforcement markers
  - `user_notification_preferences_push_children_check`
  - RPC-side push-disabled child-flag clearing logic
  - release preflight coverage for the child-flag constraint
  - smoke SQL coverage for `save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE)`

## Why it matters

Notification settings are backend-backed source controls, but provider delivery is not yet proven. This static guard protects the backend invariant that child push preferences cannot remain enabled when push itself is disabled.

## Verification status

No validation commands were run after this source change.

Required reruns before launch approval:

- `npm run check:supabase-static-contract` from `PM_App`
- `npm run check:migration-manifest` from `PM_App`
- Supabase staging migration apply
- `supabase/tests/05_release_preflight_audit.sql`
- `supabase/tests/04_safety_smoke_test.sql`
