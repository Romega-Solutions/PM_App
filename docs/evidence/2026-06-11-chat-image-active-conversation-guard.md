# Chat Image Active Conversation Guard

Date: 2026-06-11
Status: Source patch only - not runtime verified

## What changed

- `useMessages.sendImage` now rejects image sends when the chat does not have an active `conversationId`.
- `ChatScreen` stops before image picker/upload when the conversation is not ready, instead of uploading into an empty or unbound storage path.
- `useMessageUpload` rejects empty conversation IDs before upload and clears optimistic progress intervals in failure paths.
- `uploadChatImage` validates the conversation ID before reading the local image and uses the authenticated user ID in the storage filename instead of trusting the caller-supplied user ID.
- `check-safety-operations-contract` now validates the actual `package.json` script wiring for `check:safety-operations-contract` and `check:release-local`.

## Why it matters

Chat photos should only be uploaded and sent inside an established matched conversation. This keeps the client aligned with the backend storage-path contract and avoids orphaned or incorrectly scoped chat image objects.

## Verification

Not run in this pass. The change still needs:

- `npm run check:source-contracts`
- `npx tsc --noEmit --pretty false`
- messaging API tests
- native chat photo QA with a matched conversation
