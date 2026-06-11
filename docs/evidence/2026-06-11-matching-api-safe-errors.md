# Matching API Safe Errors

## Status

Source update completed. No tests, lint, typecheck, release gates, or runtime QA were run in this turn by instruction.

## Changed

`src/features/matching/api/matchingApi.ts` no longer returns raw Supabase or database `error.message` values from these user-facing action paths:

- like profile
- pass profile
- undo last swipe

The API now returns action-specific recovery messages such as:

- "Like did not send. Check your connection and try again."
- "Pass did not save. Check your connection and try again."
- "Undo did not complete. Check your connection and try again."

Local validation messages such as missing member IDs and self-like/self-pass prevention remain user-facing.

## Why it matters

Swipe and match actions are high-frequency user paths. Raw backend errors can expose implementation details and make failures feel unsafe. This keeps user-facing failures recoverable without hiding operational logs from developers.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Run the privacy-log/user-facing error guard after adding matching API coverage if desired.
- Device-test failed like/pass/undo network cases.
