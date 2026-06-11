# PinayMate Privacy Log Audit Scope Refinement

Date: 2026-06-11
Scope: `scripts/check-privacy-logs.mjs`.

## What changed

- Updated the PM_App privacy-log audit to skip `__tests__` and `__mocks__` directories.
- Updated the audit to skip `.test.*` and `.spec.*` files.

## Why it matters

The guard is meant to protect app runtime logging from leaking profile, auth, location, matching, messaging, or verification data. Test and mock files are not runtime surfaces, so excluding them reduces false positives while keeping the launch guard focused on user-facing code.

## Not verified in this pass

- `npm run check:privacy-logs` was not executed.
- `npm run check:release-local` was not executed.
- Full lint, typecheck, tests, and web export were not rerun.
