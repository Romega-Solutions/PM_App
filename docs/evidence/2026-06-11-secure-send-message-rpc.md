# Secure Send Message RPC

## Status

Source update completed. The migration, SQL smoke test, app tests, and launch contract were not run in this turn by instruction.

## Changed

`supabase/migrations/20260611120000_secure_send_message_rpc.sql`

- Added `public.send_message(uuid, text, text, text, uuid)` as the single backend-owned message creation path.
- The function derives sender identity from `auth.uid()`.
- The function validates recipient, message type, text/image payload requirements, conversation membership, mutual match, and blocked-member state through `get_or_create_conversation`.
- Revoked direct `INSERT` on `public.messages` from `authenticated`.
- Kept authenticated `SELECT` so message reads still go through RLS.

`src/features/messaging/api/messages.api.ts`

- Updated text and image sends to call `send_message` instead of directly inserting into `messages`.

`src/features/messaging/api/__tests__/messages.api.test.ts`

- Updated fixtures to use UUID-shaped IDs.
- Updated send-message expectations to assert the `send_message` RPC path and no direct table insert.

`supabase/tests/04_safety_smoke_test.sql`

- Added checks that `send_message` exists.
- Added checks that anon cannot execute `send_message`.
- Added a direct-table privilege check so authenticated users cannot insert into `messages` outside the RPC path.

`supabase/tests/05_release_preflight_audit.sql`

- Added `RPC: send_message` to the release preflight inventory.

`scripts/check-supabase-static-contract.mjs`

- Added static markers for the secure send-message migration, revoked direct inserts, app RPC usage, API tests, safety smoke checks, and release preflight inventory.

`SUPABASE_SETUP_INSTRUCTIONS.md`

- Added the secure send-message migration to required launch migrations.
- Added the release preflight audit to post-migration checks.
- Added troubleshooting for message-send failures tied to `send_message` and direct-insert revocation.

## Why it matters

Message creation is a dating-app safety boundary. The client should not own sender identity or direct inserts. This moves message creation behind a database function that derives the sender from the authenticated session and blocks writes outside the audited RPC path.

## Evidence still needed

- Run PM_App messaging API tests.
- Apply migration to staging.
- Run `supabase/tests/04_safety_smoke_test.sql` in staging.
- Run `supabase/tests/05_release_preflight_audit.sql` in staging.
- Repeat apply and checks for production after staging passes.
- Capture proof in the launch evidence packet.
