# PinayMate Supabase Setup Checklist

Status: launch-stage. This checklist is for environment setup only. Use `docs\release\RELEASE_READINESS.md` and `docs\release\LAUNCH_SIGNOFF_CHECKLIST.md` for release approval.

## 1. Enable email auth

Supabase Dashboard -> Authentication -> Providers -> Email

- Enable the Email provider.
- Enable Confirm email for staging and production.
- Configure the sender/domain for the target environment.
- Do not use autoverify as launch proof.

## 2. Configure auth redirects

Supabase Dashboard -> Authentication -> URL Configuration

Development can include:

```text
exp://*
http://localhost:3000/*
http://localhost:8081/*
pinaymate://*
```

Staging and production must use owned destinations:

```text
https://<staging-pinaymate-domain>/*
https://<production-pinaymate-domain>/*
pinaymate://*
```

Required callback behavior:

- Signup verification opens `verification-success`.
- Forgot-password opens `reset-password`.
- Production evidence must come from a staging/production build, not only Expo Go.

## 3. Apply database migrations

Do not run only `00_complete_database_setup.sql` for launch.

Apply the ordered migration set through the Supabase CLI or approved deployment flow, including:

- `04_production_security_hardening.sql`
- `99_final_release_security_hardening.sql`
- `20260610094806_add_pinaymate_storage_buckets.sql`
- `20260610100323_add_ocr_rate_limit.sql`
- `20260610100523_add_basic_info_rpc.sql`

Then run:

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\04_safety_smoke_test.sql
```

Or run the same SQL in Supabase SQL Editor with a privileged database role.

## 4. Verify app configuration

Local `.env` needs:

```text
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

`EXPO_PUBLIC_OCR_ENDPOINT` is optional when using the bundled Supabase OCR Edge Function because the app derives it from `EXPO_PUBLIC_SUPABASE_URL`.

## 5. Run local checks

```powershell
npm install
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npm run build:web
```

## 6. Required launch proof

- Email signup reaches the verify-email screen.
- Verification email opens the correct target callback.
- Forgot-password sends a Supabase recovery email.
- Recovery email opens `reset-password` and updates the password.
- Basic info saves through `save_basic_info`.
- Verification evidence uses private `verification-docs` storage paths.
- OCR is authenticated, quota-limited, and deployed with `OCR_SPACE_API_KEY`.
- Native QA passes on a real device or emulator.

## Troubleshooting

### Email signups are disabled

Enable the Email provider in Supabase Auth settings.

### Verification or reset email does not return to the app

Check the redirect allow list, the production Site URL, and the app scheme in `app.json`.

### Basic info fails after hardening

Confirm `20260610100523_add_basic_info_rpc.sql` is applied and the app is calling `save_basic_info`.

### Verification submission fails

Confirm the `verification-docs` bucket exists, is private, and contains the user's uploaded selfie/document objects before `submit_verification` runs.
