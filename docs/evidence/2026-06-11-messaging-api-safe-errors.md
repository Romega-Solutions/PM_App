# Messaging API Safe Errors

## Status

Source update completed. No lint, typecheck, tests, messaging smoke checks, storage checks, native QA, Supabase checks, or release gates were run in this turn by instruction.

## Changed

- `src/features/messaging/api/conversations.api.ts`
  - Replaced raw conversation RPC/auth errors with safe load/sign-in messages.
- `src/features/messaging/api/messages.api.ts`
  - Replaced raw send, load, read-status, delete, unread-count, chat-image upload, and chat-image delete errors with safe messages.
- `src/features/messaging/api/messagesApi.ts`
  - Replaced legacy conversation/read-status raw errors with safe messages.

## Why it matters

Messaging is a private, high-trust surface. API-layer failures should not expose database, RLS, storage, RPC, or internal path details to chat and inbox UI.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test message send, image upload, conversation load, read status, delete, and offline failure states.
- Run Supabase messaging smoke checks in staging and production.
