# Messaging Auth User Guard

## Status

Source hardening completed. Messaging tests and live Supabase checks were not run in this turn by instruction.

## Changed

`src/features/messaging/api/messages.api.ts`

- Added a shared authenticated-user lookup before messaging database operations.
- Updated text and image sends to call the backend-owned `send_message` RPC instead of directly inserting into `messages`.
- The new `send_message` migration derives `sender_id` from `auth.uid()` and revokes direct authenticated inserts on `public.messages`.
- Updated message reads and unread counts to use the authenticated Supabase user instead of trusting the caller-provided `userId`.
- Added message limit clamping so message list queries stay between 1 and 100 rows.
- Added UUID-format guards for recipient IDs, conversation IDs, and message IDs before messaging queries and RPC calls.
- Added session checks before read-status, message-status, and delete RPC calls.

## Why it matters

The client should not be able to spoof another sender by passing a different `senderId` into the messaging API. It also should not own direct message inserts or pass malformed IDs into Supabase filter strings or RPC calls. This source hardening reduces client-side spoofing, direct-write, and malformed-ID risk before the required live Supabase RLS and RPC proof is collected.

## Still not proven

- Supabase RLS policies must still prevent unauthorized reads and writes at the database layer.
- `supabase/tests/04_safety_smoke_test.sql` still needs staging and production evidence.
- `supabase/tests/05_release_preflight_audit.sql` still needs staging and production evidence.
