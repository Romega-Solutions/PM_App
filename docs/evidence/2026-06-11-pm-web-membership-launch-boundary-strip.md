# PM_Web Membership Launch Boundary Strip

Date: 2026-06-11

Status: Source updated, checks not rerun in this note.

## What changed

- Added a visible membership boundary strip below the plan cards:
  - No card or charge
  - No dating profile created
  - No matching starts today

## Why this matters

- Membership and pricing content can easily be misread as live checkout.
- The section now reinforces the current launch-stage truth without requiring users to read every plan note.
- This supports honest conversion while PM_App checkout, app-store, matching, and backend safety gates remain unlaunched.

## Required next proof

- Rerun PM_Web `npm run check:local-quality`.
- Run desktop and mobile browser smoke checks before production launch.
