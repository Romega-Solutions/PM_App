# App-driven Supabase migrations — portable backend

**Date:** 2026-06-04
**Status:** Design (awaiting review)
**Branch:** `feat/design-system-overhaul`

## Goal

Make `supabase/migrations/` a **complete, self-contained source of truth** so that
running `supabase db push` against a *fresh, empty* Supabase project recreates
everything PinayMate needs and the **whole app works end-to-end** — discovery,
likes/matches, chat (send/receive + live delivery), the messages inbox + unread
counts, and image uploads. The backend must be portable: switch the app's
`EXPO_PUBLIC_SUPABASE_URL`/`ANON_KEY` to the new project and it just works.

## Problem

Three schemas are currently in conflict:

1. **Live DB** (`supabase/migrations/sql_existing_setup.md`, a real dump) — denormalized:
   `profiles` (flat), `likes`, `passes`, `messages` (`text`/`type`/`recipient_id`),
   `typing_events`. No `conversations` table.
2. **The migrations folder** (8 files, the 2026-05-30 "3NF rebuild") — normalized:
   `swipes`, `matches`, `conversations` (keyed by `match_id`, `body`/`kind` messages),
   `match_preferences`, `profile_photos`, `interests`/`languages` lookups. Its own
   README says "App alignment required." **The app does not use any of this.**
3. **The app code** (`src/features/*/api/*`) — queries the *live-style* schema, plus a
   few objects that exist in **neither** of the above (real gaps causing partial breakage).

Pushing the current migrations to a fresh project would break the app entirely.

### What the app actually queries (verified in `src/`)

| Object | Used by | Shape the app expects |
|--------|---------|-----------------------|
| `profiles` (flat) | everywhere | live columns **+ `last_active_at`** (read by matching + inbox; live only had `last_seen`) |
| `likes` | `matchingApi` | `from_user_id`, `to_user_id`, `is_match`, `matched_at`, `created_at` |
| `passes` | `matchingApi` | `from_user_id`, `to_user_id`, `created_at` |
| `messages` | `messagesApi` | live cols `text`/`sender_id`/`recipient_id`/`type`/`image_url`/`status`/`read_at`/`delivery_method`/`is_deleted`/`created_at`/`updated_at` **+ `conversation_id`** (used by `getMessagesByConversationId`, `markConversationAsRead`) |
| `conversations` **(gap)** | `conversationsApi` | `participant_1_id`, `participant_2_id`, `participant_1_unread_count`, `participant_2_unread_count`, `updated_at`; embeds profiles via FK names `conversations_participant_1_id_fkey`/`_2_` |
| `reset_unread_count` RPC **(gap)** | `messagesApi:214` | signature `(p_conversation_id uuid, p_user_id uuid)` |
| `chat-images` bucket | `messagesApi` | **public** (uses `getPublicUrl`); upload path `<conversationId>/<file>` |
| `profile-photos` bucket | `profileApi` | **public** (uses `getPublicUrl`); upsert uploads |
| Realtime on `messages` | `realtimeApi` | `postgres_changes` INSERT+UPDATE on `public.messages` |

Typing / read-receipts / presence use **ephemeral Realtime broadcast channels** — no DB
table. The inbox refetches via TanStack Query invalidation — it does not subscribe to
`conversations`.

## Approach (chosen)

**App-driven, close the gaps.** Reconstruct the canonical schema from what `src/`
actually queries + the live dump (not a `supabase db pull`, which would only surface
cruft the app doesn't use). Rewrite the existing 8 migration files **in place** (same
filenames/structure for clean diffs) to the app-driven schema, and add the missing
objects so the *whole* app — including the inbox and live chat — works on a fresh push.

The migrations conform to the app; **the app code is not changed** (the one mismatch,
`profiles.last_active_at`, is closed by adding the column).

## Canonical schema

### `public` tables

- **`profiles`** — flat/denormalized, all live columns from the dump (identity, `user_type`,
  `gender`, `age`, completion flags, `photos[]`, `profile_photo`, location_*, verification_*,
  `interested_in`/`age_min`/`age_max`/`max_distance_km`, `relationship_goal`, `is_online`,
  `is_active`) **+ `last_active_at timestamptz default now()`**. `id` references `auth.users`.
- **`likes`** — `id`, `from_user_id`, `to_user_id`, `is_match bool default false`,
  `matched_at timestamptz`, `created_at`. `unique(from_user_id, to_user_id)`; FKs → `profiles`.
- **`passes`** — `id`, `from_user_id`, `to_user_id`, `created_at`. `unique(from_user_id, to_user_id)`.
- **`messages`** — live columns exactly (`text`, `sender_id`, `recipient_id`, `type text default 'text'`,
  `image_url`, `status text default 'sent'`, `read_at`, `delivery_method text default 'database'`,
  `is_deleted bool default false`, `created_at`, `updated_at`) **+ `conversation_id uuid references conversations(id)`**.
  All 10 live indexes reproduced.
- **`conversations`** *(new — closes inbox gap)*:
  ```sql
  id uuid pk, 
  participant_1_id uuid not null references profiles(id) on delete cascade,  -- conversations_participant_1_id_fkey
  participant_2_id uuid not null references profiles(id) on delete cascade,  -- conversations_participant_2_id_fkey
  participant_1_unread_count int not null default 0,
  participant_2_unread_count int not null default 0,
  last_message text, last_message_at timestamptz,
  created_at, updated_at,
  check (participant_1_id < participant_2_id), unique(participant_1_id, participant_2_id)
  ```
  Declaring the columns `participant_1_id`/`participant_2_id` gives Postgres the exact
  default FK names the app's embedded select depends on.

### Functions & triggers

- **`handle_new_user()`** — `AFTER INSERT` on `auth.users` → insert a `profiles` row.
- **`handle_updated_at()`** — generic `BEFORE UPDATE` bumping `updated_at`; attached to
  `messages` (`messages_updated_at`), `conversations`, `profiles`.
- **`handle_message_conversation()`** — `BEFORE INSERT` on `messages` (SECURITY DEFINER):
  orders pair `least/greatest(sender_id, recipient_id)`; `INSERT … ON CONFLICT (pair)
  DO UPDATE` the conversation's `last_message`/`last_message_at`/`updated_at`
  `RETURNING id`; sets `new.conversation_id`; increments the **recipient's** unread counter.
- **`reset_unread_count(p_conversation_id uuid, p_user_id uuid)`** — SECURITY DEFINER;
  zeroes the calling user's unread counter on that conversation.

### RLS

RLS enabled on every table; predicates wrapped in `(select auth.uid())` (init-plan optimization).

- **`profiles`** — public/authenticated read (discovery); self-write (`id = auth.uid()`).
- **`likes`/`passes`** — read rows involving you; insert only with `from_user_id = auth.uid()`;
  update own likes (for the `is_match` mutual-match flip).
- **`messages`** — copied from the live dump: SELECT/INSERT/UPDATE scoped to
  `sender_id`/`recipient_id`, soft-delete via `is_deleted`, read-status transitions.
- **`conversations`** — participant-only SELECT (`auth.uid() in (participant_1_id, participant_2_id)`).
  Clients never write the table directly — the SECURITY DEFINER trigger + RPC do.

### Storage (buckets + object policies)

- **`chat-images`** — `public = true`. Public `SELECT`; authenticated `INSERT`; owner
  `DELETE` (`owner = auth.uid()`). Upload folder = `conversationId`.
- **`profile-photos`** — `public = true`. Public `SELECT`; owner `INSERT`/`UPDATE`/`DELETE`
  scoped to own folder (supports the app's `upsert: true`).
- No dependency on dropped helpers; no `verification-docs` bucket.

### Realtime

```sql
alter table public.messages replica identity full;             -- full row payloads on UPDATE
alter publication supabase_realtime add table public.messages;  -- drives the chat screen subscription
```
Only `messages` is published. Nothing else needs realtime.

### Extensions & grants

- Extensions: `uuid-ossp` (the live `profiles.id` default is `uuid_generate_v4()`; new tables use `gen_random_uuid()`).
- Schema + table/routine grants for `authenticated` and `service_role`.

## File layout (rewritten in place)

| File | Contents |
|------|----------|
| `20260530120001_init.sql` | extensions, `handle_updated_at()`, schema grants |
| `20260530120002_profiles.sql` | `profiles` (flat) + `handle_new_user` trigger + indexes + RLS |
| `20260530120003_matching.sql` | `likes` + `passes` + indexes + RLS |
| `20260530120004_messaging.sql` | `conversations` + `messages` (live cols + `conversation_id`) + `handle_message_conversation` trigger + `reset_unread_count` RPC + indexes + RLS + realtime publication |
| `20260530120005_storage.sql` | `chat-images` + `profile-photos` buckets (public) + object policies |
| `20260530120006_grants.sql` | table/view/routine grants |
| `supabase/seed.sql` | trimmed — no lookup-table seeding (those tables are gone) |
| `supabase/config.toml` | **new** (`supabase init`) — required for `db push`/`db reset`; `project_id = "pinaymate"` |
| `supabase/migrations/README.md` | rewritten to describe the real (app-driven) schema |

The old `120005_safety.sql` and `120007_read_models.sql` are removed (their objects are
dropped — see below). The 8-file set collapses to 6.

## Dropped (YAGNI — app references none of these)

`typing_events`; presence/cleanup RPCs (`cleanup_expired_typing_events`,
`cleanup_stale_presence`, `periodic_presence_cleanup`, `upsert_typing_event`,
`get_active_typing_indicators`, `get_conversations_for_user`); the 3NF
`swipes`/`matches`/`match_preferences`/`profile_photos`/`interests`/`languages`
tables, their views (`profiles_extended`, `conversation_list`), `get_discover_profiles()`
RPC, `message_deletions`, and `is_conversation_participant()`; `blocked_users`/`reports`
(safety tables — no app code references them); `verification-docs` bucket + verification
tables (OCR is mocked, unused).

The previous 3NF SQL stays archived in `supabase/legacy/` and the live dump remains as
`supabase/migrations/sql_existing_setup.md` (`.md` → CLI ignores it) for reference.

## Validation

Per the user's preference, validate by **reading the SQL**, not by spinning up Docker /
local Supabase. Checks:

- Every table/column/RPC/bucket the app touches (table above) exists in the migrations.
- Migration files apply in filename order with no forward references (e.g. `messages.conversation_id`
  references `conversations`, so `conversations` is created first within `120004`).
- `getPublicUrl` buckets are `public = true`.
- `messages` is in the realtime publication with `replica identity full`.
- App test suite (`jest`) and `tsc --noEmit` still green (no app-code changes expected).

Optionally, the user runs `supabase db push` against a throwaway project to confirm a clean apply.

## Out of scope

- Migrating the app to the normalized 3NF model (a future backend-audit phase).
- Real OCR / verification backend.
- Data migration from the existing live project (this is a schema/portability task; the
  fresh project starts empty + `seed.sql`).
