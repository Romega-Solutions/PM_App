# Enable PinayMate Email Auth

Status: launch-stage. This is the current email-auth setup path for staging and production.

## Fix: Email signups are disabled

Supabase Dashboard -> Authentication -> Providers -> Email

1. Enable the Email provider.
2. Enable Confirm email for staging and production.
3. Save the provider settings.
4. Configure sender/domain settings for the environment.

Do not disable confirmation as a launch shortcut. The app expects signup verification and password recovery emails to return through configured redirects.

## Required redirect allow list

Supabase Dashboard -> Authentication -> URL Configuration

Development:

```text
exp://*
http://localhost:3000/*
http://localhost:8081/*
pinaymate://*
```

Staging and production:

```text
https://<staging-pinaymate-domain>/*
https://<production-pinaymate-domain>/*
pinaymate://*
```

Expected behavior:

- Signup email opens `verification-success`.
- Forgot-password email opens `reset-password`.
- Reset links can expire, so always test with a fresh email.

## Database setup

For launch, apply the ordered migrations. Do not rely on the old baseline SQL alone.

Required hardening migrations include:

- `20260610090000_restore_legacy_security_primitives.sql`
- `20260611144000_final_release_security_hardening.sql`
- `20260610094806_add_pinaymate_storage_buckets.sql`
- `20260610100323_add_ocr_rate_limit.sql`
- `20260610100523_add_basic_info_rpc.sql`

After applying migrations, run `supabase/tests/04_safety_smoke_test.sql` in staging and production.

## Local retest

```powershell
npx expo start --clear
```

Then test:

- Signup sends verification email.
- Verification link returns to the app.
- Forgot-password sends recovery email.
- Recovery link returns to reset-password.
- New password can be saved and used to sign in.
