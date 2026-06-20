# Auth Redirect Contract

## Status

Source update completed. The auth redirect contract was not run in this turn.

## Added

`scripts/check-auth-redirect-contract.mjs`

## What it checks

- Supabase public env variable names are referenced.
- Email verification uses `/(auth)/verification-success`.
- Password reset uses `/(auth)/reset-password`.
- Supabase auth uses persisted sessions, URL session detection, and PKCE.
- Expo scheme is `pinaymate`.
- iOS and Android identifiers match the Romega package naming.
- Android intent filter includes `/auth/v1/verify`.
- Verification-success and reset-password route files exist.

## Why it matters

Signup verification and password recovery are launch-critical conversion and retention flows. This contract catches config drift before native QA or production Supabase redirect testing.

## Evidence still needed

- Run `node scripts/check-auth-redirect-contract.mjs`.
- Confirm Supabase Site URL and redirect URLs in staging and production.
- Native-test verification and password recovery links.

`docs\testing\NATIVE_QA_SCRIPT.md` now includes explicit email verification link routing coverage.
