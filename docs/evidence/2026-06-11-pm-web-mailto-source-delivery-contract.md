# PM_Web mailto source and delivery contract

Date: 2026-06-11
Owner: Codex

## Status

Source contract update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/scripts/check-product-design-contract.mjs` so `PM_Web/RELEASE_CHECKLIST.md` must keep separate gates for:
  - `Mailto source audit`
  - `Mailbox delivery`
- Required the checklist to mention `npm run check:local-links:report`.
- Required the checklist to keep the helper-generated waitlist, support, and legal body boundary review language.

## Why it matters

Generated mailto body safety and real inbox deliverability are different proof types. The release checklist must not let a source audit stand in for actual waitlist/support/legal mailbox delivery.

## Not proven

- PM_Web product-design contract was not run.
- PM_Web local-link report was not run.
- Waitlist, support, and legal mailbox delivery were not tested.
- No lint, build, browser, DNS, Supabase, or live validation was performed.
