# Messaging Hook Safe Errors

## Status

Source update completed. No lint, typecheck, tests, native QA, messaging smoke checks, or release gates were run in this turn by instruction.

## Changed

`src/features/messaging/hooks/useConversations.ts`

- Replaced raw conversation API exceptions with a stable safe message.
- Preserved the hook contract: `error` still returns `Error | null`.

## Why it matters

Conversation loading is a private messaging surface. Raw database or RPC errors should not leak into message-list UI or screen-reader output.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test conversations loading, offline failure, unread counts, and refresh behavior.
