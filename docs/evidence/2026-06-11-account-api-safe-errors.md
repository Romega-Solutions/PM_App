# Account API Safe Errors

## Status

Source update completed. No tests, lint, typecheck, backend checks, native QA, or release gates were run in this turn by instruction.

## Changed

- `src/features/account/api/preferencesApi.ts`
  - Replaced raw Supabase preference-save errors with safe sign-in or retry messages.
- `src/features/account/api/privacyApi.ts`
  - Replaced unknown account-deletion RPC messages with safe retry copy.

## Why it matters

Preference saving and deletion requests are shared API boundaries used by multiple screens. Hardening only the screen layer is not enough; these APIs should not propagate raw database, auth, or RPC details to future callers.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test preference save and deletion request failure cases.
- Run Supabase staging smoke tests for privacy and account deletion RPCs.
