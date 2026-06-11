# Account Setup API Safe Errors

## Status

Source update completed. No tests, lint, typecheck, native QA, Supabase checks, storage checks, OCR checks, or release gates were run in this turn by instruction.

## Changed

- `src/features/account/api/basicInfoApi.ts`
  - Replaced raw auth/RPC/basic-info save failures with safe sign-in or retry messages.
- `src/features/account/api/photosApi.ts`
  - Replaced raw auth/storage/profile update failures with safe photo save/remove messages.
- `src/features/account/api/locationApi.ts`
  - Replaced raw auth/profile update failures with safe location save messages.
- `src/features/account/api/verificationApi.ts`
  - Replaced raw storage/RPC verification upload and submit failures with safe recovery messages.

## Why it matters

Account setup is a conversion-critical path and includes sensitive identity/photo/location workflows. These shared APIs now avoid leaking Supabase, storage, or RPC details while keeping callers able to show actionable errors.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test basic info, photo save/remove, location save, and verification upload/submit failure cases.
- Run Supabase storage/RPC staging checks before launch.

`docs/NATIVE_QA_SCRIPT.md` now includes explicit account setup failure-state checks for these safe-error paths.
