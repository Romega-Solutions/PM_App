# Matching trust-signal ranking cleanup

Date: 2026-06-11
Owner: Codex

## What changed

- Removed the automatic verified-profile score boost from local matching ranking.
- Kept verification as a visible trust signal instead of a promise of more reach or better placement.
- Updated the matching algorithm documentation to match the code behavior.

## Why it matters

- Verification should help users understand trust context, not quietly change ranking before fairness and safety policy are approved.
- This keeps product copy, engineering behavior, and launch evidence aligned.

## Verification status

- Code and docs were patched locally.
- Full PM_App tests were not rerun after this note.
- Live matching behavior is not proven until the current app/backend build is deployed and checked against the target environment.
