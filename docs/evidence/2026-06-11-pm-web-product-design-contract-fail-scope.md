# PM_Web product-design contract fail-scope output

Date: 2026-06-11
Owner: Codex

## Status

Source audit-output update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/scripts/check-product-design-contract.mjs` so the source-only scope message is printed on both pass and fail.
- Kept the existing successful-output summary, but moved the source-scope text into a shared `sourceScopeMessage`.

## Why it matters

Failed source-contract output can still be copied into release notes or evidence. The output should always state that the script proves source-contract coverage only and does not prove browser rendering, screenshots, production URL behavior, mailbox delivery, checkout readiness, app-store availability, or live PM_App readiness.

## Not proven

- PM_Web product-design contract was not run.
- PM_Web browser rendering, screenshots, production URL behavior, mailbox delivery, checkout readiness, app-store availability, and live PM_App readiness were not verified.
