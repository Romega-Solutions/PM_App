# Migration Manifest Contract

Date: 2026-06-11
Owner: Codex
Result: Source patch only - not run

## What changed

- Added `scripts/check-supabase-migration-manifest.mjs`.
- Added `npm run check:migration-manifest`.
- Wired the manifest check into `npm run check:source-contracts`.
- The guard checks that `supabase/LAUNCH_MIGRATION_MANIFEST.md` lists the exact expected launch migration order.
- The guard checks that each listed migration file exists under `supabase/migrations`.
- The guard checks that the manifest still requires `05_release_preflight_audit.sql` and `04_safety_smoke_test.sql` proof after migrations are applied.

## Why it matters

PinayMate launch depends on a specific ordered Supabase migration set. A passive manifest can drift; this turns the migration order into an enforceable source contract before staging or production release work.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run `npm run check:migration-manifest`.
- Run `npm run check:source-contracts`.
- Run staging migration apply/history checks before production claims.
