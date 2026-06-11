# PM_Web Dependency Audit Release Gate

Date: 2026-06-11

Status: Gate added, not rerun in this note.

## What changed

- Added `npm run check:dependency-audit` to PM_Web.
- Updated PM_Web `npm run check:release-local` so it runs dependency audit before CTA routing and launch-claim checks.
- Updated PM_Web README proof commands and release owner proof block to show dependency audit as a local release gate.

## Why this matters

- QA already ran PM_Web `npm audit --audit-level=moderate` and reported zero vulnerabilities.
- That proof should not stay as a one-off command outside the normal release path.
- Public launch copy should not be treated as ready if dependency advisories appear later.

## Required next proof

- Rerun `npm run check:local-quality` in PM_Web after the current patch set is finalized.
- Attach fresh output to the launch evidence packet before any production launch claim.
