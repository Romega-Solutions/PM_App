# PM_Web Release Checklist Artifact

Date: 2026-06-11

Status: Checklist added, gates not rerun in this note.

## What changed

- Added `PM_Web/RELEASE_CHECKLIST.md`.
- Updated PM_Web README to point to the project-local checklist.

## Why this matters

- PM_Web has its own production risks: public CTA behavior, domain readiness, mailbox deliverability, launch-claim accuracy, and responsive smoke checks.
- Keeping a PM_Web-local checklist makes the web release boundary visible without relying only on PM_App docs.

## Required next proof

- Rerun PM_Web `npm run check:local-quality`.
- Run production desktop/mobile smoke checks after deployment.
- Attach mailbox delivery proof for waitlist, support, and legal addresses.
