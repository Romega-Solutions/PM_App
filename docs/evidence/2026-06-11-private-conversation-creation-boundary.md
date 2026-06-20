# Private conversation creation boundary source evidence

Date: 2026-06-11
Owner: Codex
Status: Source-only evidence; not runtime proof

## What changed

- Added `supabase/migrations/20260611141000_restrict_conversation_creation_rpc.sql`.
- Added `supabase/migrations/20260611142000_hide_empty_conversations_from_inbox.sql`.
- Updated `supabase/migrations/99_final_release_security_hardening.sql` so the legacy tail migration does not re-grant direct execution.
- Updated `supabase/migrations/99_final_release_security_hardening.sql` so the app-facing conversation list excludes rows with no `last_message_id`.
- Kept `get_or_create_conversation` available as an internal `SECURITY DEFINER` helper for `send_message`.
- Denied direct execution of `get_or_create_conversation` to `PUBLIC`, `anon`, `authenticated`, and `service_role`.
- Updated `src/features/matching/screens/LikesScreen.tsx` so the match card message action opens chat without pre-creating a conversation.
- Updated `src/features/messaging/hooks/useMessages.ts` and `src/features/messaging/screens/ChatScreen.tsx` so the first successful `send_message` result can establish the active conversation ID for realtime, photo, and report context.

## Product/security reason

Matched users should not be able to create visible empty inbox rows without sending a message. Conversation creation remains tied to an actual `send_message` action.

The app flow now supports that product rule: tapping Message from a match opens the chat composer, and the backend creates the conversation only after the first valid text message is sent.

The inbox read model also supports the rule: even if an older environment or repair script has empty conversation rows, `get_user_conversations` does not return them to the Messages screen.

## Source guards added

- `supabase/tests/04_safety_smoke_test.sql` now fails if direct execution is exposed.
- `supabase/tests/05_release_preflight_audit.sql` now fails if direct execution is exposed.
- `supabase/tests/04_safety_smoke_test.sql` and `supabase/tests/05_release_preflight_audit.sql` now fail if `get_user_conversations` does not filter out empty conversation rows.
- `scripts/check-supabase-static-contract.mjs` checks the migration, legacy tail migration, and smoke/preflight markers.
- `scripts/check-supabase-static-contract.mjs` also fails if `LikesScreen` reintroduces a direct `get_or_create_conversation` client call.
- `scripts/check-launch-file-contract.mjs` now requires the private-helper migration, smoke/preflight denial markers, and the Likes-to-chat source guard.
- `scripts/check-supabase-migration-manifest.mjs` checks that the launch manifest includes the new migration and that the legacy `99_` migration remains safe.
- `docs\testing\CHAT_TESTING_GUIDE.md` and `docs\operations\SUPABASE_CHAT_INTEGRATION.md` now describe `get_or_create_conversation` as a private helper instead of a client call.
- `docs\testing\NATIVE_QA_SCRIPT.md`, `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md`, and `docs\release\PRODUCTION_OWNERSHIP_CHECKLIST.md` now include first-message conversation creation proof and the new migration boundary.

## What still must be proven

- Apply the full launch migration manifest in staging and production.
- Run `supabase/tests/05_release_preflight_audit.sql`.
- Run `supabase/tests/04_safety_smoke_test.sql`.
- Capture redacted evidence that `get_or_create_conversation` is not directly executable while `send_message` still creates conversations when a matched user sends a valid message.
- Capture redacted evidence that empty conversation rows do not appear in `get_user_conversations`.
- Run mobile QA for match card `Message` -> first text send -> Messages list -> reopen conversation -> photo/report context.
