# PM_App waitlist Edge single-row RPC response guard

Date: 2026-06-11

## Scope

Supabase waitlist Edge Function response cardinality for the private `submit_waitlist_signup` RPC call.

## What changed

- The Edge Function now treats the private waitlist RPC response as valid only when it returns exactly one row.
- Empty, multi-row, malformed, mismatched-email, mismatched-platform, or non-`accepted` RPC responses fail closed with the generic waitlist fallback.
- Added a static-contract marker for the single-row RPC response requirement.

## Why

The public waitlist Edge response should expose only one validated generic accepted row for the current submission. Returning the first row from an over-broad or malformed RPC response would weaken that boundary.

## Files touched

- `supabase/functions/waitlist-signup/index.ts`
- `scripts/check-supabase-static-contract.mjs`

## Verification status

Not run in this pass.

This is source-level evidence only. It does not prove the static contract passes, the Edge Function deploys, Supabase migrations are applied, the live RPC returns one row, or production waitlist capture is ready.
