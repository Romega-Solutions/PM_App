# Backend-Backed Notification Preferences

Date: 2026-06-11
Status: Source contract only - live Supabase applied state not proven here

## Source Evidence

- `supabase/migrations/20260611123000_add_notification_preferences.sql` defines `public.user_notification_preferences`, enables RLS, denies direct authenticated inserts/updates/deletes, and grants authenticated access through `get_notification_preferences` and `save_notification_preferences`.
- The migration enforces the push-parent invariant with `user_notification_preferences_push_children_check`, so `new_matches`, `new_messages`, and `new_likes` cannot remain enabled when `push_enabled` is false.
- `src/features/account/api/notificationSettingsApi.ts` uses the notification preference RPCs instead of direct table writes.
- `src/features/account/api/__tests__/notificationSettingsApi.test.ts` covers the RPC names and camelCase-to-snake_case parameter mapping.
- `app/(main)/profile-settings/notifications.tsx` is wired to load and save backend-backed preferences while keeping launch-stage delivery copy honest.
- `supabase/LAUNCH_MIGRATION_MANIFEST.md` includes the notification preference migration in the launch order.
- `supabase/tests/05_release_preflight_audit.sql` checks for the notification preference table, RLS, RPCs, and `user_notification_preferences_push_children_check`.
- `supabase/tests/04_safety_smoke_test.sql` checks that direct writes are denied, RPC save/load persists the expected launch preferences, and `save_notification_preferences(FALSE, TRUE, TRUE, TRUE, TRUE)` clears push-dependent child flags.
- `scripts/check-launch-file-contract.mjs` requires the migration invariant, API mapping test, and smoke SQL child-flag clearing case as source-contract markers.
- `docs\operations\SUPABASE_RELEASE_OPERATOR_CHECKLIST.md` tells the backend/release operator to capture notification preference preflight proof, smoke proof, and matrix-based backend feature proof before launch-ready backend claims.
- `scripts/check-supabase-static-contract.mjs` now requires the idempotent repair, constraint, preflight, and smoke-test markers for the notification preference invariant.

## Not Proven By This Evidence

- The migration has not been proven applied to staging or production in this note.
- Push provider delivery, email delivery, and device notification behavior remain outside this source-contract evidence.
