# Messaging Safety UI Follow-up

Date: 2026-06-11
Scope: PM_App source-only UI/UX polish

## Changed files

- `app/(modals)/report-user.tsx`
- `src/features/messaging/screens/ChatScreen.tsx`
- `src/features/messaging/screens/VoiceCallScreen.tsx`
- `src/features/messaging/screens/VideoCallScreen.tsx`

## What changed

- Chat reports now pass `source: "chat"` into the existing report modal route.
- Image messages show a visible private-chat photo guard in the bubble.
- Upload progress copy clarifies that photos stay in the matched chat path.
- Unavailable voice/video call screens keep a disabled safety entry point when the member id is missing instead of hiding the option.
- Report partial-block failure copy now gives a safe retry path without displaying backend detail.

## Verification

Source inspection only by request. No tests, builds, lint, git commands, backend changes, package scripts, or `.env` files were touched.
