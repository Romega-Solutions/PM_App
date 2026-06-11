# PM_Web Support and Legal Mailto Guard

Date: 2026-06-11

Status: Guard updated, checks not rerun in this note.

## What changed

- Expanded PM_Web local CTA/link audit with required markers for:
  - footer support link using `PinayMate launch support` subject
  - legal modal legal link using `PinayMate legal question` subject
  - legal modal support link using `PinayMate support question` subject

## Why this matters

- Support and legal links are public trust routes.
- Subjected mailto links make launch-stage contact intent clearer and reduce ambiguous mailbox traffic before production support proof.

## Required next proof

- Rerun PM_Web `npm run check:release-local`.
- Rerun PM_Web `npm run check:local-quality`.
- Verify production mailbox delivery before public launch.
