# Report reviewer identity + waitlist burst-control migration evidence (source-only)

Date: 2026-06-11
Source: `PM_App/supabase/migrations/20260611133000_require_report_reviewer_and_waitlist_burst_control.sql`
Evidence owner: Codex (PinayMate docs source sweep)

## Scope reviewed

- `review_user_report` now requires `p_reviewer_id`; null/empty values are rejected.
- `review_user_report` now requires `p_reviewer_id` to be active in `moderation_reviewers`; unregistered or inactive reviewer IDs are rejected.
- Reviewer registry create/update/deactivation changes are routed through service-role reviewer management RPCs that require operator/reason.
- Reviewer registry changes are recorded in `moderation_reviewer_audit_log` through `trg_log_moderation_reviewer_change`.
- Finalized report decisions are protected from silent overwrite attempts.
- `review_user_report` is revoked from `PUBLIC`, `anon`, and `authenticated` execution and granted only to `service_role`.
- `submit_waitlist_signup` adds source/platform-aware burst protection using an advisory lock on the same source/platform bucket that the one-minute throttle counts.
- Public waitlist source values are restricted to `pm_web` and `pm_app`; unsupported values are normalized to `pm_web`.
- Public waitlist responses are generic accepted responses, so duplicate, blocked, or unsubscribed emails do not reveal existing waitlist membership, row IDs, original signup time, or internal status.

## Source-only status

- Source-only review was completed.
- No runtime checks were executed in this evidence packet.

## Checks not run

- No test suite run
- No build command run
- No Supabase CLI command run
- No `psql` run
- No browser/local live validation run
- No git status/commit activity run
- No external environment/live system checks run
