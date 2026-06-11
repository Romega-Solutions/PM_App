# Matching Discovery UX Pass

Date: 2026-06-11
Owner: Codex sub-agent
Result: Source patch only - not rerun

## Changed files

- `src/features/matching/components/ProfileCard.tsx`
- `src/features/matching/components/MatchCard.tsx`
- `src/features/matching/components/EmptyMatchesState.tsx`
- `src/features/matching/screens/DiscoverScreen.tsx`
- `src/features/matching/screens/LikesScreen.tsx`

## What changed

- Improved discovery profile cards with clearer metadata, relationship goal or occupation, verification state, and fallback copy when interests are missing.
- Improved match-card hierarchy with mutual or matched status, matched-date copy, and more space for metadata before actions.
- Improved Discover loading and empty states with structured panels, trust cues, safer next actions, and better visual containment.
- Improved Likes/Matches loading and empty states with guidance chips and maintained large touch targets.
- Preserved control-first accessibility so nested actions stay individually reachable.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run PM_App typecheck/lint/tests.
- Run native discovery, likes, and matches QA.
- Confirm small-screen text wrapping and card fit.
