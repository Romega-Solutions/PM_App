# Supabase Release Preflight Audit

## Status

Source update completed. The SQL audit was not run in this turn because no live Supabase project credentials or target environment were used.

## Added

`supabase/tests/05_release_preflight_audit.sql`

The audit file is also registered in `scripts/check-launch-file-contract.mjs` as launch-critical release content.

## What it checks

- `profile-photos` bucket exists.
- `verification-docs` bucket exists and is not public.
- `verification-docs` has storage policy coverage.
- Launch-critical RPCs exist:
  - `submit_user_report`
  - `block_user`
  - `unmatch_user`
  - `claim_ocr_attempt`
  - `save_basic_info`
  - `get_privacy_settings`
  - `save_privacy_settings`
  - `request_account_deletion`
- Launch-critical tables have RLS enabled:
  - `profiles`
  - `messages`
  - `matches`
  - `user_reports`
  - `user_blocks`
  - `privacy_settings`
  - `account_deletion_requests`
- `discoverable_profiles` exists and references `profile_visible`.

## Why it matters

The existing safety smoke test verifies behavior. This audit verifies that the expected production security objects are present before behavioral tests are interpreted as launch proof.

## Evidence still needed

- Run the audit in staging after migrations.
- Run the audit in production after migration promotion.
- Attach redacted SQL output to `docs/LAUNCH_EVIDENCE_PACKET.md`.
