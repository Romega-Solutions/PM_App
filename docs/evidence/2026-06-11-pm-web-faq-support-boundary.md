# PM_Web FAQ support boundary

Date: 2026-06-11
Owner: Codex

## Status

Source copy update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/src/components/sections/Faqs.tsx` support copy to clarify that emailing support does not create an app account, dating profile, match request, or payment record.
- Updated the support link accessibility label to reinforce that users should not send sensitive account data.
- Updated `PM_Web/scripts/check-product-design-contract.mjs` so the support-boundary copy remains required.
- Updated `PM_Web/scripts/check-launch-claims.mjs` so the launch-claims audit also requires the support email account/profile/match/payment boundary.
- Updated `PM_Web/RELEASE_CHECKLIST.md` so release reviewers must explicitly verify the support email boundary before launch.
- Updated `PM_Web/src/lib/launchEmailLinks.ts` so support, launch-support, and trust/safety mailto bodies also state that email does not create an app account, dating profile, match request, or payment record.
- Updated PM_Web local CTA, product-design, and launch-claim source guards so the mailto helper keeps that boundary.
- Refactored support mailto generation through `buildSupportEmailHref` so launch-boundary and sensitive-data warnings are built from shared constants instead of duplicated encoded string literals.

## Why it matters

The FAQ is a high-trust launch surface. Support email should remain clearly framed as a launch-stage contact path, not a substitute for account creation, matching, payment, or private app workflows.

## Not proven

- PM_Web product-design contract was not run.
- PM_Web build, lint, browser, mailbox, or production checks were not run.
