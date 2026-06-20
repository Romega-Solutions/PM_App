# PM_Web matrix drift check

Date: 2026-06-11
Owner: Codex

## Status

Source guard update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/scripts/check-launch-claims.mjs` so PM_Web still uses `PM_Web/docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md` by default.
- Added an optional central-matrix drift check when `../PM_App/docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md` exists.
- Kept standalone behavior: PM_Web does not require PM_App when the sibling repo is absent.
- Kept explicit override behavior: `PINAYMATE_LAUNCH_MATRIX_PATH` can force a specific matrix path for release review.
- Updated `PM_Web/scripts/check-product-design-contract.mjs` so the optional central-matrix drift behavior is protected by source markers.
- Updated `PM_Web/README.md` and `PM_Web/RELEASE_CHECKLIST.md` so release reviewers know when to rely on the local PM_Web matrix, when central PM_App comparison is expected, and when to refresh the snapshot.

## Why it matters

PM_Web needs to be independently checkable, but its public claims still need to stay aligned with the central PM_App launch-state matrix during full workspace release review.

This change catches drift when both repos are present without reintroducing cross-repo evidence writes or hard standalone dependencies.

## Not proven

- PM_Web launch-claims check was not run.
- PM_Web product-design contract was not run.
- No PM_App, PM_Web, browser, build, Supabase, mailbox, or live validation was performed.
