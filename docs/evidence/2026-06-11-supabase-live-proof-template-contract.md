# Supabase live proof template contract

Date: 2026-06-11
Owner: Codex

## Status

Source contract update completed. Checks were not run in this turn.

## Changed

- Added `docs/evidence/TEMPLATE-supabase-live-proof.md` to the PM_App launch-file contract.
- Required the template to keep sections for:
  - migration manifest proof
  - RLS, grants, and policy proof
  - safety smoke SQL
  - OCR Edge Function proof
  - notification delivery boundary
- Required concrete proof fields for:
  - denied direct message inserts
  - notification preferences through RPCs
  - OCR rate-limit behavior
  - provider delivery remaining blocked or separately proven

## Why it matters

The Supabase live-proof template is the bridge between source readiness and production readiness. If it loses the core backend proof fields, the release packet could look complete while missing the evidence needed to prove the secure backend-backed platform is actually ready.

## Not proven

- PM_App launch-file contract was not run.
- Supabase migrations, RLS, SQL smoke tests, OCR deployment, and notification provider behavior were not run or verified.
- No lint, typecheck, test, build, Expo, browser, or live validation was performed.
