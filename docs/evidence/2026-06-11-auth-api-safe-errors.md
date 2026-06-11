# Auth API Safe Errors

## Status

Source update completed. No lint, typecheck, tests, auth smoke checks, email checks, native QA, or release gates were run in this turn by instruction.

## Changed

`src/features/auth/api/authApi.ts`

- Replaced raw Supabase signup, signin, signout, resend-verification, password-reset, and password-update errors with safe messages.
- Preserved local validation messages for missing first name and invalid account type.
- Preserved existing return shapes for signup, signin, and email/password operations.

## Why it matters

Authentication is the highest-conversion and highest-trust entry point. Future callers should not receive raw provider/auth backend errors that can leak implementation details or confuse users.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test signup, signin, signout, resend verification, forgot password, and password update failure cases.
- Confirm email verification and password reset links still route correctly.
