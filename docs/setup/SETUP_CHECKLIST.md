# PinayMate Setup Checklist

Use this checklist for a fresh development or Supabase project setup.

## 1. Install Dependencies

```bash
npm install
```

## 2. Create `.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Leave `EXPO_PUBLIC_BYPASS_AUTH` unset unless you are doing local tester-only app
shell work.

## 3. Configure Supabase Auth

In Supabase:

1. Enable **Authentication** -> **Providers** -> **Email**.
2. Enable **Confirm email**.
3. Add redirect URLs:

```text
exp://*
pinaymate://*
http://localhost:8081/*
```

Add the production web URL when available.

## 4. Apply The Current Schema

From the project root:

```bash
supabase init
supabase link --project-ref <project-ref>
supabase db push
supabase gen types typescript --linked > src/types/database.ts
```

Do not use archived files from `supabase/legacy/` unless you are reading
history during a migration audit.

## 5. Run The App

```bash
npx expo start --clear
```

## 6. Test Signup

1. Select user type.
2. Sign up with an email and password.
3. Confirm the email link.
4. Confirm the app reaches the verification success screen.
5. Continue account setup.

## 7. Verify Locally

Before handing off setup changes:

```bash
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

## References

- `supabase/migrations/README.md` - active schema and migration order.
- `docs/setup/SUPABASE_SETUP_INSTRUCTIONS.md` - detailed Supabase setup.
- `docs/setup/EMAIL_VERIFICATION_SETUP.md` - redirect and email verification notes.
