# Native QA proof template contract

Date: 2026-06-11
Owner: Codex

## Status

Source contract update completed. Native QA was not run in this turn.

## Changed

- Added `docs/evidence/TEMPLATE-native-qa-proof.md` to the PM_App launch-file contract.
- Required the template to keep launch-critical proof sections for:
  - runtime setup
  - onboarding and account setup
  - verification and OCR
  - discovery, matching, and profile safety
  - messaging and safety actions
  - launch-state notice accessibility
  - final native QA decision
- Required representative launch-state notice selectors to stay in the template.

## Why it matters

Native QA is one of the final production-readiness blockers. The proof template should stay complete enough to capture device/emulator evidence for the actual launch-critical flows, not just a generic smoke note.

## Not proven

- PM_App launch-file contract was not run.
- Native device or emulator QA was not run.
- No Expo, lint, typecheck, tests, build, browser, Supabase, OCR, or live validation was performed.
