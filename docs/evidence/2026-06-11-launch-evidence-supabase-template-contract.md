# Launch evidence Supabase template contract

Date: 2026-06-11
Owner: Codex

## Status

Source contract update completed. Checks were not run in this turn.

## Changed

- Updated `scripts/check-launch-evidence-contract.mjs` so the launch evidence packet must keep a reference to `docs/evidence/TEMPLATE-supabase-live-proof.md`.

## Why it matters

The launch evidence packet is the release proof index. The Supabase live-proof template should remain visible there until staging and production proof is captured, otherwise backend readiness can look tracked in docs while missing the actual capture path.

## Not proven

- PM_App launch evidence contract was not run.
- Supabase migrations, RLS policies, safety smoke SQL, OCR deployment, and notification delivery were not verified.
- No lint, typecheck, tests, builds, Expo, browser, or live validation was performed.
