# Verification Review Static Contract Guard

Date: 2026-06-11

Status: Static guard updated, checks not rerun in this note.

## What changed

- Added a dedicated "Verification private review controls" section to the Supabase static contract audit.
- The guard now requires local markers for:
  - private `verification-docs` storage
  - verification evidence policies scoped to the authenticated user folder
  - `submit_verification` smoke-test coverage
  - pending review state after verification submission
  - no automatic `is_verified` badge approval
  - forged verification storage path rejection
  - direct verification column update rejection

## Why this matters

- The mobile verification UI now tells users that review is private and approval is not automatic.
- The backend release guard now checks that the matching local database contract remains present before live Supabase proof is collected.

## Required next proof

- Rerun `npm run check:supabase-static-contract` from `PM_App`.
- Apply the full ordered migration set and run the Supabase smoke test against a target database before launch.
