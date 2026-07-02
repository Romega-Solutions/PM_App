# PinayMate Redirect URL Setup

Status: launch-stage. Do not treat localhost or Expo Go URLs as production proof.

## Supabase dashboard path

Supabase Dashboard -> Authentication -> URL Configuration

Use the target project for the environment you are configuring:

- Development: local/dev Supabase project only
- Staging: staging Supabase project
- Production: production Supabase project

## Site URL

Use the real public URL for that environment.

```text
Development: http://localhost:3000
Staging: https://<staging-pinaymate-domain>
Production: https://<production-pinaymate-domain>
```

Do not leave production Site URL as localhost.

## Redirect URLs

### Development only

```text
exp://*
http://localhost:3000/*
http://localhost:8081/*
pinaymate://*
```

### Staging / production

Replace placeholders with the final deployed domains and native app callback scheme.

```text
https://<staging-pinaymate-domain>/*
https://<production-pinaymate-domain>/*
pinaymate://*
```

If universal/app links are enabled, verify the production build opens the app from the email link. Expo Go redirect success is not enough for launch signoff.

## Email provider

Supabase Dashboard -> Authentication -> Providers -> Email

- Enable Email provider.
- Enable Confirm email.
- Configure sender/domain settings for the target environment.
- Send a test verification email before launch.

## Database setup

Do not run only the old `00_complete_database_setup.sql` for launch.

Apply the ordered migration set through the Supabase CLI or approved deployment flow, including:

- `20260610090000_restore_legacy_security_primitives.sql`
- `20260611144000_final_release_security_hardening.sql`
- `20260610094806_add_pinaymate_storage_buckets.sql`
- `20260610100323_add_ocr_rate_limit.sql`
- `20260610100523_add_basic_info_rpc.sql`

Then run `supabase/tests/04_safety_smoke_test.sql` in staging and production.

## Required launch proof

- Email signup reaches the verify-email screen.
- Verification email opens the correct app/web redirect for the target environment.
- PKCE `code` callbacks are exchanged for a Supabase session before app routing.
- `verification-success` creates or finds the profile through the hardened profile path.
- Forgot-password sends a Supabase recovery email that opens `reset-password` in the app/web callback.
- Reset-password updates the password through the active recovery session and returns the user to sign-in.
- Basic info saves through `save_basic_info`.
- Production redirect evidence is captured from a production build, not only Expo Go.
