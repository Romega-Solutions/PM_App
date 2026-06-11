# PM_Web FAQ Support Data Minimization

## Status

Source update completed. No PM_Web lint, typecheck, build, launch-claim audit, browser check, mailbox check, or release gate was run in this turn by instruction.

## Changed

- `PM_Web/src/components/sections/Faqs.tsx`
  - Added support-copy guidance not to send passwords, payment details, ID documents, or private message screenshots by email.
  - Updated the support mailto body with the same warning.
- `PM_Web/scripts/check-launch-claims.mjs`
  - Added a required marker for FAQ support email data minimization.
- `PM_Web/RELEASE_CHECKLIST.md`
  - Added production-gate coverage for public email body data minimization.

## Why it matters

Support contact is a public trust surface. Before secure support workflows are fully proven, the website should avoid encouraging users to send sensitive information through email.

## Evidence still needed

- Run PM_Web local release checks.
- Browser-check the FAQ support CTA.
- Send a test support email and confirm mailbox receipt.
