# Report Abuse and Discovery Read-Model Hardening

Date: 2026-06-11
Owner: Codex
Status: Source-only implementation and release-gate wiring; not runtime verified.

## What changed

- Added a migration that keeps repeated same-pair report submissions from creating duplicate open moderation queue rows.
- Added a short-window repeated-report suppression path so the existing report row is refreshed instead of filling the queue.
- Added a discovery read-model comment that documents `discoverable_profiles` as a privileged, narrow profile-card view.
- Added preflight and smoke-test source checks that fail if `discoverable_profiles` exposes sensitive, private verification, moderation, contact, or reviewer columns.
- Updated static contract and release docs so report abuse controls and discovery-column exposure are launch gates.

## Verification boundary

- No tests, builds, lint, Supabase CLI, psql, browser checks, git commands, or live checks were run in this pass.
- This evidence proves local source intent only. It does not prove the migration works in staging or production.

## Remaining proof required

- Apply the ordered migration set through `20260611132000_harden_report_abuse_and_discovery_read_model.sql`.
- Run `supabase/tests/05_release_preflight_audit.sql`.
- Run `supabase/tests/04_safety_smoke_test.sql`.
- Capture proof that duplicate same-pair reports merge instead of adding new open queue rows.
- Capture proof that `discoverable_profiles` exposes only intended profile-card fields.
