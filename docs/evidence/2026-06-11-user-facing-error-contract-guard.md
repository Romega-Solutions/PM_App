# User-Facing Error Contract Guard

Date: 2026-06-11

Status: Guard updated, checks not rerun in this note.

## What changed

- Expanded `scripts/check-privacy-logs.mjs` beyond console/privacy logging checks.
- Added targeted user-facing error contracts for:
  - safety/reporting API
  - privacy settings API
  - OCR client service
- The guard now fails if raw backend/provider error strings are reintroduced in those trust-sensitive paths.

## Why this matters

- Report, block, privacy, and OCR flows should show safe recovery messages instead of backend internals, provider responses, SQL/policy details, or raw response bodies.
- This makes the local quality gate harder to accidentally weaken after the UI and API copy improvements.

## Required next proof

- Rerun `npm run check:privacy-logs`.
- Rerun PM_App local quality after the current patch set is finalized.
