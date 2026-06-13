# Pass profile release contract coverage

Date: 2026-06-11

Scope: PM_App Supabase launch security contract for pass actions.

## Change

- Added `20260611040010_pass_profile_rpc.sql` to the Supabase static manifest markers.
- Added static-contract coverage for the `public.pass_profile(uuid)` RPC boundary.
- Added release preflight checks that `pass_profile` exists, is authenticated-only, and that `authenticated` cannot directly insert into `public.passes`.
- Added smoke-test checks for the same pass-action privilege boundary.

## Why this matters

Passing on a profile is a user action that should stay behind an RPC boundary. Direct table inserts would let the app client bypass discovery and privacy checks and write pass records outside the intended server-owned flow.

## Verification status

Source updated only. The Supabase static contract, preflight SQL, and smoke SQL were not run in this pass.
