# PinayMate Supabase Setup Instructions

Status: launch-stage. This document is the current setup guide for Supabase-backed PinayMate environments.

## What this setup does

- Enables email/password auth with email confirmation.
- Supports password recovery through Supabase recovery emails.
- Applies production hardening migrations for profiles, matching, messaging, reporting, verification, OCR quota, and storage.
- Keeps verification documents in a private `verification-docs` bucket.
- Uses RPCs for sensitive writes such as basic info, verification submission, reporting, blocking, unmatching, OCR quota, and message creation.

## 1. Configure email auth

Supabase Dashboard -> Authentication -> Providers -> Email

- Enable Email provider.
- Enable Confirm email for staging and production.
- Configure sender/domain settings.
- Send test signup and password reset emails before launch.

Do not use an autoverify-only setup as production proof.

## 2. Configure redirect URLs

Supabase Dashboard -> Authentication -> URL Configuration

Development can include:

```text
exp://*
http://localhost:3000/*
http://localhost:8081/*
pinaymate://*
```

Staging and production must use final owned destinations:

```text
https://<staging-pinaymate-domain>/*
https://<production-pinaymate-domain>/*
pinaymate://*
```

Required redirect behavior:

- Signup verification redirects to `verification-success`.
- Password recovery redirects to `reset-password`.
- Supabase PKCE `code` callbacks are exchanged in the app before routing.
- Expo Go success is not enough for launch signoff.

## 3. Apply database migrations

Use the Supabase CLI or approved deployment process for the target environment.

Required launch migrations are listed in `supabase/LAUNCH_MIGRATION_MANIFEST.md` and include:

- `04_production_security_hardening.sql`
- `99_final_release_security_hardening.sql`
- `20260610094806_add_pinaymate_storage_buckets.sql`
- `20260610100323_add_ocr_rate_limit.sql`
- `20260610100523_add_basic_info_rpc.sql`
- `20260610112000_add_account_deletion_requests.sql`
- `20260610113000_add_privacy_settings.sql`
- `20260610114000_respect_read_receipts_privacy.sql`
- `20260610115000_respect_online_status_privacy.sql`
- `20260611120000_secure_send_message_rpc.sql`
- `20260611121000_harden_user_report_payload.sql`
- `999_restore_profile_visibility_filter.sql`
- `20260611122000_fix_discovery_privacy_read_model.sql`

After applying migrations, run:

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\04_safety_smoke_test.sql
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\05_release_preflight_audit.sql
```

Or run the same SQL in the Supabase SQL Editor with a privileged database role.

## 4. Configure OCR

The bundled OCR Edge Function requires `OCR_SPACE_API_KEY` in the target Supabase project.

The app derives the OCR function URL from `EXPO_PUBLIC_SUPABASE_URL` unless `EXPO_PUBLIC_OCR_ENDPOINT` is explicitly configured.

Required live checks:

- unauthenticated request returns 401
- valid authenticated request can process a test document
- invalid document returns a safe recoverable error
- oversized local document attempts are rejected before upload/OCR where possible
- repeated attempts hit the quota path instead of bypassing rate limits

## 5. Verify app environment

Local `.env` needs:

```text
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Never paste service-role keys into the mobile app.

## 6. Run local checks

```powershell
npm install
npm test -- --runInBand
npx tsc --noEmit
npm run lint
npm run build:web
```

## 7. Run native QA

Use `docs\testing\NATIVE_QA_SCRIPT.md`.

Minimum auth proof:

- signed-out users cannot access main tabs
- signup email returns to verification-success
- forgot-password email returns to reset-password
- new password can be saved and used for sign-in
- session restore and sign-out work after restart

## Troubleshooting

### Email signups are disabled

Enable the Email provider in Supabase Auth settings.

### Email confirmation or reset links open the wrong page

Check Supabase redirect allow list, Site URL, and `app.json` scheme/intent filters.

### Basic info fails

Confirm `save_basic_info` exists and authenticated users can execute it.

### Verification submission fails

Confirm `verification-docs` is private, storage policies allow the user's own folder, and uploaded selfie/document object paths exist before `submit_verification` runs.
The app rejects verification images over 6 MB before upload/OCR and uses generic manual-review mismatch messages instead of showing extracted identity values back to the user.

### Messages do not send

Confirm `send_message` exists, authenticated users can execute it, direct authenticated inserts on `public.messages` are revoked, and `04_safety_smoke_test.sql` plus `05_release_preflight_audit.sql` pass in the target environment.
