# Discovery and Likes Card UX Polish

Date: 2026-06-11
Owner: Codex
Result: Source patch only

## Changed files

- `src/features/matching/components/ProfileCard.tsx`
- `src/features/matching/components/MatchCard.tsx`
- `src/features/matching/screens/DiscoverScreen.tsx`

## What changed

- Improved the discovery card no-photo state with a neutral profile glyph, review-first copy, and an accessibility label.
- Changed the discovery distance fallback from "Distance not shown" to "Approximate area" so the card remains privacy-safe without implying a broken value.
- Made likes/matches cards less cramped by using a larger minimum card height and visible action labels for Message, Report, and Unmatch.

## Verification status

- Source inspection only, per task instruction.
- Tests, builds, lint, and device/browser QA were not run.
