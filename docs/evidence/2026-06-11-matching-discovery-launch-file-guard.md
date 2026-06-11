# Matching Discovery Launch File Guard

## Status

Source update completed. The launch-file contract guard was not run in this turn by instruction.

## Changed

`scripts/check-launch-file-contract.mjs` now treats these matching/discovery UI files as launch-critical:

- `src/features/matching/screens/DiscoverScreen.tsx`
- `src/features/matching/components/ProfileCard.tsx`
- `src/features/matching/components/EmptyMatchesState.tsx`

The guard now checks for markers covering preference-based discovery, visibility-setting language, report availability, preference-fit wording, private-information warnings, and respectful empty-state safety copy.

## Why it matters

The matching/discovery safety polish is part of the launch trust story. Adding it to the file contract makes future release checks fail if these critical safety cues disappear before launch.

## Evidence still needed

- Run `npm run check:launch-file-contract` from `PM_App`.
- Run the full local release wrapper after `.env` git-index cleanup is approved.
