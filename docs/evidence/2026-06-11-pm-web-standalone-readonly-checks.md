# PM_Web standalone read-only checks

Date: 2026-06-11
Owner: Codex

## Status

Source update completed. Checks were not run in this turn.

## Changed

- Added PM_Web-local report-mode scripts:
  - `npm run check:local-links:report`
  - `npm run check:launch-claims:report`
  - `npm run check:release-local:report`
- Kept normal PM_Web check scripts read-only by default.
- Updated `PM_Web/scripts/check-launch-claims.mjs` to use `PM_Web/docs/PINAYMATE_LAUNCH_STATE_MATRIX.md` by default.
- Kept central matrix comparison available with `PINAYMATE_LAUNCH_MATRIX_PATH`.
- Updated `PM_Web/scripts/check-local-cta-links.mjs` so evidence files are written only when `--write-report` or `PINAYMATE_WRITE_REPORT=1` is used.
- Updated `PM_Web/scripts/check-product-design-contract.mjs` to use the PM_Web-local launch-state matrix snapshot.
- Added `PM_Web/docs/PINAYMATE_LAUNCH_STATE_MATRIX.md` as the standalone PM_Web copy/claim contract.
- Updated `PM_App/scripts/check-supabase-static-contract.mjs` to keep normal static checks read-only and require `--write-report` or `PINAYMATE_WRITE_REPORT=1` for static evidence output.

## Why it matters

Before this change, PM_Web local checks could depend on a sibling PM_App checkout and could write evidence into PM_App docs by default. That made PM_Web harder to validate as an independent repo and increased the risk of stale or accidental evidence changes.

The new behavior separates:

- normal local/CI checks that should be read-only
- intentional release evidence capture that writes proof files

## Not proven

- PM_Web checks were not rerun.
- PM_App checks were not rerun.
- No browser, build, lint, Supabase, or live mailbox verification was performed.
- The PM_Web-local snapshot still needs periodic comparison with the central PM_App launch-state matrix during full workspace release review.
