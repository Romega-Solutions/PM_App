# Profile Hooks Safe Errors

## Status

Source update completed. No lint, typecheck, tests, native QA, upload checks, or release gates were run in this turn by instruction.

## Changed

- `src/features/profile/hooks/useUploadPhoto.ts`
  - Replaced raw thrown errors and generic unknown errors with safe permission, sign-in, upload, and delete messages.
- `src/features/profile/hooks/useUpdateProfile.ts`
  - Replaced raw update exceptions with safe recovery copy.
- `src/features/profile/hooks/userProfile.ts`
  - Replaced raw profile-load exceptions with safe recovery copy.

## Why it matters

The profile API layer was already hardened, but hooks are another user-facing boundary. These hooks now avoid resurfacing storage, database, or unexpected runtime messages into profile UI.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test profile load, profile update, photo upload permission denial, upload failure, and delete failure states.
