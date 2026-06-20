# Report review workflow

Date: 2026-06-11
Owner: Codex

## Scope

This source-only update adds a controlled backend path for safety/support report review.

## What changed

- Added `supabase/migrations/20260611130000_add_report_review_workflow.sql`.
- Added review metadata to `user_reports`: `severity`, `action_taken`, `reviewer_id`, `reviewer_note`, and `reviewed_at`.
- Added service-role-only `review_user_report`.
- Updated migration manifest, Supabase operator checklist, preflight audit, smoke SQL, and static contract markers.

## Safety boundary

- App clients can submit reports through `submit_user_report`.
- App clients cannot execute `review_user_report`.
- Review decisions are intended for backend/support tooling with service-role authority and owner signoff.
- This does not prove that safety owners are staffed, that queues are monitored, or that moderation SLAs are live.

## Validation status

Not run. This is source evidence only.

Required proof before launch:

- Apply the migration in staging and production.
- Run preflight and smoke SQL.
- Prove `anon` and `authenticated` cannot execute `review_user_report`.
- Prove service-role review can move a report to `reviewing`, `resolved`, or `dismissed` with severity/action metadata.
- Record named safety/support owner and backup in `docs\operations\SAFETY_MODERATION_RUNBOOK.md`.
