# PM_Web Local Release Guard

Date: 2026-06-11
Scope: PM_Web launch CTA and claim audit tooling.

## What changed

- Fixed `scripts/check-launch-claims.mjs` recursive file traversal so nested source files are scanned once.
- Added `npm run check:release-local` in `PM_Web`.
- Updated PM_Web and PM_App launch docs to point at the combined local release audit command.

## What the combined command covers

- `npm run check:local-links`: confirms local CTA source uses waitlist/support/legal mailto flows and no live app-store or checkout destinations.
- `npm run check:launch-claims`: confirms required launch-stage disclaimers remain present and blocks obvious unsupported live claims.

## Not verified in this pass

- `npm run check:release-local` was not executed.
- PM_Web lint/build and browser checks were not rerun.
- Production DNS, mailbox delivery, app-store availability, checkout readiness, and live app behavior remain separate launch gates.
