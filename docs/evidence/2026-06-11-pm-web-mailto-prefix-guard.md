# PM_Web mailto prefix guard

Date: 2026-06-11
Owner: Codex

## Status

Source guard update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/src/lib/launchEmailLinks.ts` so legal email generation uses `LEGAL_MAILTO_PREFIX`.
- Updated PM_Web product-design and local CTA guards so legal/support helper mailtos use literal prefixes.
- Added a local CTA guard to reject the template-literal `mailto:${LEGAL_EMAIL}` pattern that can confuse static mailto scanning.

## Why it matters

PM_Web mailto helpers should stay centralized and predictable for both users and source audits. Literal prefixes keep static CTA checks reliable while still allowing subject/body values to be encoded through shared helper functions.

## Not proven

- PM_Web local CTA checks were not run.
- Legal/support mailbox delivery was not tested.
- No lint, build, browser, DNS, Supabase, or live validation was performed.
