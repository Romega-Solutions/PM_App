# PM_Web Launch Claims Matrix Guard

Date: 2026-06-11
Owner: Codex
Result: Source guard added, checks not rerun

## What changed

- Updated `PM_Web/scripts/check-launch-claims.mjs` so the launch-claim audit requires a launch-state matrix. PM_Web now uses a local snapshot by default for standalone checks and can compare against the central PM_App matrix with `PINAYMATE_LAUNCH_MATRIX_PATH`.
- The PM_Web source scan remains limited to PM_Web source files for forbidden live-claim detection.
- The shared matrix is checked separately for the launch-state boundaries that govern PM_Web claims.

## Guarded boundaries

- PM_Web is launch-interest and support, not a live dating-account surface.
- PM_Web does not create a dating profile.
- Matching is not promised today.
- Payments are planned interest only.
- Stronger public claims require current proof.

## Verification status

No validation commands were run after this change.

Required reruns before launch approval:

- `npm run check:launch-claims` from `PM_Web`
- `npm run check:release-local` from `PM_Web`
