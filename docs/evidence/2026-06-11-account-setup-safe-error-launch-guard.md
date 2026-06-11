# Account Setup Safe Error Launch Guard

## Status

Source update completed. The launch-file contract guard was not run in this turn by instruction.

## Changed

`scripts/check-launch-file-contract.mjs` now treats these account setup API modules as launch-critical:

- `src/features/account/api/basicInfoApi.ts`
- `src/features/account/api/photosApi.ts`
- `src/features/account/api/locationApi.ts`
- `src/features/account/api/verificationApi.ts`

The guard checks for safe-error constants covering signin-required, save, remove, upload, and submit failure paths.

## Why it matters

Basic info, photos, location, and verification are sensitive onboarding surfaces. Adding file-contract markers makes it harder to accidentally reintroduce raw backend/storage/RPC error leakage before launch.

## Evidence still needed

- Run `npm run check:launch-file-contract`.
- Run PM_App lint and TypeScript checks.
- Native-test failure states for account setup flows.
