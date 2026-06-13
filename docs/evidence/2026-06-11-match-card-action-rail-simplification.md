# PM_App match card action rail simplification

Date: 2026-06-11
Owner: Codex
Status: Source updated, not run

## What changed

- Simplified `src/features/matching/components/MatchCard.tsx` so match status is text metadata instead of a nested pill.
- Changed Report and Unmatch from boxed secondary buttons into inline secondary actions.
- Kept Message as the primary action so the card has one clear visual button instead of three competing button boxes.
- Preserved action handlers, hit slop, accessibility labels, and accessibility hints.

## Why this matters

The Likes grid can feel dense when each profile tile contains multiple nested chips and button cards. This pass keeps the profile tile useful while making the hierarchy clearer: review the match, message first, use safety actions when needed.

## Verification

- Not run this turn.
- Recommended check when requested: `npm run check:product-design-contract` from `PM_App`.
