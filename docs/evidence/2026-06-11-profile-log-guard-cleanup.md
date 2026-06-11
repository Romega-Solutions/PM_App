# PinayMate Profile Log Guard Cleanup

Date: 2026-06-11
Scope: `src/features/profile/screens/ProfileScreen.tsx`.

## What changed

- Removed the profile screen safe-log helper because it still required multi-argument `console.error` calls.
- Replaced profile fetch and logout error logs with generic one-argument messages.
- Removed the unused helper type that existed only for logging.

## Why it matters

The new `npm run check:privacy-logs` guard blocks raw or multi-argument runtime logging patterns. This cleanup moves the profile screen toward passing that guard while avoiding profile-row, auth, or Supabase error details in runtime logs.

## Not verified in this pass

- `npm run check:privacy-logs` was not executed.
- Full lint, typecheck, tests, and web export were not rerun.
