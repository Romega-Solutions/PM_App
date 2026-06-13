# PM_App waitlist Edge RPC response value guard

Date: 2026-06-11

## Scope

Supabase waitlist Edge Function response integrity for the private `submit_waitlist_signup` RPC call.

## What changed

- Added a server-side `WaitlistRpcStatus = "accepted"` public-response type.
- Added `isAcceptedWaitlistRpcRow` to validate the private RPC response before returning anything to the browser.
- The Edge Function now requires the RPC row to match the submitted normalized email.
- The Edge Function now requires the RPC row to match the submitted platform.
- The Edge Function now requires the RPC row to use the generic public `accepted` status.
- The Edge Function now returns only the validated first row instead of returning the raw RPC row array.
- Added static-contract markers for the response-value guard.

## Why

This keeps the public Edge response aligned with the privacy-preserving waitlist RPC contract. Browser callers should receive only the generic accepted response, and the Edge Function should fail closed if the private RPC returns malformed, stale, mismatched, or non-public row data.

## Files touched

- `supabase/functions/waitlist-signup/index.ts`
- `scripts/check-supabase-static-contract.mjs`

## Verification status

Not run in this pass.

This is source-level evidence only. It does not prove the static contract passes, the Edge Function deploys, Supabase migrations are applied, the live RPC returns the expected row, or production waitlist capture is ready.
