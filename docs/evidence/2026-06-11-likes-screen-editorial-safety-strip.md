# PM_App Likes screen editorial safety strip

Date: 2026-06-11
Owner: Codex
Status: Source updated, not run

## What changed

- Rewrote `src/features/matching/screens/LikesScreen.tsx` cleanly after the initial layout patch risked duplicating the return/style block.
- Changed the matched messaging safety note from a boxed panel into a lighter editorial strip with a vertical rule and compact heading.
- Changed the refresh matches control from a bordered pill button into a quieter inline action.
- Simplified the loading state panel so it no longer reads as another nested card before the grid loads.
- Preserved data loading, filtering, message, unmatch, report, refresh, accessibility announcements, and empty/error state behavior.

## Why this matters

The Likes screen already contains profile tiles. Surrounding those tiles with more boxed panels makes the screen feel heavy and repetitive. This pass keeps the safety guidance visible while reducing nested-card visual noise.

## Verification

- Not run this turn.
- Recommended check when requested: `npm run check:product-design-contract` from `PM_App`.
