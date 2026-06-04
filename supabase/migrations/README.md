# PinayMate — Supabase schema (app-driven)

These migrations reproduce the **live working backend the app queries**, plus the
few objects the app expects but the live DB was missing (conversations + unread
counters + `reset_unread_count`). Pushing them to a fresh Supabase project gives a
fully functional backend — discovery, likes/matches, chat (send/receive + live
delivery), the inbox + unread counts, and image uploads.

Authored 2026-06-04 to replace the earlier 3NF rebuild (which the app never
adopted). The old 3NF SQL is archived in `../legacy/`; the live-schema dump is kept
here as `sql_existing_setup.md` (it is `.md`, so the CLI ignores it).

## Migration order

| File | Contents |
|------|----------|
| `20260530120001_init.sql` | extensions (`uuid-ossp`, `pgcrypto`), `handle_updated_at()`, schema grants |
| `20260530120002_profiles.sql` | `profiles` (flat, all live columns + `last_active_at`); `handle_new_user` signup trigger; RLS |
| `20260530120003_matching.sql` | `likes` (with `is_match`/`matched_at`) + `passes`; RLS |
| `20260530120004_messaging.sql` | `conversations` (participant pair + unread counters) + `messages` (live columns + `conversation_id`); `handle_message_conversation` trigger; `get_or_create_conversation` + `reset_unread_count` RPCs; RLS; realtime publication |
| `20260530120005_storage.sql` | public buckets `profile-photos` + `chat-images` + object policies |
| `20260530120006_grants.sql` | table/sequence/function grants for `authenticated` / `service_role` |
| `../seed.sql` | no lookup data (schema is inline-text); add fixtures if desired |

## How to apply to a fresh project

```bash
# from the PM_App/ directory
supabase login                                   # browser OAuth (needs your account)
supabase link --project-ref <your-project-ref>   # prompts for the DB password
supabase db push                                 # apply all migrations to the linked project

# optional: regenerate the typed client after a schema change
supabase gen types typescript --linked > src/types/database.ts
```

`supabase/config.toml` (created by `supabase init`) must exist for the CLI commands.

## Key design points

- **App-driven, not normalized.** `profiles` is flat (mirrors the live dump); a
  match is `likes.is_match = true` (flipped by the app); messages keep the live
  `text`/`type`/`recipient_id` columns.
- **Conversations are derived.** Sending a message inserts only sender/recipient;
  a `BEFORE INSERT` trigger upserts the conversation, back-fills `conversation_id`,
  and bumps the recipient's unread counter. The inbox reads `conversations`;
  `reset_unread_count(p_conversation_id, p_user_id)` zeroes a side on open.
- **Public buckets.** Both storage buckets are public because the app uses
  `getPublicUrl()`.
- **Realtime.** `messages` is added to the `supabase_realtime` publication with
  `replica identity full` (typing/read-receipts/presence use ephemeral broadcast
  channels, so they need no DB objects).
- **Dropped (unused by the app):** `typing_events` + presence RPCs, the 3NF
  `swipes`/`matches`/lookup tables + views, safety tables, and `verification-docs`.
