# Backend Source Contract Hardening

Date: 2026-06-11
Status: Source inspection only

Scope:

- `PM_App/supabase/**`
- `PM_App/scripts/check-supabase*.mjs`
- Backend evidence documentation

Changes made:

- Closed the legacy migration ordering trap where `99_final_release_security_hardening.sql` could run after the timestamped `send_message` hardening and re-grant direct message inserts.
- Kept `discoverable_profiles` privacy enforcement safe in legacy tail migrations by using `security_invoker = false` and preserving the `profile_visible` predicate.
- Extended static Supabase contract guards so direct message inserts and unsafe discovery view options are detected in source review.
- Added a manifest note requiring staging/production migration history evidence before claiming the backend privacy contract is live.

Not verified in this pass:

- No tests, builds, lint, Supabase SQL, live Supabase connection, or `.env` inspection were run per task constraint.
- Applied migration state remains unproven until staging/production migration history and smoke-test output are captured.
