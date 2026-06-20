# PinayMate Email Auth Flow

Status: launch-stage. This document describes the intended production-safe email verification and password recovery flows, plus the evidence required before launch.

## Current user journey

### Signup verification

```text
1. User selects account type.
2. User signs up with email and password.
3. User sees the verify-email screen.
4. User clicks the Supabase verification email.
5. Redirect opens the app or configured web callback with a Supabase PKCE `code`.
6. verification-success ensures the profile exists through ensureUserProfile.
7. User continues to account setup.
8. Basic info is saved through save_basic_info RPC.
```

### Password recovery

```text
1. User taps Forgot Password on sign-in.
2. App calls Supabase resetPasswordForEmail with the reset-password redirect.
3. User opens the recovery email.
4. Redirect opens reset-password in the app or configured web callback with a Supabase PKCE `code`.
5. User enters and confirms a new password.
6. App calls Supabase updateUser, then signs the user out.
7. User signs in again with the new password.
```

## Supabase configuration

Supabase Dashboard -> Authentication -> Providers -> Email

- Enable Email provider.
- Enable Confirm email.
- Configure sender/domain settings for the target environment.
- Keep redirect URLs environment-specific.

Supabase Dashboard -> Authentication -> URL Configuration

Development can include:

```text
exp://*
http://localhost:3000/*
http://localhost:8081/*
pinaymate://*
```

Staging/production must use final deployed destinations:

```text
https://<staging-pinaymate-domain>/*
https://<production-pinaymate-domain>/*
pinaymate://*
```

Do not use localhost as the production Site URL.

## Database setup

Launch setup must apply the ordered migration set, not just the old baseline SQL.

Required launch migrations include:

- `04_production_security_hardening.sql`
- `99_final_release_security_hardening.sql`
- `20260610094806_add_pinaymate_storage_buckets.sql`
- `20260610100323_add_ocr_rate_limit.sql`
- `20260610100523_add_basic_info_rpc.sql`

After migrations are applied, run:

```powershell
psql $env:DATABASE_URL -v ON_ERROR_STOP=1 -f .\supabase\tests\04_safety_smoke_test.sql
```

Or run the same SQL in the Supabase SQL Editor with a privileged database role.

## Verification points

### App behavior

- Signup navigates to verify-email.
- Email link opens the correct app/web callback.
- PKCE `code` callbacks are exchanged through Supabase before routing.
- `verification-success` uses `ensureUserProfile` and does not directly insert unsafe server-owned fields.
- Forgot-password sends the recovery email through Supabase instead of showing fake success.
- Password recovery links route to `reset-password`, not `verification-success`.
- Reset-password validates the new password, calls Supabase `updateUser`, and returns to sign-in.
- Basic info saves through `save_basic_info` RPC.
- Account type cannot be silently changed after setup completion.

### Database behavior

- `submit_verification` owns verification submission.
- `claim_ocr_attempt` records OCR quota use before provider calls.
- `profile-photos` bucket exists for public profile photos.
- `verification-docs` bucket is private for selfie/document review evidence.
- `04_safety_smoke_test.sql` passes in staging and production.

### Native production behavior

- Production app build handles `pinaymate://*` callbacks.
- Camera/photo permission prompts use the launch-approved copy in `app.json`.
- Expo Go success is not enough for launch signoff.

## Troubleshooting

### Email signups are disabled

Enable Email provider and Confirm email in Supabase Auth settings.

### Email does not redirect back to app

- Confirm the environment-specific redirect URL is registered.
- Confirm the production Site URL is not localhost.
- Test from a production or staging build, not only Expo Go.

### Password reset link opens the wrong screen

- Confirm `pinaymate://*` and the final web callback are in the Supabase redirect allow list.
- Confirm forgot-password uses the reset-password redirect, while signup uses verification-success.
- Ask for a fresh reset email because old recovery links can expire.

### Profile does not exist after verification

- Confirm the auth trigger and `ensureUserProfile` path are active.
- Confirm migrations have been applied in order.
- Confirm `save_basic_info` exists and authenticated users can execute it.

### Basic info fails after hardening

- Confirm `20260610100523_add_basic_info_rpc.sql` is applied.
- Confirm the app calls `save_basic_info`, not direct `profiles.update` for `user_type` or `gender`.

## Launch signoff checklist

- [ ] Email provider enabled.
- [ ] Confirm email enabled.
- [ ] Production Site URL uses the real production domain.
- [ ] Production redirect URLs include final web/native callbacks.
- [ ] Password reset email opens reset-password in the target build.
- [ ] Ordered migrations applied in staging.
- [ ] `04_safety_smoke_test.sql` passes in staging.
- [ ] Ordered migrations applied in production.
- [ ] `04_safety_smoke_test.sql` passes in production.
- [ ] Production build redirect test completed.
- [ ] Evidence copied into `docs\release\LAUNCH_SIGNOFF_CHECKLIST.md`.
