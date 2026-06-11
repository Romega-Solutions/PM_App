# Native QA selector contract

Date: 2026-06-11
Owner: Codex

## Status

Source contract update completed. Checks were not run in this turn.

## Changed

- Added `docs/NATIVE_QA_SCRIPT.md` to the PM_App launch-file contract.
- Required the native QA script to keep the launch-state notice accessibility QA section.
- Required the native QA script to keep the default `launch-state-notice` selector.
- Required the native QA script to keep the screen-specific launch-state selectors:
  - `notification-settings-launch-state-notice`
  - `verification-upload-launch-state-notice`
  - `privacy-settings-launch-state-notice`
  - `account-preferences-launch-state-notice`
  - `discover-launch-state-notice`
  - `empty-matches-launch-state-notice`
- Required screen-reader hint and large-text readability coverage to stay documented.

## Why it matters

The reusable launch-state notice is part of the product trust layer. The QA script must continue telling native testers exactly which launch-state notices to inspect and how to verify accessibility behavior.

## Not proven

- PM_App launch-file contract was not run.
- Native QA was not run.
- No lint, typecheck, test, build, Expo, browser, Supabase, or live validation was performed.
