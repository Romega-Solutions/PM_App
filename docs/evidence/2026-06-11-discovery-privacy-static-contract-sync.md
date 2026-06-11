# Discovery Privacy Static Contract Sync

Date: 2026-06-11

Status: Static guard and smoke-test wording updated, checks not rerun in this note.

## What changed

- Updated the Supabase static contract audit to require the final `999_restore_profile_visibility_filter.sql` migration markers.
- Added a static marker for the smoke-test assertion that hidden profiles are excluded from `discoverable_profiles`.
- Updated the safety smoke-test header to say it must run after migrations through `999_restore_profile_visibility_filter.sql`.
- Updated the smoke-test pass message to include privacy discovery coverage.

## Why this matters

- The final hardening migration previously recreated `discoverable_profiles`.
- The follow-up visibility migration is now part of the required local contract, so a release check can catch accidental removal of hidden-profile filtering before live migration proof.

## Required next proof

- Rerun `npm run check:supabase-static-contract` from `PM_App`.
- Apply the full ordered migration set to a target database and run `supabase/tests/04_safety_smoke_test.sql` before launch.
