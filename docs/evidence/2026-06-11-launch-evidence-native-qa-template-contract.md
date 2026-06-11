# Launch evidence native QA template contract

Date: 2026-06-11
Owner: Codex

## Status

Source contract update completed. Checks were not run in this turn.

## Changed

- Updated `scripts/check-launch-evidence-contract.mjs` so the launch evidence packet must keep a reference to `docs/evidence/TEMPLATE-native-qa-proof.md`.

## Why it matters

Native QA is a release blocker. The central launch packet needs to keep the native QA proof template visible until real emulator/device evidence is captured and reviewed.

## Not proven

- PM_App launch evidence contract was not run.
- Native device or emulator QA was not run.
- No Expo, lint, typecheck, tests, build, browser, Supabase, OCR, or live validation was performed.
