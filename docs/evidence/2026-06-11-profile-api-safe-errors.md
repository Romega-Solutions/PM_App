# Profile API Safe Errors

## Status

Source update completed. No tests, lint, typecheck, release gates, upload checks, or native QA were run in this turn by instruction.

## Changed

`src/features/profile/api/profileApi.ts`

- Replaced raw Supabase database/storage `error.message` values with user-safe recovery messages.
- Replaced generic "Not authenticated" with sign-in guidance.
- Replaced invalid photo URL exposure with a safe removal failure message.

## Why it matters

Profile updates and photo uploads are high-trust onboarding paths. Returning raw storage or database messages can expose implementation details and confuse users. The API now keeps user-facing errors recoverable while preserving generic console logs for debugging.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Upload, save, and delete photos on a native device/emulator.
- Verify failed upload/delete states show safe copy and do not expose storage paths.
