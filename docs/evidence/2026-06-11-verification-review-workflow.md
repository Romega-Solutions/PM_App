# Verification Review Workflow Migration

Date: 2026-06-11
Worker: Team 6 backend verification-review support

## Scope

- Added `PM_App/supabase/migrations/20260611131000_add_verification_review_workflow.sql`.
- Implemented `public.review_profile_verification(UUID, TEXT, TEXT, UUID, TEXT[])` for service-role-only profile verification review.
- Added profile reviewer metadata columns when missing:
  - `verification_reviewer_id`
  - `verification_reviewer_note`
  - `verification_reviewed_at`

## Static Review Notes

- Existing profile verification fields were confirmed from local SQL migrations:
  - `is_verified`
  - `verification_status`
  - `verification_photo_url`
  - `verified_at`
  - `verification_completed`
  - `verification_selfie`
  - `verification_document`
  - `verification_mismatch_reasons`
- The new RPC accepts only `approved` and `rejected`.
- Approved reviews set `is_verified = TRUE`, `verification_status = 'approved'`, `verified_at = NOW()`, reviewer metadata, and clear mismatch reasons.
- Rejected reviews set `is_verified = FALSE`, `verification_status = 'rejected'`, `verified_at = NULL`, reviewer metadata, and persist the supplied mismatch reasons.
- Function execution is revoked from `PUBLIC`, `anon`, and `authenticated`, then granted only to `service_role`.
- The function uses `SECURITY DEFINER` with `SET search_path = ''` and fully qualified table references.

## Verification Boundary

Per task constraints, no tests, build, lint, Supabase CLI, psql, browser, git, or live checks were run.
