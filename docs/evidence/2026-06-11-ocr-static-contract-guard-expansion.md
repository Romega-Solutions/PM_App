# OCR Static Contract Guard Expansion

Date: 2026-06-11

Status: Guard expanded, not rerun in this note.

## What changed

- Expanded the Supabase static contract audit to check OCR Edge Function JWT enforcement configuration.
- Added static markers for authenticated bearer-token handling, Supabase `/auth/v1/user` validation, and the `claim_ocr_attempt` rate-limit RPC call.
- Added static markers for keeping the OCR provider key server-side through `OCR_SPACE_API_KEY`.
- Added static markers for the mobile client calling the Supabase Edge Function with the active session bearer token.
- Added forbidden-marker checks for privacy-risk OCR logging patterns such as `bodyPreview` and non-error console logging in the OCR function.

## What this proves

- The local repository now has a stronger guard against accidentally weakening the OCR authentication, quota, provider-secret, or privacy-logging contract.

## What this does not prove

- It does not prove the OCR function is deployed.
- It does not prove Supabase migrations are applied in a live project.
- It does not prove RLS policies are active in production.
- It does not prove real authenticated, unauthenticated, quota-limit, or provider-failure requests behave correctly.

## Required next proof

- Rerun `npm run check:supabase-static-contract` from `PM_App`.
- After secret hygiene is approved and resolved, rerun `npm run check:release-local`.
- Verify the deployed OCR Edge Function with real authenticated and unauthenticated requests against the target Supabase project.
