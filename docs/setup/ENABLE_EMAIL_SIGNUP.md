# Enable Email Signup In Supabase

Use this only when Supabase returns:

```text
AuthApiError: Email signups are disabled
```

## Fix

1. Open your Supabase dashboard.
2. Go to **Authentication** -> **Providers** -> **Email**.
3. Enable the Email provider.
4. Keep **Confirm email** enabled for the current PinayMate auth flow.
5. Save changes.

The app expects a verified-email flow. New users should see the Verify Email
screen after signup, click the email link, then continue to account setup.

## Also Check Redirect URLs

In **Authentication** -> **URL Configuration**, allow the environments you use:

```text
exp://*
pinaymate://*
http://localhost:8081/*
```

Add the production Vercel URL when deploying web.

## Database Setup

Do not run archived one-off SQL scripts. Current schema setup uses the
timestamped migrations:

```bash
supabase init
supabase link --project-ref <project-ref>
supabase db push
supabase gen types typescript --linked > src/types/database.ts
```

See `supabase/migrations/README.md` for migration order and schema notes.
