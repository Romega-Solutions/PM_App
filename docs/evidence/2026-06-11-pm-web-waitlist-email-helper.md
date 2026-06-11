# PM_Web waitlist email helper

Date: 2026-06-11
Owner: Codex

## Status

Source refactor completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/src/lib/launchEmailLinks.ts` so iOS and Android waitlist links use `buildWaitlistEmailHref`.
- Added `WAITLIST_EMAIL_LAUNCH_BOUNDARY`.
- Added `WAITLIST_EMAIL_DATA_BOUNDARY`.
- Updated PM_Web local CTA, product-design, and launch-claim guards so waitlist email bodies keep the account/profile/match/payment and sensitive-data boundaries.
- Updated `PM_Web/RELEASE_CHECKLIST.md` so release reviewers must verify the waitlist email boundary.
- Clarified in `PM_Web/RELEASE_CHECKLIST.md` that waitlist, support, and legal email boundaries should come from `src/lib/launchEmailLinks.ts` shared helper constants and that report-mode local-link output should show helper-boundary detection.
- Updated the visible PM_Web waitlist section so page copy matches the generated email boundary around app account, dating profile, match request, matching session, checkout, payment record, precise location, and sensitive profile details.
- Updated waitlist button accessibility labels so screen-reader users hear that joining by email does not create an app account, dating profile, match request, or payment record.

## Why it matters

Waitlist email is one of the highest-conversion public actions on PM_Web. It should stay clearly framed as interest capture only, not app account creation, dating profile creation, matching, checkout, or payment.

## Not proven

- PM_Web checks were not run.
- Waitlist mailbox delivery was not tested.
- No lint, build, browser, DNS, Supabase, or live validation was performed.
