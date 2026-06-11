# PinayMate Messaging UI and Flow

Status: launch-stage. This document reflects the current messaging implementation and the remaining proof required before messaging can be called production-ready.

## Current product position

PinayMate messaging is backend-backed in app code, but release signoff still depends on live Supabase migration verification, storage/RLS smoke tests, and native QA. Do not describe chat as production-complete until those gates pass.

## Current user flow

1. User opens Messages.
2. App loads conversations through `useConversations` and `get_user_conversations`.
3. User opens a conversation.
4. `ChatScreen` loads messages through `useMessages` and `messages.api.ts`; once a conversation ID exists, history is loaded by conversation ID.
5. Text messages are inserted through the messaging API.
6. Image messages upload to private `chat-images` storage and store durable paths in `messages.image_url`.
7. Message image display uses short-lived signed URLs through `hydrateMessageMedia`.
8. Read and delete actions go through RPCs instead of direct table updates.
9. Report, block, and unmatch actions use the safety API/RPC path.

## Implemented behavior

- Conversation list loads from backend RPC data.
- Message history loads from Supabase tables.
- Text send uses `sendTextMessage`.
- Image send uses `uploadChatImage` plus `sendImageMessage`.
- Chat images are displayed through signed URLs instead of public bucket URLs.
- `ChatScreen` calls the `mark_conversation_read` path for the active conversation after messages load; target-environment proof is still required before this can be called production-verified.
- Message status and deletion use hardened RPCs.
- Realtime hook exists for new messages, typing indicators, and read receipts.
- Chat send failures restore the input and show a recoverable error.
- Voice and video actions route to honest unavailable-state screens; no microphone, camera, or call session is opened.

## Important non-goals for launch

These are not production features yet:

- voice calling
- video calling
- push notifications
- offline message queue
- typing indicator persistence guarantees
- message reactions
- message forwarding
- file attachments beyond image messages
- app-wide moderation console

If these appear in UI or public copy, they must be framed as unavailable or roadmap-only.

## Source files

- `src/features/messaging/screens/MessagesScreen.tsx`
- `src/features/messaging/screens/ChatScreen.tsx`
- `src/features/messaging/screens/VoiceCallScreen.tsx`
- `src/features/messaging/screens/VideoCallScreen.tsx`
- `src/features/messaging/api/messages.api.ts`
- `src/features/messaging/api/conversations.api.ts`
- `src/features/messaging/api/realtime.api.ts`
- `src/features/messaging/hooks/useMessages.ts`
- `src/features/messaging/hooks/useConversations.ts`
- `src/features/messaging/hooks/useChatRealtime.ts`
- `src/features/messaging/hooks/useMessageUpload.ts`
- `src/features/safety/api/safetyApi.ts`

## Safety requirements

Messaging launch proof must show:

- unmatched users cannot create/open a conversation
- blocked users disappear from conversation lists
- blocked users cannot send new messages
- direct message status updates are denied to clients
- direct delete/update table writes are denied where RPC ownership is required
- chat images are not publicly readable
- signed chat image URLs work only for authorized conversation participants
- report/block/unmatch flows do not expose reporter identity

## Native QA requirements

Use `docs/NATIVE_QA_SCRIPT.md` to verify:

- conversation list loading state
- empty and error states
- text message send success and failure recovery
- image message upload and signed display
- read status behavior
- delete-for-me and delete-for-everyone behavior if available in UI
- report, block, and unmatch from chat/profile
- unavailable voice/video screens

## Release blockers

Messaging remains blocked for production until:

- required Supabase migrations are applied in staging and production
- `supabase/tests/04_safety_smoke_test.sql` passes
- native QA proves matched, blocked, and failed-network flows
- production support/moderation ownership is assigned
- PM_Web copy stays aligned with actual launch availability

## Evidence commands

```powershell
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npm run build:web
```

Supabase/runtime evidence must come from the target environment, not from local static inspection alone.
