# Profile creation trigger repair

Date: 2026-06-11
Owner: Codex

## Scope

This source-only update closes the backend profile lifecycle gap found during the PinayMate backend readiness sweep.

## What changed

- Filled `supabase/functions/create-profile-on-signup.sql` with an idempotent profile creation trigger script.
- Added `supabase/migrations/20260611124000_repair_profile_creation_trigger.sql` to make the repair part of the launch migration order.
- Updated `supabase/LAUNCH_MIGRATION_MANIFEST.md` and `docs/SUPABASE_RELEASE_OPERATOR_CHECKLIST.md` so staging and production operators must account for the repair.
- Expanded `supabase/tests/05_release_preflight_audit.sql` to require `public.handle_new_user()`, `on_auth_user_created`, and `on_auth_user_verified`.
- Expanded preflight to fail if `anon` or `authenticated` can directly execute `public.handle_new_user()`.
- Expanded `scripts/check-supabase-static-contract.mjs` with source markers for the profile lifecycle repair.

## Contract

- `public.handle_new_user()` is recreated as `SECURITY DEFINER SET search_path = ''`.
- Direct client execute grants are revoked from `PUBLIC`, `anon`, and `authenticated`.
- The insert trigger runs only when `auth.users.email_confirmed_at` already exists.
- The update trigger runs when email confirmation is first recorded.
- Completed onboarding values are preserved if a client fallback profile already exists.

## Validation status

Not run. This is source evidence only.

Required proof before launch:

- Run the Supabase migration order in staging and production.
- Run `supabase/tests/05_release_preflight_audit.sql` and confirm the new trigger checks pass.
- Run `supabase/tests/04_safety_smoke_test.sql`.
- Create a test email user in staging and prove profile creation happens after confirmation without overwriting completed onboarding values.
