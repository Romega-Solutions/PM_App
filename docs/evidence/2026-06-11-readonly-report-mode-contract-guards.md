# Read-only and report-mode contract guards

Date: 2026-06-11
Owner: Codex

## Status

Source guard update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/scripts/check-product-design-contract.mjs` to require:
  - PM_Web report-mode scripts in `package.json`
  - `PINAYMATE_WRITE_REPORT`
  - `--write-report`
  - PM_Web-local launch-state matrix usage
  - "Report not written" messaging for normal read-only checks
- Updated `PM_App/scripts/check-launch-file-contract.mjs` to require:
  - `check:supabase-static-contract:report` in `package.json`
  - `PINAYMATE_WRITE_REPORT`
  - `--write-report`
  - "Evidence: not written" messaging in the Supabase static audit script

## Why it matters

Release checks should not silently mutate tracked evidence files during normal local or CI use. Evidence files should be generated only when a release owner intentionally captures proof for launch review.

This keeps PM_Web and PM_App closer to production readiness by reducing accidental stale evidence, cross-repo drift, and merge conflicts.

## Not proven

- PM_Web product design contract was not run.
- PM_App launch-file contract was not run.
- No lint, build, browser, Supabase, or live release validation was performed.
