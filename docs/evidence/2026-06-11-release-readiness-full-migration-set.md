# Release Readiness Full Migration Set

Date: 2026-06-11

Status: Release documentation updated, live Supabase state not verified in this note.

## What changed

- Updated the backend release checklist to reference the full ordered migration set through `999_restore_profile_visibility_filter.sql`.
- Replaced the older partial migration evidence summary with a full ordered migration-set reference.

## Why this matters

- The app now depends on migrations for account deletion, privacy settings, read-receipt privacy, online-status privacy, OCR quotas, storage policies, basic-info RPC controls, and final hidden-profile discovery filtering.
- A partial migration checklist could create a false green release decision even when privacy or safety behavior is not applied to the target database.

## Required next proof

- Apply the full ordered migration set to staging/local first, then production.
- Run `supabase/tests/04_safety_smoke_test.sql` against a real target database after migrations are applied.
- Attach migration history, policy/function checks, and smoke-test output to the launch evidence packet.
