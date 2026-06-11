# Launch Contract Messaging Auth Guard

## Status

Source update completed. `check-launch-file-contract` was not run in this turn by instruction.

## Changed

`scripts/check-launch-file-contract.mjs`

- Updated the Supabase release preflight marker from `privacy_settings` to `user_privacy_settings`.
- Added messaging API markers for:
  - `getAuthenticatedUserId`
  - `send_message`
  - `p_recipient_id`
  - `clampMessageLimit`
  - `assertUuid`
- Added launch-critical file markers for `supabase/migrations/20260611120000_secure_send_message_rpc.sql`.
- Added smoke-test markers for `public.send_message(uuid, text, text, text, uuid)` and revoked authenticated direct inserts.

## Why it matters

The static launch contract should protect the current launch-critical source requirements. Without this update, the contract would keep expecting the stale privacy table name and would not guard the new messaging auth-user, secure-send RPC, direct-insert revoke, and ID-format hardening.

## Evidence still needed

- Run `npm run check:launch-file-contract`.
- Run `npm run check:source-contracts`.
