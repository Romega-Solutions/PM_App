# Auth Safe Errors

## Status

Source update completed. No tests, lint, typecheck, auth smoke checks, email checks, or native QA were run in this turn by instruction.

## Changed

- `src/features/auth/hooks/useSignIn.ts`
  - Maps common signin failures to safe, user-actionable messages.
  - Re-throws safe messages so alert UI does not display raw provider errors.
- `src/features/auth/hooks/useSignUp.ts`
  - Maps duplicate-email, password, missing metadata, and rate-limit cases to safe messages.
  - Re-throws safe messages for the signup screen.
- `src/features/auth/screens/SignInScreen.tsx`
  - Uses a safe fallback message for non-Error failures.
- `src/features/auth/screens/SignUpScreen.tsx`
  - Uses a safe fallback message for non-Error failures.

## Why it matters

Signin and signup are conversion-critical. Safe error mapping avoids exposing provider/backend details while still giving users clear next steps for wrong credentials, unverified email, duplicate email, password issues, and rate limits.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Test invalid password, unverified email, duplicate signup, weak password, and rate-limit paths.
- Verify email verification and password recovery flows still route correctly.
