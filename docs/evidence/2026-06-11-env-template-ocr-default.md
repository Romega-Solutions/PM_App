# Env template OCR default

Date: 2026-06-11
Owner: Codex

## What changed

- Updated `.env.example` so `EXPO_PUBLIC_OCR_ENDPOINT` is blank by default.
- Kept comments explaining that the app derives the bundled Supabase OCR function URL from `EXPO_PUBLIC_SUPABASE_URL`.
- Clarified README setup guidance so `.env` is ignored for new local files but a previously tracked `.env` still requires approved git-index cleanup and rotation review.

## Why it matters

- The safest default is to use the authenticated bundled Supabase OCR Edge Function URL derived from the project URL.
- A custom OCR endpoint should be explicit because it must validate the Supabase bearer token before processing ID images.
- This gives engineers a safe template to use once the tracked `.env` blocker is approved for cleanup.

## Verification status

- Template and README were patched locally.
- No real `.env` values were read or printed.
- `npm run check:secret-hygiene`, `npm run check:local-quality`, and live OCR checks were not run after this change.
