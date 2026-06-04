# PinayMate Supabase Setup

This is the current setup guide. The old paste-into-SQL scripts were archived
under `supabase/legacy/`; do not use them for a fresh project.

## What This Sets Up

- Email sign-up with email confirmation enabled.
- The normalized Supabase schema from `supabase/migrations/202605301200*.sql`.
- Seed lookup data from `supabase/seed.sql`.
- Private storage buckets and row-level security policies.
- Type generation for the app after schema changes.

## 1. Configure Environment Variables

Create `.env` in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Only use the public anon key. Never put a service-role key in an
`EXPO_PUBLIC_*` variable.

## 2. Configure Supabase Auth

In the Supabase dashboard:

1. Go to **Authentication** -> **Providers** -> **Email**.
2. Enable the Email provider.
3. Enable **Confirm email**. The app's current primary flow expects email verification.
4. Save changes.

Do not disable email confirmation for the normal app flow. If you need a tester
shortcut, use `EXPO_PUBLIC_BYPASS_AUTH=true` locally only.

## 3. Configure Redirect URLs

In **Authentication** -> **URL Configuration**, add redirect URLs for every
environment you use:

```text
exp://*
pinaymate://*
http://localhost:8081/*
```

If Expo prints a different local URL from `Linking.createURL`, add that exact
origin too. For production web, set the Site URL to the deployed Vercel URL and
add that URL as an allowed redirect. The native app scheme is `pinaymate`
(`app.json`).

## 4. Apply Database Migrations

Use the Supabase CLI from the project root:

```bash
supabase init
supabase link --project-ref <project-ref>
supabase db push
supabase gen types typescript --linked > src/types/database.ts
```

For a local database reset:

```bash
supabase db reset
```

Migration order and schema notes are documented in
`supabase/migrations/README.md`.

## 5. Verify The Schema

Run this in the Supabase SQL editor:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'match_preferences',
    'profile_photos',
    'swipes',
    'matches',
    'conversations',
    'messages',
    'verifications'
  )
order by table_name;
```

Expected: the tables above exist. If they do not, check the `supabase db push`
output before debugging the app.

## 6. Test The Email Flow

```bash
npx expo start --clear
```

1. Select a user type.
2. Create an account with email and password.
3. Confirm the verification email.
4. The app should route through the email verification success screen and then
   continue account setup.

## Troubleshooting

### Email signups are disabled

Enable the Email provider in Supabase Authentication settings.

### Email link does not return to the app

Check the redirect URLs. In development, add the exact URL printed by the app
for the verification redirect, plus `exp://*` for Expo Go.

### Profile or chat queries fail after migration

Regenerate types and reconcile the app code with the active schema:

```bash
supabase gen types typescript --linked > src/types/database.ts
```

See `docs/audits/PINAYMATE_BACKEND_AUDIT_2026-05-30.md` for the schema-drift
history and `supabase/migrations/README.md` for the current schema contract.
