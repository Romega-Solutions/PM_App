# Launch Evidence Contract Source-Proof Guards

Date: 2026-06-11
Owner: Codex
Result: Source guard added, checks not rerun

## What changed

- Updated `scripts/check-launch-evidence-contract.mjs` so the launch evidence packet must retain source-proof markers for:
  - `docs/PINAYMATE_LAUNCH_STATE_MATRIX.md`
  - `docs/evidence/2026-06-11-pinaymate-launch-state-matrix.md`
  - `docs/evidence/2026-06-11-pm-app-launch-state-signoff-alignment.md`
  - `docs/evidence/2026-06-11-pm-web-launch-state-matrix-alignment.md`
  - `docs/evidence/2026-06-11-pm-web-mailto-encoding-guard.md`
  - `PM_Web email helper patch currency`
  - the packet-level warning that older `Pass` evidence is historical after source or script changes

## Why it matters

The evidence packet is the manager-facing launch proof pack. It now has a static guard against losing the rows that explain current launch-state truth, current staleness, and PM_Web CTA/email safety controls.

## Verification status

No validation commands were run after this change.

Required reruns before launch approval:

- `npm run check:launch-evidence-contract` from `PM_App`
- `npm run check:launch-file-contract` from `PM_App`
- `npm run check:release-local` from `PM_App` after approval-bound blockers are cleared
