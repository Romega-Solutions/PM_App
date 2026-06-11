# PM_Web FAQ Launch Status Chips

Date: 2026-06-11

Status: Source updated, checks not rerun in this note.

## What changed

- Added visible status chips to PM_Web FAQ items:
  - Waitlist only
  - No payment today
  - Backend-gated
  - Manual review
  - After sign-off
- Added an explicit accessibility label to the support email CTA.

## Why this matters

- The FAQ now communicates launch limitations before users expand each answer.
- This supports honest conversion: users can understand the product state quickly without unsupported app-store, checkout, active-user, or guaranteed-safety claims.

## Required next proof

- Rerun PM_Web `npm run check:local-quality`.
- Run desktop and mobile browser smoke checks before production launch.
