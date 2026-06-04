# Fix Database Schema Errors

Use this guide when the app reports missing tables or columns from Supabase.

## Current Source Of Truth

The active schema is the timestamped migration set in `supabase/migrations/`.
The old one-off SQL files are archived in `supabase/legacy/` and should not be
used for fresh setup.

Start with:

```bash
supabase init
supabase link --project-ref <project-ref>
supabase db push
supabase gen types typescript --linked > src/types/database.ts
```

Migration order and table responsibilities are documented in
`supabase/migrations/README.md`.

## If The App Reports Missing Tables

Check that the active schema was applied:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
order by table_name;
```

Expected app-facing tables include `profiles`, `match_preferences`,
`profile_photos`, `swipes`, `matches`, `conversations`, `messages`, and
`verifications`.

## If The App Reports Missing Columns

Regenerate types after every schema change:

```bash
supabase gen types typescript --linked > src/types/database.ts
```

Then compare the failing query with the current migrations. Common historical
drift is documented in `docs/audits/PINAYMATE_BACKEND_AUDIT_2026-05-30.md`.

## If You Need To Rebuild Local Supabase

For local development only:

```bash
supabase db reset
```

This rebuilds from the timestamped migrations and `supabase/seed.sql`.

## If Errors Persist

1. Check Supabase Dashboard -> Logs -> Postgres Logs.
2. Check the generated `src/types/database.ts` matches the linked project.
3. Confirm the app code targets the current normalized schema, not legacy column
   names from `supabase/legacy/`.
