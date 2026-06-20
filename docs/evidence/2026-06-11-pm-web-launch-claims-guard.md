# PM_Web Launch Claims Guard

Date: 2026-06-11
Scope: PM_Web local source copy under `src/`.

## What changed

- Added `scripts/check-launch-claims.mjs` in `PM_Web`.
- Added `npm run check:launch-claims`.
- Updated `PM_Web/README.md`, `PM_App/docs\release\RELEASE_READINESS.md`, and `PM_App/docs\release\LAUNCH_EVIDENCE_PACKET.md` so the audit is part of the launch evidence path.

## What the guard checks

- Required launch-stage disclaimers remain present:
  - website does not create profiles, start matching, open checkout, or collect payment
  - membership interest is not checkout
  - hero says no payment on the page
  - legal copy does not guarantee member identity, behavior, relationship outcomes, or personal safety
  - launch copy does not guarantee app access, paid membership availability, app-store availability, or live dating functionality
- Obvious unsupported positive claims are blocked:
  - live app-store availability
  - live profile creation
  - live matching
  - live payment or checkout
  - absolute safety or identity guarantees
  - background-check claims

## Not verified in this pass

- `npm run check:launch-claims` was not executed.
- PM_Web lint/build and browser checks were not rerun.
- Production DNS, mailbox delivery, app-store availability, checkout readiness, and live app behavior remain separate launch gates.
