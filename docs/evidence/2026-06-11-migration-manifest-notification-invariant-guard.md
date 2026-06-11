# Migration Manifest Notification Invariant Guard

Date: 2026-06-11
Owner: Codex
Result: Source guard added, checks not rerun

## What changed

- Updated `scripts/check-supabase-migration-manifest.mjs` so the launch migration manifest must document the notification preferences invariant.
- The manifest contract now requires markers for:
  - idempotent column/default/not-null hardening
  - `user_notification_preferences_push_children_check`
  - `save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE)`
  - child flags being cleared when push is disabled

## Why it matters

The notification preferences migration is more than an ordered file. It protects a backend invariant: when push notifications are disabled, child push categories cannot remain enabled. The migration manifest now has to preserve that release requirement.

## Verification status

No validation commands were run after this source change.

Required reruns before launch approval:

- `npm run check:migration-manifest` from `PM_App`
- `npm run check:supabase-static-contract` from `PM_App`
- Supabase staging migration apply
- `supabase/tests/05_release_preflight_audit.sql`
- `supabase/tests/04_safety_smoke_test.sql`
