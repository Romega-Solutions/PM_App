# PM_Web launch-claim helper regex hardening

Date: 2026-06-11
Owner: Codex

## Status

Source guard update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/scripts/check-launch-claims.mjs` to avoid brittle source-window coupling between mailto boundary constants and helper function names.
- Split support email validation into:
  - boundary copy exists
  - `buildSupportEmailHref` uses launch and sensitive-data boundary constants
- Added a waitlist helper check proving `buildWaitlistEmailHref` uses both launch and data boundary constants.

## Why it matters

The PM_Web mailto helper refactor intentionally centralizes waitlist/support/legal copy. Launch-claim guards should verify the helper architecture directly without failing because constants and helper functions are separated in the file.

## Not proven

- PM_Web launch-claims audit was not run.
- PM_Web lint, build, browser, mailbox, DNS, Supabase, or live validation was not performed.
