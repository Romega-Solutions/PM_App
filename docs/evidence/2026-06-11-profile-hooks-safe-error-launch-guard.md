# Profile Hooks Safe Error Launch Guard

## Status

Source update completed. The launch-file contract guard was not run in this turn by instruction.

## Changed

`scripts/check-launch-file-contract.mjs` now treats these profile hook files as launch-critical:

- `src/features/profile/hooks/useUploadPhoto.ts`
- `src/features/profile/hooks/useUpdateProfile.ts`
- `src/features/profile/hooks/userProfile.ts`

The guard checks for safe-error markers covering photo permission, upload, delete, profile update, and profile load failures.

## Why it matters

Profile hooks sit between hardened APIs and user-facing screens. Guarding them helps prevent future changes from reintroducing raw runtime, storage, or database messages into profile UI.

## Evidence still needed

- Run `npm run check:launch-file-contract`.
- Run PM_App lint and TypeScript checks.
- Native-test profile hook failure states.
