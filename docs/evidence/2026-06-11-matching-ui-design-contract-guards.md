# PM_App matching UI design contract guards

Date: 2026-06-11
Owner: Codex
Status: Source guard updated, not run

## What changed

- Updated `scripts/check-product-design-contract.mjs` so the PM_App matching surfaces require the new lighter UI patterns.
- Added markers for the Likes screen editorial safety strip, Likes filter text rail, MatchCard inline secondary actions, EmptyMatchesState inline safety note, and ProfileDetailsModal editorial lists/safety rail.
- Added per-file forbidden markers to block the old local card/chip-heavy patterns from returning.
- Replaced the old EmptyMatchesState contract that expected `LaunchStateNotice`.

## Why this matters

The recent matching UI cleanup should be durable. The product-design contract now protects against reverting to nested notices, pill-heavy filters, status chips, and boxed safety panels.

## Verification

- Not run this turn.
- Recommended check when requested: `npm run check:product-design-contract` from `PM_App`.
