# Ticket #42: view grants and server function review

Date: 2026-11-21. Live project: PM_App `prxykmkexfovbiatylue` (Sydney). Live data comes from the read-only queries in [`live_queries.sql`](live_queries.sql), run by Kirk in the Supabase SQL Editor. No change has been made to production.

## 1. Views

Live (Q1) has one view in `public`: `discoverable_profiles` (`v`, `security_invoker=false`, owner `postgres`). No materialized views. Q3 found no rules or INSTEAD OF triggers on it. This matches the migrations.

### Grants before (live, Q2)

| role | SELECT | INSERT | UPDATE | DELETE | TRUNCATE | REFERENCES | TRIGGER |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PUBLIC | no | no | no | no | no | no | no |
| anon | no | no | no | no | no | no | no |
| **authenticated** | yes | **yes** | **yes** | **yes** | **yes** | **yes** | **yes** |

Cause: every migration that recreates the view runs `REVOKE ALL ... FROM PUBLIC, anon` and `GRANT SELECT ... TO authenticated`. None of them revokes from `authenticated`. Supabase's default privileges give `authenticated` ALL on new relations in `public`, and `GRANT SELECT` does not remove the others.

Impact today: none found. On a local rebuild, `INSERT`/`UPDATE`/`DELETE` through the view as `authenticated` fail with "Views that do not select from a single table or view are not automatically updatable" (the view has a `LEFT JOIN`), and `TRUNCATE` fails with "not a table". The grant is still wrong. The view runs as its owner, so if a later edit made it auto-updatable (for example by dropping the join), app users could write to `profiles` past row security.

### Grants after (local rebuild with this branch)

| role | SELECT | INSERT | UPDATE | DELETE | TRUNCATE | REFERENCES | TRIGGER |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PUBLIC | no | no | no | no | no | no | no |
| anon | no | no | no | no | no | no | no |
| authenticated | yes | no | no | no | no | no | no |

`security_invoker` stays `false` (intentional: the view applies the privacy flags itself).

### Underlying tables (live, Q4)

16 tables, all with RLS on. `anon` has no privilege on any of them. `authenticated` write privileges at table level are limited to `matches` (UPDATE) and `passes` (DELETE). `profiles` has column-level INSERT/UPDATE for `authenticated`. These come from the column allow-list in `20260611144000_final_release_security_hardening.sql` and match source, so no change here. So `discoverable_profiles` cannot become writable through base-table grants beyond what RLS already governs.

## 2. Server functions

**Live count: 38 functions in `public`** (no procedures, aggregates or extension functions). 37 are `SECURITY DEFINER` and 1 is `SECURITY INVOKER`. All 37 `SECURITY DEFINER` functions have `search_path=""`, and `anon` can run none of the 38. All are owned by `postgres`.

The migrations define 51 unique public functions. The 13 not live all come from `04_production_core_hardening.sql`, whose tables do not exist in production either (finding D in the ticket #31 audit). No function is live-only.

Legend: **auth** = `authenticated` can EXECUTE. **svc** = `service_role` can EXECUTE. `anon` = no for every row. Verdicts: keep / tighten grants / needs rewrite.

| # | function (args) | mode | auth | svc | purpose | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `block_user(p_blocked_user_id uuid)` | DEFINER | yes | yes | Caller blocks another user | keep |
| 2 | `can_delete_verification_document(p_object_name text)` | DEFINER | yes | yes | Storage policy helper for the caller's own verification files | keep |
| 3 | `claim_ocr_attempt(p_max_attempts integer, p_window_minutes integer)` | DEFINER | yes | yes | Per-user OCR rate limit before an ID scan | keep |
| 4 | `claim_waitlist_edge_attempt(p_client_fingerprint text, p_ip_prefix text, p_platform text, p_source text, p_max_per_hour integer)` | DEFINER | no | yes | Hourly rate limit for the waitlist Edge Function | keep |
| 5 | `clear_verification_submission()` | DEFINER | yes | yes | Caller clears their own pending verification | keep |
| 6 | `current_user_allows_read_receipts()` | DEFINER | yes | yes | Reads the caller's read-receipt setting | keep |
| 7 | `deactivate_moderation_reviewer(p_reviewer_id uuid, p_operator_id uuid, p_change_reason text)` | DEFINER | no | yes | Operator deactivates a moderation reviewer (audited) | keep |
| 8 | `delete_message_for_everyone(p_message_id uuid)` | DEFINER | yes | yes | Sender deletes a message for both users | keep |
| 9 | `delete_message_for_me(p_message_id uuid)` | DEFINER | yes | yes | Caller hides a message for themself | keep |
| 10 | `get_notification_preferences()` | DEFINER | yes | yes | Reads the caller's notification preferences | keep |
| 11 | `get_or_create_conversation(p_user1_id uuid, p_user2_id uuid)` | DEFINER | no | no | Internal helper used by `send_message` (only `postgres`) | keep |
| 12 | `get_privacy_settings()` | DEFINER | yes | yes | Reads the caller's privacy settings | keep |
| 13 | `get_user_conversations(p_user_id uuid)` | DEFINER | yes | yes | Inbox list; rejects `p_user_id <> auth.uid()` | keep |
| 14 | `handle_new_user()` | DEFINER | no | yes | Trigger on `auth.users` that creates the profile row | keep |
| 15 | `handle_updated_at()` | INVOKER | yes | yes | Trigger that sets `updated_at`; cannot be called outside a trigger | keep |
| 16 | `like_profile(p_to_user_id uuid)` | DEFINER | yes | yes | Caller likes a discoverable profile; creates a match | keep |
| 17 | `log_moderation_reviewer_change()` | DEFINER | no | yes | Trigger that writes the reviewer audit log | keep |
| 18 | `manual_verify_user(user_email text)` | DEFINER | no | yes | Operator confirms a user's email | keep |
| 19 | `mark_conversation_read(p_conversation_id uuid)` | DEFINER | yes | yes | Caller marks their own conversation read | keep |
| 20 | `mark_messages_read(p_message_ids uuid[])` | DEFINER | yes | yes | Caller marks received messages read | keep |
| 21 | `mark_pair_messages_read(p_other_user_id uuid)` | DEFINER | yes | yes | Caller marks all messages from one user read | keep |
| 22 | `pass_profile(p_to_user_id uuid)` | DEFINER | yes | yes | Caller passes on a discoverable profile | keep |
| 23 | `request_account_deletion(p_reason text, p_source text)` | DEFINER | yes | yes | Caller requests account deletion | keep |
| 24 | `reset_unread_count(p_conversation_id uuid, p_user_id uuid)` | DEFINER | **yes** | yes | Zeroes one user's unread count in a conversation; **no caller check** | **tighten grants** (this PR) |
| 25 | `review_profile_verification(profile_id uuid, status text, reviewer_note text, reviewer_id uuid, mismatch_reasons text[])` | DEFINER | no | yes | Reviewer approves or rejects a verification | keep |
| 26 | `review_user_report(p_report_id uuid, p_status text, p_severity text, p_action_taken text, p_reviewer_note text, p_reviewer_id uuid)` | DEFINER | no | yes | Reviewer decides a user report | keep |
| 27 | `save_basic_info(p_first_name text, p_last_name text, p_age integer, p_user_type text)` | DEFINER | yes | yes | Caller saves their own basic info | keep |
| 28 | `save_notification_preferences(p_push_enabled boolean, p_new_matches boolean, p_new_messages boolean, p_new_likes boolean, p_email_updates boolean)` | DEFINER | yes | yes | Caller saves notification preferences | keep |
| 29 | `save_privacy_settings(p_show_online_status boolean, p_show_distance boolean, p_read_receipts boolean, p_profile_visible boolean)` | DEFINER | yes | yes | Caller saves privacy settings | keep |
| 30 | `send_message(p_recipient_id uuid, p_content text, p_message_type text, p_image_url text, p_conversation_id uuid)` | DEFINER | yes | yes | Caller sends a message to a match | keep |
| 31 | `submit_user_report(p_reported_user_id uuid, p_reason text, p_details text, p_conversation_id uuid, p_source text)` | DEFINER | yes | yes | Caller reports another user | keep |
| 32 | `submit_verification(p_selfie_uri text, p_document_uri text, p_extracted_first_name text, p_extracted_last_name text, p_extracted_age integer, p_mismatch_reasons text[])` | DEFINER | yes | yes | Caller submits ID verification | keep |
| 33 | `submit_waitlist_signup(p_email text, p_platform text, p_source text)` | DEFINER | no | yes | Waitlist insert behind the Edge Function | keep |
| 34 | `undo_last_swipe()` | DEFINER | yes | yes | Caller undoes their last like or pass | keep |
| 35 | `unmatch_user(p_other_user_id uuid)` | DEFINER | yes | yes | Caller unmatches a user | keep |
| 36 | `update_conversation_on_message()` | DEFINER | no | yes | Trigger that updates conversation summary on new message | keep |
| 37 | `update_message_status(p_message_id uuid, p_status text)` | DEFINER | yes | yes | Recipient updates delivery/read status | keep |
| 38 | `upsert_moderation_reviewer(p_reviewer_id uuid, p_display_name text, p_reviewer_role text, p_active boolean, p_operator_id uuid, p_change_reason text)` | DEFINER | no | yes | Operator adds or updates a moderation reviewer (audited) | keep |

### Functions the ticket asked about

- `send_message`, `like_profile`, `pass_profile`, `submit_user_report`, `submit_verification`, `claim_ocr_attempt`: DEFINER, `search_path=""`, `authenticated` only (no anon). In the source bodies (checked on the local rebuild, not by reading live bodies), each reads `auth.uid()` and raises when there is no caller.
- `submit_waitlist_signup`, `claim_waitlist_edge_attempt`: `service_role` only (the waitlist Edge Function).
- `handle_new_user`: trigger function, `service_role` only. Not callable by app roles.
- `review_user_report`, `review_profile_verification`, `upsert_moderation_reviewer`, `deactivate_moderation_reviewer`: denied for `anon` and `authenticated`, `service_role` only. Confirmed live.

### `reset_unread_count` detail

Granted to `authenticated` by `02_chat_schema_updates.sql` and `03_add_conversations_table.sql`. The body zeroes the counter for `p_user_id` in `p_conversation_id` and never checks `auth.uid()`. On a local rebuild, user C (not in the conversation, and unable to SELECT it) called it for user B's conversation, and B's unread count went from 7 to 0. Impact is limited to unread counters and `updated_at`, but it writes data the caller should not touch. Nothing in PM_App or PM_Web calls it (the app uses `mark_conversation_read`), so this PR revokes EXECUTE from PUBLIC, anon and authenticated and keeps `service_role`. After the change the same call fails with `permission denied for function reset_unread_count`.

## 3. Changes in this PR

- `supabase/migrations/20261121090000_revoke_view_write_privileges.sql`: revokes INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES and TRIGGER on every public view from PUBLIC, anon and authenticated. It then sets `discoverable_profiles` back to SELECT for `authenticated` only. Grants only; no definition change.
- `supabase/migrations/20261121091000_revoke_reset_unread_count_execute.sql`: revokes `reset_unread_count(uuid, uuid)` from PUBLIC, anon and authenticated, and keeps `service_role`.
- `supabase/migrations/999_restore_profile_visibility_filter.sql`: `REVOKE ALL` also from `authenticated`. The CLI applies `999_` last on a rebuild, and it recreates the view, so without this a rebuilt database would get the write grants back after the new migration. Production already has this file applied, so the edit only affects rebuilds.
- `supabase/tests/05_release_preflight_audit.sql`: new checks fail if any public view is writable by PUBLIC/anon/authenticated, if anon can read `discoverable_profiles`, or if app roles can run `reset_unread_count`.

## 4. Local preflight run

Local Supabase (`supabase start`, Postgres 17). The rebuild used `main`, plus the rebuild fixes from PR #28 (`05_restore_archived_profile_message_columns.sql`, the `submit_user_report` DECLARE fix and `20261120090000_harden_legacy_security_definer_helpers.sql`), plus this branch. `main` alone does not rebuild (ticket #31, failures A to C).

| step | result |
| --- | --- |
| `db reset` (all migrations) | OK, about 45 s |
| `05_release_preflight_audit.sql` without the `999` fix | **FAIL**: `public views must be SELECT-only ... discoverable_profiles (authenticated: DELETE, INSERT, TRUNCATE, UPDATE)` |
| `05_release_preflight_audit.sql` before the `reset_unread_count` migration | **FAIL**: `reset_unread_count must not be executable by app clients` |
| `05_release_preflight_audit.sql` with this branch | **PASS** |
| `04_safety_smoke_test.sql` with this branch | **PASS** |
| New view migration run on a copy where `authenticated` and `anon` had ALL on the view (like production) | `authenticated` DELETE true → false, anon SELECT true → false, `authenticated` SELECT stays true |
| `npm run check:source-contracts` | PASS |

Not run against production. After Duane approves, the two new migrations apply with `supabase db push`. Then re-run Q2 and the 05 preflight on production to confirm.

## 5. For Duane

- Approve applying the two new migrations to production.
- `handle_updated_at()` is a SECURITY INVOKER trigger function that `authenticated` can EXECUTE. It cannot be called outside a trigger, so I left it. Revoke it too if you want a clean list.
- The 13 source-only functions and their tables from `04_production_core_hardening.sql` are the same open question as ticket #31 finding D. On a local rebuild those 8 tables give `anon` full privileges (RLS on). That doesn't affect production, where they don't exist.
