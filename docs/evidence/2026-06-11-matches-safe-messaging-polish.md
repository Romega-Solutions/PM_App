# Matches Safe Messaging Polish

## Status

Source update completed. No tests, lint, typecheck, native runtime QA, or accessibility tooling were run in this turn by instruction.

## Changed

- `src/features/matching/screens/LikesScreen.tsx`
  - Added a matched-messaging safety note.
  - Replaced raw conversation RPC/runtime error messages with a safe recovery message.
- `src/features/matching/components/MatchCard.tsx`
  - Changed verified-match wording to "Verification reviewed" so the UI does not imply guaranteed safety.
- `src/features/matching/components/LikesFilter.tsx`
  - Added expanded hit areas and accessibility hints to match filter tabs.

## Why it matters

The matches screen is where browsing becomes conversation. This update keeps the flow conversion-friendly while setting expectations that conversations are match-gated, private details should stay private, and report/unmatch controls are available.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Native-test match opening, conversation failure handling, report, and unmatch.
- Confirm screen-reader order for the safety note and card actions.
