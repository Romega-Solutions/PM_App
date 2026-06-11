# PM_Web About Launch-Stage Positioning

Date: 2026-06-11

Status: Source updated, checks not rerun in this note.

## What changed

- Updated PM_Web About copy so product capabilities read as launch-stage direction instead of live availability.
- Clarified that conversation and matching direction becomes real only after production sign-off.
- Added a membership note saying links collect interest only and do not create a dating profile, start matching, or open checkout.

## Why this matters

- About sections can create broad product expectations.
- This keeps PM_Web honest while PM_App, backend, OCR, native QA, and production launch proof remain incomplete.

## Required next proof

- Rerun PM_Web `npm run check:release-local`.
- Rerun PM_Web `npm run check:local-quality`.
- Run desktop and mobile browser smoke checks before production launch.
