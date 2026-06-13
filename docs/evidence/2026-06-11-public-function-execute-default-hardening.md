# PM_App public function execute default hardening

Date: 2026-06-11
Owner: Codex
Status: Source migration and release audit updated, not applied

## What changed

- Created the migration through `npx supabase migration new`, then renamed it to `supabase/migrations/20260611143000_restrict_public_function_execute_defaults.sql` so it sorts after the existing timestamped launch migrations.
- Added SQL to revoke inherited `PUBLIC` and `anon` execute privileges from existing public-schema functions.
- Added SQL to revoke future default public-schema function execution for `PUBLIC` and `anon`.
- Updated `supabase/tests/05_release_preflight_audit.sql` to fail if any public `SECURITY DEFINER` function remains executable by `anon`, including through inherited `PUBLIC` grants.
- Updated `supabase/tests/04_safety_smoke_test.sql` with the same anonymous/public execute drift guard for runtime smoke proof.
- Updated `supabase/LAUNCH_MIGRATION_MANIFEST.md` so the migration is part of the launch sequence and proof checklist.
- Corrected the manifest sequence so `20260611143000_restrict_public_function_execute_defaults.sql` appears after `20260611142000_hide_empty_conversations_from_inbox.sql`, matching filename-runner order.
- Documented the ordering safety case: the migration is timestamped after the other timestamped launch migrations and remains safe after earlier launch migrations because it revokes existing public function execute grants and also updates future function defaults for the migration role.
- Updated `scripts/check-supabase-static-contract.mjs` so the migration, audit, and manifest markers stay linked.

## Why this matters

PinayMate relies on privileged RPCs for messaging, safety, verification, account settings, and waitlist capture. Function execution should be explicit for `authenticated` or `service_role`, not inherited from public defaults.

## Verification

- Local `supabase` binary was not available.
- `npx supabase --version` returned `2.105.0`.
- Migration file was created through `npx supabase migration new restrict_public_function_execute_defaults`, then renamed in source to avoid out-of-order migration history problems.
- Migration was not applied to staging or production.
- Static contract, SQL audit, and safety smoke test were not run this turn.
