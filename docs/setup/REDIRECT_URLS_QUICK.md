# Quick Redirect URL Setup

## Supabase Dashboard

Open your project in Supabase, then go to **Authentication** -> **URL
Configuration**.

---

## Site URL

Use the production Vercel URL when deployed. For local web development, use the
Expo web origin, usually `http://localhost:8081`.

---

## Redirect URLs

Add these for development/native testing:

```
exp://*
pinaymate://*
http://localhost:8081/*
```

If Expo logs a different verification redirect URL from `Linking.createURL`, add
that exact origin too.

## Email Provider

1. Go to: **Authentication** → **Providers** → **Email**
2. **ENABLE** Email provider toggle
3. **ENABLE** "Confirm email" toggle
4. Click **Save**

## Database Setup

Use the current timestamped migrations, not archived legacy SQL:

```bash
supabase init
supabase link --project-ref <project-ref>
supabase db push
supabase gen types typescript --linked > src/types/database.ts
```

## Test Signup

```bash
npx expo start --clear
```

Then:

1. Sign up with your email
2. Check inbox for verification link
3. Click link → app should open
4. Continue account setup after verification.
