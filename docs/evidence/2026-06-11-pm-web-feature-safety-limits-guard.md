# PM_Web Feature Safety Limits Guard

Date: 2026-06-11

Status: Guard updated, checks not rerun in this note.

## What changed

- Expanded the PM_Web launch-claims audit with a required marker for the feature safety-limits copy.
- The guard now expects the page to say safety language describes controls and review paths, not guarantees or background checks.

## Why this matters

- Feature sections are where safety claims can drift into overpromising.
- This keeps PM_Web aligned with the launch-stage policy: explain the safety model without guaranteeing identity, behavior, matches, or personal safety.

## Required next proof

- Rerun PM_Web `npm run check:release-local`.
- Rerun PM_Web `npm run check:local-quality` before production launch.
