# Launch File Contract Guard

Date: 2026-06-11

Status: Guard added, not rerun in this note.

## What changed

- Added `scripts/check-launch-file-contract.mjs`.
- Added `npm run check:launch-file-contract`.
- Updated `npm run check:release-local` so it runs:
  - secret hygiene
  - launch file contract
  - local quality checks

## What the guard checks

- The report-user modal route exists and has the expected safety/report markers.
- The secret hygiene, privacy-log, and Supabase static-contract scripts exist and have expected guard markers.
- The OCR function/config files exist and keep expected auth, quota, and provider-secret markers.
- The final discovery privacy migration exists and includes hidden-profile filtering markers.
- Each launch-critical file is tracked by git when the guard is run.

## Why this matters

- A partial merge could otherwise include code that references untracked launch-critical files.
- The guard makes that failure visible before release-local checks can be treated as usable evidence.

## Required next proof

- Rerun `npm run check:release-local` after tracked `.env` cleanup is explicitly approved and completed.
- If the guard fails, either include the missing launch-critical files in the change set or remove the references that depend on them.
