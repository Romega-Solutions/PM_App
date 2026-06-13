# PM_App waitlist Edge public response contract doc

Date: 2026-06-11

## Scope

Supabase waitlist Edge Function operator documentation and static contract coverage.

## What changed

- Documented the public success response shape for `waitlist-signup`.
- Stated that successful public responses must contain exactly one generic accepted row.
- Stated that `email_normalized` must match the submitted normalized email.
- Stated that `platform` must match the submitted normalized platform.
- Stated that `status` must be `accepted`.
- Stated that malformed, zero-row, multi-row, mismatched, or non-accepted private RPC responses fail closed with the generic fallback message.
- Added static-contract markers for those README requirements.

## Files touched

- `supabase/functions/waitlist-signup/README.md`
- `scripts/check-supabase-static-contract.mjs`

## Verification status

Not run in this pass.

This is source-level evidence only. It does not prove the static contract passes, the Edge Function deploys, Supabase migrations are applied, the live RPC returns one accepted row, or production waitlist capture is ready.
