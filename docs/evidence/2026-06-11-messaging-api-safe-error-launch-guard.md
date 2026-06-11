# Messaging API Safe Error Launch Guard

## Status

Source update completed. The launch-file contract guard was not run in this turn by instruction.

## Changed

`scripts/check-launch-file-contract.mjs` now checks safe-error markers in:

- `src/features/messaging/api/conversations.api.ts`
- `src/features/messaging/api/messages.api.ts`
- `src/features/messaging/api/messagesApi.ts`

The guard covers conversation load, sign-in, message send/load, image upload/delete, and legacy read-status error boundaries.

## Why it matters

The messaging API is directly tied to private conversations and chat images. Guarding safe-error constants helps prevent future raw backend/storage/RPC error leakage.

## Evidence still needed

- Run `npm run check:launch-file-contract`.
- Run PM_App lint and TypeScript checks.
- Native-test messaging failure states.
