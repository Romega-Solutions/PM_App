# Auth and OCR Recovery Copy

Date: 2026-06-11
Owner: Codex
Scope: PM_App auth sign-in and OCR service user-facing errors.

## What changed

- Replaced sign-in `temporarily unavailable` wording with recoverable completion language.
- Replaced OCR 5xx `temporarily unavailable` wording with `Document scan did not complete. Please try again.`
- Updated the focused OCR test expectation for the revised client-safe message.

## Why

Sign-in and verification scan failures should read like recoverable user actions, not internal availability states. The new copy keeps the user moving without exposing provider or release-status language.

## Verification

Not run in this step. Run:

```powershell
npx jest src/services/__tests__/ocrService.test.ts --runInBand --no-cache
npx jest src/features/auth/api/__tests__/authApi.test.ts --runInBand --no-cache
npm run check:user-facing-safe-errors
```

## Boundary

This is local PM_App source-copy and test-expectation work only. It does not prove OCR provider behavior, Supabase Auth availability, or native-device rendering.
