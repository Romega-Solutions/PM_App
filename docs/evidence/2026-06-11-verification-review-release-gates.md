# Verification Review Release Gates

Date: 2026-06-11
Owner: Codex coordinator with sub-agent review
Status: Source-only implementation and release-gate wiring; not runtime verified.

## What changed

- Hardened the profile verification review workflow so reviewer approval requires a pending completed verification submission, user-scoped selfie/document paths, matching private storage objects, and a reviewer ID.
- Added `review_profile_verification` to the ordered migration manifest.
- Added static, preflight, and smoke-test source coverage for app-client execute denial, missing-evidence rejection, and pending-evidence approval through the privileged review path.
- Updated release/operator docs so verification badges remain blocked until staging/production migration, smoke, preflight, native QA, and operational owner evidence are captured.

## Verification boundary

- No tests, builds, lint, Supabase CLI, psql, browser checks, git commands, or live checks were run in this pass.
- This evidence proves local source intent only. It does not prove the workflow is applied to staging or production.

## Remaining proof required

- Apply the full ordered migration set through `20260611131000_add_verification_review_workflow.sql` in staging first, then production.
- Run `supabase/tests/05_release_preflight_audit.sql`.
- Run `supabase/tests/04_safety_smoke_test.sql`.
- Capture proof that `review_profile_verification` is not executable by `anon` or `authenticated`.
- Capture proof that missing submitted evidence cannot be approved.
- Capture proof that pending submitted evidence can be approved only through approved backend/support tooling.
