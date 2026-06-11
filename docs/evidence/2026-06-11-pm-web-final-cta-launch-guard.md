# PM_Web Final CTA Launch Guard

## Status

Source update completed. The PM_Web launch-claims audit was not run in this turn by instruction.

## Changed

- Updated `PM_Web/scripts/check-launch-claims.mjs` so the waitlist data-minimization marker matches the current final CTA wording.
- Added a required marker that the final waitlist CTA does not start matching today, create a public profile, or require payment.
- Added a required marker that the final waitlist note is not a live membership, match request, or checkout step.
- Added a forbidden pattern to catch future copy that says joining the waitlist starts matching.

## Why it matters

The final CTA is the highest-conversion area on the landing page. This guard helps prevent future marketing edits from turning a waitlist/interest flow into an unsupported production, profile-creation, matching, or payment claim.

## Evidence still needed

- Run PM_Web `npm run check:release-local` or the local quality wrapper.
- Browser-check the final CTA on desktop and mobile.
- Confirm `support@pinaymate.com` receives the iOS and Android waitlist emails.
