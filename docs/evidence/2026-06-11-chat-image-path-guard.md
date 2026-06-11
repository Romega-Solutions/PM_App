# Chat Image Path Guard

Date: 2026-06-11
Owner: Codex
Result: Source patch only - not rerun

## What changed

- Added `assertConversationImagePath` in `src/features/messaging/api/messages.api.ts`.
- Image sends now require a conversation ID before calling `send_message`.
- Image sends now normalize storage paths and reject paths that do not begin with the active conversation ID.
- Updated message API tests so the image path shape matches storage upload behavior: `conversationId/file.jpg`.
- Replaced the old "RPC can create a conversation for image messages" expectation with a safer client-side rejection for non-conversation-bound image paths.

## Why it matters

The backend `send_message` RPC now rejects external image URLs, missing storage objects, and image paths outside the conversation folder. The client should fail early with a safe error instead of sending paths that the database must reject.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run PM_App message API tests.
- Run PM_App typecheck.
- Run Supabase smoke tests after migrations are applied.
