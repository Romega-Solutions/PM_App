# PM_App release-local wrapper alignment

Date: 2026-06-11
Owner: Codex

## What changed

- Updated `npm run check:release-local` so it runs:
  - `npm run check:secret-hygiene`
  - `npm run check:local-quality`
- Kept `npm run check:local-quality` available as the pre-cleanup local posture command while tracked `.env` remains blocked.
- Updated launch checklist and README wording to explain the split.

## Why it matters

- The release gate should fail first on tracked env files, then run the complete local app quality suite after the secret blocker is cleared.
- This avoids maintaining duplicate privacy/static-contract command lists in multiple scripts.

## Verification status

- Script and docs were patched locally.
- `npm run check:release-local` was not executed after this wrapper update.
- `.env` git-index cleanup, secret rotation review, live Supabase proof, OCR deployment, native QA, and production PM_Web proof were not performed.
