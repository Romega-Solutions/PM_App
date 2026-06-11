# PM_Web Membership Interest Data Minimization

## Status

Source update completed. No PM_Web lint, typecheck, build, launch-claim audit, browser check, mailbox check, or release gate was run in this turn by instruction.

## Changed

- `PM_Web/src/components/sections/Membership.tsx`
  - Added copy telling users not to include payment details, ID documents, location, or private profile information in plan-interest emails.
  - Updated generated mailto body with the same boundary.
- `PM_Web/scripts/check-launch-claims.mjs`
  - Added a required marker for membership interest email data minimization.
- `PM_Web/RELEASE_CHECKLIST.md`
  - Added production-gate coverage for waitlist, plan-interest, support, and legal email body data minimization.

## Why it matters

Membership interest is a conversion point, but it should not collect sensitive personal, payment, identity, or profile data before production account, billing, legal, and support flows are ready.

## Evidence still needed

- Run PM_Web local release checks.
- Browser-check membership CTAs.
- Send test interest emails and confirm mailbox receipt without collecting sensitive data.
