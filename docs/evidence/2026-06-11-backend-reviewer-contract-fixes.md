# Backend Reviewer Contract Fixes

Date: 2026-06-11
Owner: Codex
Result: Source patch only - not rerun

## What changed

- Added `supabase/migrations/20260611122000_fix_discovery_privacy_read_model.sql`.
- Recreated `discoverable_profiles` as a constrained app-facing read model that can enforce `profile_visible` and online-status privacy internally while exposing only approved profile-card fields.
- Tightened `send_message` image-message handling so image messages must reference an existing `chat-images` storage object under the active conversation path.
- Updated `supabase/tests/04_safety_smoke_test.sql` so report source expectations match the hardened report RPC.
- Added explicit smoke coverage proving allowed report sources are preserved and unknown report sources normalize to `app`.
- Updated `supabase/tests/04_safety_smoke_test.sql` so matched and blocked message behavior uses the `send_message` RPC instead of direct `messages` inserts.
- Added smoke coverage for forged external chat image URLs and missing chat image storage objects.
- Updated `supabase/tests/05_release_preflight_audit.sql` to reject the stale `security_invoker=true` discovery-view shape.
- Updated launch/static contract scripts and release docs to include the final discovery privacy migration and the complete launch migration list.
- Added `supabase/LAUNCH_MIGRATION_MANIFEST.md` as the canonical ordered migration list for staging and production proof.

## Why it matters

The backend review found source-level launch blockers where tests and docs no longer matched the hardened backend contract. These patches align the source contract with the current privacy, messaging, and report-safety model before any staging or production migration is attempted.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run `npm run check:source-contracts`.
- Run the Supabase static contract check.
- Apply migrations to a local or staging database.
- Run `supabase/tests/05_release_preflight_audit.sql`.
- Run `supabase/tests/04_safety_smoke_test.sql` with the two-user smoke data path.
