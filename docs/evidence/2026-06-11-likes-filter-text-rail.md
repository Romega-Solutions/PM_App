# PM_App Likes filter text rail

Date: 2026-06-11
Owner: Codex
Status: Source updated, not run

## What changed

- Refactored `src/features/matching/components/LikesFilter.tsx` from bordered pill tabs into a lighter segmented text rail.
- Removed nested count badges and active-state shadows.
- Kept tab roles, selected state, hit slop, labels, hints, counts, and the mutual heart cue.

## Why this matters

The Likes screen already uses profile tiles. A pill-heavy filter above the grid added another layer of card-like controls. The text rail keeps filtering obvious while reducing visual weight.

## Verification

- Not run this turn.
- Recommended check when requested: `npm run check:product-design-contract` from `PM_App`.
