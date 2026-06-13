# PM_App waitlist Edge JSON content-type boundary

Date: 2026-06-11

## Scope

Supabase waitlist Edge Function request-boundary hardening.

## What changed

- Kept the waitlist Edge Function restricted to `Content-Type: application/json` POST bodies.
- Changed the non-JSON request response to use the generic public waitlist fallback message while preserving HTTP 415.
- Documented the JSON-only request boundary in the waitlist Edge Function README.
- Added static-contract markers for the JSON content-type check, generic 415 fallback, and README request-boundary wording.

## Files touched

- `supabase/functions/waitlist-signup/index.ts`
- `supabase/functions/waitlist-signup/README.md`
- `scripts/check-supabase-static-contract.mjs`

## Verification status

Not run in this pass.

This is source-level evidence only. It does not prove the static contract passes, the Edge Function deploys, Supabase secrets are configured, the function is live, or production waitlist capture is ready.
