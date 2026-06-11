# Messaging Hook Safe Error Launch Guard

## Status

Source update completed. The launch-file contract guard was not run in this turn by instruction.

## Changed

`scripts/check-launch-file-contract.mjs` now checks `src/features/messaging/hooks/useConversations.ts` for the `CONVERSATIONS_LOAD_ERROR` safe-error marker.

## Why it matters

Messaging is a private user surface. This guard helps prevent raw conversation API errors from being reintroduced into the hook layer before launch.

## Evidence still needed

- Run `npm run check:launch-file-contract`.
- Run PM_App lint and TypeScript checks.
- Native-test conversation load failure states.
