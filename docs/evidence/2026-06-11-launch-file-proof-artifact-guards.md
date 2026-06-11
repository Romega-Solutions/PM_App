# Launch File Proof Artifact Guards

Date: 2026-06-11
Owner: Codex
Result: Source guard added, checks not rerun

## What changed

- Updated `scripts/check-launch-file-contract.mjs` so the release file contract requires the new launch-state and PM_Web guard evidence artifacts.

Required artifacts now include:

- `docs/evidence/2026-06-11-pinaymate-launch-state-matrix.md`
- `docs/evidence/2026-06-11-pm-app-launch-state-signoff-alignment.md`
- `docs/evidence/2026-06-11-pm-web-launch-state-matrix-alignment.md`
- `docs/evidence/2026-06-11-pm-web-mailto-encoding-guard.md`
- `docs/evidence/2026-06-11-pm-web-launch-claims-matrix-guard.md`
- `docs/evidence/2026-06-11-launch-evidence-contract-source-proof-guards.md`

## Why it matters

These files explain the current launch-state truth, the claim boundaries, and the PM_Web CTA/email safety guards. The launch-file contract should fail if those proof artifacts disappear from the source tree before release review.

## Verification status

No validation commands were run after this change.

Required reruns before launch approval:

- `npm run check:launch-file-contract` from `PM_App`
- `npm run check:source-contracts` from `PM_App`
- `npm run check:release-local` from `PM_App` after approval-bound blockers are cleared
