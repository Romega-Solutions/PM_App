# PM_Web local quality script

Date: 2026-06-11
Owner: Codex

## What changed

- Added `npm run check:local-quality` to PM_Web.
- The script runs lint, TypeScript, production build, and the local CTA/launch-claim audits.
- Updated release docs and PM_Web README to use the broader local-quality command before publishing launch copy or CTA changes.

## Why it matters

- PM_Web has separate checks for source claims, link safety, lint, TypeScript, and build output.
- A single local-quality command reduces the chance that a launch-copy change is reviewed with only one narrow audit.

## Verification status

- Script and docs were patched locally.
- `npm run check:local-quality` was not executed after this addition.
- This does not prove production domain, DNS, mailbox deliverability, app-store readiness, or checkout readiness.
