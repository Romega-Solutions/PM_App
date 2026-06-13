# PM_App empty matches editorial state

Date: 2026-06-11
Owner: Codex
Status: Source updated, not run

## What changed

- Replaced the nested `LaunchStateNotice` usage in `src/features/matching/components/EmptyMatchesState.tsx` with a lightweight inline safety note.
- Removed the extra guidance chip row so the empty/error state does not stack pills inside another matching surface.
- Kept the empty, filtered, and error variants, retry action, accessibility label, and mutual-match safety guidance.
- Updated error copy to say the match list stays unchanged while retrying.

## Why this matters

The Likes screen already has profile tiles and safety guidance. The empty state should feel calm and clear, not like another card-within-card pattern. This keeps the state useful while reducing visual clutter.

## Verification

- Not run this turn.
- Recommended check when requested: `npm run check:product-design-contract` from `PM_App`.
