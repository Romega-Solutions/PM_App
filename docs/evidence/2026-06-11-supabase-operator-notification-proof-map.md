# Supabase Operator Notification Proof Map

Date: 2026-06-11
Owner: Codex
Result: Source docs updated, checks not rerun

## What changed

- Updated `docs\operations\SUPABASE_RELEASE_OPERATOR_CHECKLIST.md` so backend signoff must use `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md`.
- Added explicit operator proof expectations for `20260611123000_add_notification_preferences.sql`.
- Added backend feature proof-map review after preflight and smoke tests.
- Updated `supabase/LAUNCH_MIGRATION_MANIFEST.md` so the notification migration purpose includes idempotent repair, default/not-null hardening, `user_notification_preferences_push_children_check`, and smoke/preflight proof expectations.
- Updated the notification preference evidence note to point to operator proof capture and the expanded static contract.

## Why it matters

The notification preferences backend can be source-complete without being production-ready. The operator checklist now tells the release owner exactly what live evidence is required before claiming notification settings are launch-ready.

## Verification status

No validation commands were run after this change.

Required reruns before launch approval:

- `npm run check:supabase-static-contract` from `PM_App`
- `npm run check:migration-manifest` from `PM_App`
- `npm run check:launch-file-contract` from `PM_App`
- Supabase staging migration apply
- `supabase/tests/05_release_preflight_audit.sql`
- `supabase/tests/04_safety_smoke_test.sql`
