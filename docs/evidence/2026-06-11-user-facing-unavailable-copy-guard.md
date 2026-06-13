# PM_App user-facing unavailable-copy guard

Date: 2026-06-11
Owner: Codex
Status: Source guard updated, not run

## What changed

- Extended `scripts/check-user-facing-safe-errors.mjs` so it scans high-risk PM_App screens for exact user-facing phrases that should not return.
- Blocked old "unavailable", "not available yet", "being finalized", "off for launch", provider-verification, and launch-approval language from app recovery and account screens.
- Kept the guard phrase-based and file-scoped so internal identifiers, test fixtures, and backend implementation details are not blocked by broad keyword matching.

## Why this matters

Client-facing PinayMate copy should guide the member to the next safe action instead of exposing readiness status, launch blockers, or technical/provider constraints.

## Verification

- Not run this turn.
- Recommended check when requested: `npm run check:user-facing-safe-errors` from `PM_App`.
