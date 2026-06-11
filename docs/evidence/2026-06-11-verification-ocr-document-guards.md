# Verification OCR Document Guards

## Status

Source hardening completed. Verification tests, OCR tests, source contracts, and live Supabase/OCR checks were not run in this turn by instruction.

## Changed

`src/features/account/api/verificationApi.ts`

- Added a 6 MB local file-size guard before private verification storage upload.
- Kept verification document uploads in the private `verification-docs` bucket.
- Changed mismatch messages so extracted/stored names and ages are not echoed back into UI text.

`src/services/ocrService.ts`

- Added a 6 MB local file-size guard before OCR requests.
- Added image extension and content-type detection for OCR form uploads.
- Kept client-facing OCR errors generic and recoverable.

`src/features/account/api/__tests__/verificationApi.test.ts`

- Updated mismatch expectations to privacy-safe review reasons.
- Added oversized verification file coverage.
- Added file metadata mocks for upload tests.

`src/services/__tests__/ocrService.test.ts`

- Added file metadata mocks for OCR tests.
- Added oversized OCR document coverage.
- Updated rejected OCR response expectations to client-safe messages.

`scripts/check-launch-file-contract.mjs`

- Added static markers for verification file-size caps, generic mismatch reasons, and OCR document guards.

`scripts/check-supabase-static-contract.mjs`

- Added static Supabase contract markers for OCR client file-size checks and safe OCR error handling.

`SUPABASE_SETUP_INSTRUCTIONS.md`

- Added oversized-document rejection to required OCR live checks.
- Documented the 6 MB verification image cap and privacy-safe mismatch wording.

## Why it matters

Identity verification handles private document evidence. The app should reject oversized files before upload or OCR calls, avoid sending unnecessary payloads, and avoid displaying extracted identity values in mismatch text.

## Evidence still needed

- Run verification API tests.
- Run OCR service tests.
- Run `npm run check:source-contracts`.
- Deploy and prove the OCR Edge Function with authenticated live requests.
- Prove `verification-docs` storage policies in staging and production.
