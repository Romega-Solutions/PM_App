# Supabase Preflight Privacy Table Contract

## Status

Source fix completed. The SQL preflight was not run in this turn by instruction.

## Changed

`supabase/tests/05_release_preflight_audit.sql`

- Updated the RLS table check from `privacy_settings` to `user_privacy_settings`.
- Kept the RPC checks for `get_privacy_settings` and `save_privacy_settings` unchanged.

## Why it matters

The migrations create `public.user_privacy_settings`, so the release preflight must check the same table name. Otherwise the launch evidence can fail for the wrong reason even when the intended privacy table exists.

## Evidence still needed

- Run the Supabase release preflight against staging.
- Run the Supabase release preflight against production after staging passes.
- Attach outputs to the launch evidence packet.
