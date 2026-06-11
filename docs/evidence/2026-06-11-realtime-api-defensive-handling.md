# Realtime API Defensive Handling

## Status

Source update completed. No lint, typecheck, tests, realtime smoke checks, native QA, or release gates were run in this turn by instruction.

## Changed

`src/features/messaging/api/realtime.api.ts`

- Wrapped realtime message media hydration callbacks in safe try/catch blocks.
- Wrapped typing and read-receipt broadcast sends in safe try/catch blocks.
- Wrapped presence tracking in safe try/catch.
- Made channel removal catch and log cleanup failures instead of throwing through caller cleanup.

## Why it matters

Realtime messaging should degrade safely. A failed signed-image hydration, broadcast send, presence track, or channel cleanup should not crash chat listeners or block the rest of the messaging experience.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test realtime message receive, typing, read receipts, presence, and screen unmount cleanup.
- Confirm Supabase Realtime configuration in staging and production.
