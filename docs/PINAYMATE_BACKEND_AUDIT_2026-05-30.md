# 🗄️ PinayMate — Backend / Supabase Audit

**Date:** 2026-05-30
**Scope:** `supabase/migrations/*`, `supabase/functions/*`, and how the app's `*/api/*` layer maps onto the database.
**Method:** Static analysis of the committed SQL + the live-schema dump in `supabase/migrations/sql_existing_setup.md` + cross-reference against the app's Supabase calls.

> ⚠️ **Limitation:** I cannot reach the live Supabase project from here (no connection/credentials), so "live schema" below = what `sql_existing_setup.md` records (a real `information_schema` dump, 49 messages, 3 senders, Dec 2025). Re-confirm against the actual project before acting.

---

## 📊 Executive Summary

The backend's **biggest problem isn't any single table — it's drift**. There are effectively **three different schemas** that disagree with each other:

1. **The migration files** (`00_complete_database_setup.sql`, `02`, `03`) — an idealized schema.
2. **The live database** (`sql_existing_setup.md` dump) — what's actually deployed.
3. **The app code** (`features/*/api/*`) — which targets a *mix* of both, inconsistently, file by file.

Because of this, several end-to-end flows **cannot work as written**: chat/conversations depend on a table and RPCs that don't exist in the live DB, and profile reads/writes use column names that exist in some files but not in the live schema.

### Scorecard

| Area | Score | Notes |
|------|:-----:|-------|
| Schema design (per-table) | 🟢 7.5/10 | Individual tables are reasonable; constraints + indexes are thoughtful |
| RLS / security | 🟢 7/10 | RLS enabled everywhere; policies sane (a few `SECURITY DEFINER` helpers to review) |
| Migration hygiene | 🔴 2/10 | No tooling/ordering/source-of-truth; duplicated + conflicting scripts; ad-hoc `fix_*.sql` |
| App ↔ DB alignment | 🔴 2.5/10 | 3-way drift; app uses two naming conventions at once; chat deps missing in live DB |
| End-to-end readiness | 🔴 3/10 | Auth/profile partially works; **chat/conversations broken against live DB** |

---

## 🔴 Critical Findings

### B1 — `profiles` column drift (migration ≠ live ≠ app)
The same logical fields have **different names** in each layer:

| Concept | `00_complete_database_setup.sql` | Live DB (dump) | App uses… |
|---------|----------------------------------|----------------|-----------|
| Who you want | `looking_for_gender` | `interested_in` | **both** (3 files vs 1) |
| Age pref | `age_preference_min` / `_max` | `age_min` / `age_max` | **both** (3 files vs 1) |
| Distance | `distance_preference_km` | `max_distance_km` | **both** (2 files vs 1) |
| Location | `country`/`city`/`latitude`/`longitude` | `location_name`/`location_type`/`location_coordinates`(jsonb) | **both** (4 files vs 4) |
| Online state | `last_active_at`, `is_premium` | `is_online`, `last_seen`, `profile_photo` | mixed |
| Completion flag | `profile_completed` | `verification_completed` | live-style |

**Impact:** A read selecting `looking_for_gender` against the live DB returns `null`/errors; a write to `latitude` writes to a column that doesn't exist. Because *different feature modules pick different names*, some screens silently break while others work. This is the #1 end-to-end blocker for profile/matching/preferences.

### B2 — `messages` column drift: `content` vs `text`, `message_type` vs `type`
- Migration `00` defines `messages.content` + `message_type` + `receiver_id`.
- Live DB has `text` + `type` + `recipient_id` + `read_at` + `delivery_method` (no `content`, no `message_type`, no `conversation_id`, no `deleted_by`).
- App writes **both** `text` (16×) and `content` (3×) across files.

`migration 02` renames `receiver_id`→`recipient_id` (good) but never reconciles `content`→`text`. Net result: inserts using `content` fail against the live `text` column.

### B3 — Chat/conversations infra the app needs **does not exist in the live DB**
The app's `messagesApi.ts` / `conversationsApi.ts` depend on:
- a **`conversations` table** — **not in live DB** (live tables: `likes, messages, passes, profiles, typing_events`).
- RPC **`get_or_create_conversation`** — **not in live** (live has `get_conversations_for_user`, which the app does *not* call).
- RPC **`reset_unread_count`** — **not in live**.
- `messages.conversation_id`, `messages.deleted_by` — **not in live `messages`**.

So `sendTextMessage` (calls `get_or_create_conversation`), `markConversationAsRead` (calls `reset_unread_count`), and the whole conversation list (`from("conversations")`) **fail against the live DB**. This matches the prior note that "live chat was never fully wired to Supabase." The 49 existing messages use the flat `sender_id`/`recipient_id` model with no conversations layer.

### B4 — Conflicting `handle_new_user` definitions
Three different versions exist:
- `00_…setup.sql`: inserts `looking_for_gender`/`age_preference_*`, **gated on `email_confirmed_at IS NOT NULL`**, attached to INSERT **and** verify-UPDATE.
- `fix_profiles_schema.sql`: inserts only `id/email/first_name/user_type/gender`, **no email-confirm gate**, INSERT trigger only.
- `supabase/functions/create-profile-on-signup.sql`: **empty file**.

Whichever ran last wins. The app *also* upserts profiles itself in `deepLinking.ts`. Net behavior is ambiguous and depends on deploy order.

### B5 — Migrations `02` and `03` are duplicates, and `03` is broken
Both create `conversations`, `get_or_create_conversation`, `reset_unread_count`, `update_conversation_on_message`. They differ:
- `02`'s trigger uses `NEW.content` (matches migration-00 naming).
- `03`'s trigger + backfill use `NEW.text` / `recipient_id` (matches live naming).

Since `03` sorts after `02`, running them in order leaves the **`03` version installed**, which references `NEW.text`. If the table actually has `content` (per `00`), every message INSERT throws. The two files cannot both be right; they encode the same `content`/`text` confusion as B2.

---

## 🟠 High Findings

- **B6 — No migration tooling / source of truth.** These are "paste into the SQL editor" scripts with manual ordering, `IF NOT EXISTS` guards, and ad-hoc `fix_tables.sql` / `fix_missing_columns_and_tables.sql` / `fix_profiles_schema.sql`. There's no `supabase/config.toml`, no timestamped migrations, no way to know what's applied.
- **B7 — Undocumented presence/typing subsystem.** Live DB has a `typing_events` table + `upsert_typing_event`, `get_active_typing_indicators`, `cleanup_stale_presence`, `periodic_presence_cleanup`, `cleanup_expired_typing_events` functions — **none of which have a migration file** and which the app doesn't call (it uses Supabase Realtime channels in `realtimeApi.ts`). Schema exists with no code or migration backing it.
- **B8 — Empty function file.** `supabase/functions/create-profile-on-signup.sql` is 0 bytes; the real logic lives inline in `00`. Misleading.
- **B9 — Storage bucket visibility mismatch.** `02` creates `chat-images` with `public: false`; the live dump shows it `public: true` with an "Anyone can view chat images" policy. Private vs public for user-uploaded chat media is a real privacy decision — pick one deliberately.
- **B10 — Constraint vs app-validation mismatch.** DB `profiles.age CHECK (18–70)`; app `security.ts` allows age up to 100. `age_max` default 70 in live. Align the bounds.

---

## 🟡 Medium / Low

- **B11 — `SECURITY DEFINER` helpers.** `manual_verify_user(TEXT)` updates `auth.users.email_confirmed_at` and is `SECURITY DEFINER`; it's granted to `service_role`/`postgres` only (good) — keep it off `authenticated`. `get_or_create_conversation`/`reset_unread_count` are `SECURITY DEFINER` granted to `authenticated`; fine but they bypass RLS, so keep their internal checks tight.
- **B12 — RLS policy drift.** Live `messages` UPDATE policy is more nuanced (status-gated) than the migration's; another sign the live DB was hand-edited beyond the files.
- **B13 — Email-confirmation strategy is contradictory.** `00` Step 13 says "disable email confirmations," yet the app has a whole email-verification + deep-link flow. Decide: verified email or not.
- **B14 — `interests`/`bio`/`height_cm`/`body_type`/`languages` etc.** exist in migration-00 `profiles` but not in the live dump — so any UI bound to them writes to nothing.

---

## ✅ What's actually good
- Per-table constraints (`CHECK`s on enums/ranges), `UNIQUE(from_user_id,to_user_id)` on likes/passes, sensible indexes (incl. partial indexes on `is_deleted=false`, unread).
- RLS enabled on every table with owner-scoped policies.
- `updated_at` trigger pattern; auto-match concept on mutual likes; PKCE auth + deep-link verification flow.
- The `likes`/`passes`/`profiles` core (the matching domain) is the most internally consistent and is the one part with passing tests (`matchingApi.test.ts`).

---

## 🛣️ Roadmap to a working end-to-end backend

Do these **in order**. The theme: pick the **live DB as the source of truth** (it has real users + 49 real messages), regenerate canonical migrations, then make the app match it exactly.

### Phase 0 — Establish ground truth (½ day)
1. Install the Supabase CLI; link the project: `supabase link --project-ref <ref>`.
2. `supabase db pull` → generate a real baseline migration from the live DB. Commit it as `supabase/migrations/<timestamp>_baseline.sql`.
3. `supabase gen types typescript --linked > src/types/database.ts`. **This is the single highest-leverage fix** — it makes B1/B2 compile errors instead of runtime surprises.

### Phase 1 — Make the app match the live schema (1–2 days) → fixes B1, B2
4. Adopt the generated DB types in every `features/*/api/*` file (`supabase.from<...>()`), then fix each compile error. This forces one consistent naming set: `interested_in`, `age_min/age_max`, `max_distance_km`, `location_name/location_coordinates`, `is_online/last_seen`, and `messages.text/type/recipient_id`.
5. Remove the migration-style column references (`looking_for_gender`, `age_preference_*`, `latitude/longitude`, `content`, `message_type`) from the app.

### Phase 2 — Decide the chat architecture (1–2 days) → fixes B3, B5
Two options:
- **(A) Add the conversations layer to the live DB** (recommended — the app is already written for it). Write **one** corrected migration that, against the *live* `messages(text,type,recipient_id)`: adds `conversation_id` + `deleted_by`, creates `conversations`, and creates `get_or_create_conversation`/`reset_unread_count`/`update_conversation_on_message` using `NEW.text` (not `NEW.content`). Backfill the 49 messages. Delete the conflicting `02`/`03`.
- **(B) Drop the conversations layer** and refactor `conversationsApi.ts`/`messagesApi.ts` to the flat `sender_id`/`recipient_id` model + the existing `get_conversations_for_user` RPC. Less app rewrite of the DB, more app code change.

### Phase 3 — Consolidate & document (½ day) → fixes B4, B6, B7, B8
6. Delete `00/02/03/fix_*.sql/manual_verify_user.sql/cleanup_test_users.sql/test_*` from `migrations/`; keep the CLI baseline + new forward migrations only. Move dev-only scripts to `supabase/scripts/`.
7. Settle **one** `handle_new_user` (match live columns; decide the email-confirm gate per B13) and put it in a migration. Delete the empty `create-profile-on-signup.sql` or fill it.
8. Add a migration for the `typing_events`/presence subsystem so it's reproducible (or drop it if unused).

### Phase 4 — Verify end-to-end (ongoing)
9. With generated types in place: `npx tsc --noEmit` must pass (now catches schema drift). Add integration tests that hit a local `supabase start` DB for: signup→profile row, like→match, send message→conversation update, mark read→unread reset.
10. Resolve B9 (bucket public/private), B10 (age bounds), B13 (email confirmation) as explicit product decisions.

**Definition of done:** a fresh `supabase db reset` from the committed migrations produces a schema that the app's typed client compiles against with zero drift, and the four core flows pass against it.

---

## Appendix — Live schema snapshot (from `sql_existing_setup.md`)
- **Tables:** `likes`, `messages`, `passes`, `profiles`, `typing_events` (no `conversations`).
- **messages:** `id, text, sender_id, recipient_id, type, image_url, status, created_at, updated_at, is_deleted, delivery_method, read_at` (49 rows).
- **profiles:** `…, interested_in, age_min, age_max, max_distance_km, location_name, location_type, location_coordinates(jsonb), verification_selfie/document/extracted_*, is_online, last_seen, profile_photo, is_active, …`.
- **functions:** `get_conversations_for_user`, `handle_new_user`, `handle_updated_at`, `manual_verify_user`, `upsert_typing_event`, `get_active_typing_indicators`, `cleanup_stale_presence`, `periodic_presence_cleanup`, `cleanup_expired_typing_events`.
