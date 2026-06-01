# PinayMate — Supabase schema (rebuild)

Clean, normalized (3NF) backend, authored 2026-05-30 to replace the drifted
legacy scripts (archived in `../legacy/`). The old live-schema dump is kept here
as `sql_existing_setup.md` for reference only (it is `.md`, so the CLI ignores it).

## Migration order

| File | Domain |
|------|--------|
| `20260530120001_init.sql` | Extensions, enum types, `set_updated_at()`, schema grants |
| `20260530120002_profiles.sql` | `profiles`, `match_preferences`, `profile_photos`, `interests`(+junction), `languages`(+junction), `verifications`; `handle_new_user` trigger; RLS |
| `20260530120003_matching.sql` | `swipes`, `matches`; mutual-like → match trigger; RLS |
| `20260530120004_messaging.sql` | `conversations` (1:1 with a match), `messages` (recipient derived), `message_deletions`; triggers; RLS |
| `20260530120005_safety.sql` | `blocked_users`, `reports`; RLS |
| `20260530120006_storage.sql` | Buckets `profile-photos` / `chat-images` / `verification-docs` + object policies |
| `20260530120007_read_models.sql` | Views `profiles_extended`, `conversation_list`; `get_discover_profiles()` RPC |
| `20260530120008_grants.sql` | Table/view/routine grants for `authenticated` / `service_role` |
| `../seed.sql` | Lookup data (interests, languages) — runs after migrations on `db reset` |

## How to apply

```bash
# from the PM_App/ directory
supabase init                 # if supabase/config.toml doesn't exist yet
supabase link --project-ref <your-project-ref>

# local: build the whole schema + seed from scratch
supabase db reset

# remote: push the migrations to the linked project
supabase db push

# regenerate typed client (do this after any schema change)
supabase gen types typescript --linked > src/types/database.ts
```

## Design decisions (3NF + best practice)

- **No derived columns stored.** `age` is computed from `date_of_birth`; `is_online`
  from `last_seen_at`; `is_verified` from `verifications`. All exposed via
  `profiles_extended`. Last-message / unread-count live in `conversation_list`.
- **No repeating groups.** The old `photos[]`, `interests[]`, `languages[]` arrays
  are now `profile_photos` and `interests`/`languages` lookup + junction tables.
- **Proper entities.** `swipes` (one row per direction) + `matches` (its own table,
  participants stored ordered `a < b` for a clean unique key) instead of an
  `is_match` flag. A `conversation` exists 1:1 with a `match`; a `message`'s
  recipient is derived from the conversation rather than duplicated.
- **Security.** RLS on every table; policies scoped to `auth.uid()` (wrapped in
  `(select auth.uid())` for the RLS init-plan optimization). Match/conversation
  creation runs in `security definer` triggers; cross-user reads go through
  `is_conversation_participant()`. All storage buckets are private.
- **Enums vs lookups.** Closed domains (`gender`, `message_kind`, …) are Postgres
  enums; user-growable sets (`interests`, `languages`) are lookup tables.

## ⚠️ App alignment required

The app's `src/features/*/api/*` currently targets the legacy column names and an
ad-hoc conversation model. After applying this schema, run `supabase gen types`
and reconcile the app to it (see `docs/audits/PINAYMATE_BACKEND_AUDIT_2026-05-30.md`,
Phases 1–2). Notable changes the app must adopt:

- profiles: `interested_in`/`age_min`/`age_max`/`max_distance_km` now live on
  `match_preferences`; `age` is read from `profiles_extended` (store `date_of_birth`).
- photos: write rows to `profile_photos`, not a `photos[]` column.
- chat: a conversation is created automatically on match; fetch the inbox from
  `conversation_list`; messages use `body`/`kind` and do **not** carry `recipient_id`.
- matching: insert into `swipes` (`direction`); matches appear automatically.
