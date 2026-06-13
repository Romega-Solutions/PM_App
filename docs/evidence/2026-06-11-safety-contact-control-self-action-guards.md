# Safety Contact-Control Self-Action Guards

Date: 2026-06-11
Scope: PM_App client safety API preflight for report, block, unmatch, message-send, and chat-image removal flows.

## What changed

- `blockUser()` now rejects attempts to block the signed-in user before calling Supabase.
- `unmatchUser()` now rejects attempts to unmatch the signed-in user before calling Supabase.
- This aligns contact controls with the existing self-report guard in `submitUserReport()`.
- `sendTextMessage()` and `sendImageMessage()` now reject self-messaging before calling the `send_message` RPC.
- `deleteChatImage()` now authenticates the user and rejects unsafe storage paths before calling Supabase Storage removal.

## Verification

- `npx jest src/features/safety/api/__tests__/safetyApi.test.ts --runInBand --no-cache`
  - Pass: 5 tests.
  - Covered report normalization, invalid report IDs, self-report rejection, contact-control RPC calls, and self block/unmatch rejection.
- `npx jest src/features/messaging/api/__tests__/messages.api.test.ts --runInBand --no-cache`
  - Pass: 18 tests.
  - Covered signed media hydration, image send storage boundaries, safe send failures, self-messaging rejection, read-state RPCs, delete RPCs, authenticated chat-image removal, and unsafe delete-path rejection.
- `npm run check:user-facing-safe-errors`
  - Pass.
- `npx tsc --noEmit --pretty false`
  - Pass.
- `npm run lint`
  - Pass.
- `npm run check:source-contracts`
  - Pass.

## Boundary

This is local source and unit-test proof only. It does not replace the launch-required two-account native QA that proves report, block, unmatch, blocked discovery, blocked chat, live message-send behavior, and live storage-policy behavior against a live Supabase project.
