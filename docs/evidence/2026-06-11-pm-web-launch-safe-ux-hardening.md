# PM_Web Launch-Safe UX Hardening

Date: 2026-06-11
Status: Source evidence only; PM_Web checks and browser smoke were not rerun after the email-helper refactor

## Scope

This pass tightened PM_Web landing, conversion, membership, support, safety, FAQ, and legal copy so the public site stays honest while PinayMate remains launch-stage.

## Source Evidence

- `PM_Web/src/components/sections/Hero.tsx` now shows persistent launch-state labels: waitlist only, no profile today, no matching today, and no payment today.
- `PM_Web/src/components/sections/About.tsx` now frames memberships as launch-interest paths and avoids implying checkout, profile creation, or matching is live.
- `PM_Web/src/components/sections/Download.tsx` now shows App Store and Google Play links as locked until release sign-off.
- `PM_Web/src/components/sections/Membership.tsx` now separates planned pricing from checkout and repeats that plan-interest emails are not payment, profile creation, or active matching.
- `PM_Web/src/components/sections/Features.tsx` now provides a direct trust/safety support path and keeps safety language framed as review paths, not guarantees or background checks.
- `PM_Web/src/components/sections/Faqs.tsx` now gates account changes, profile settings, and deletion requests behind app availability or support during launch preparation.
- `PM_Web/src/components/sections/Footer.tsx` now uses a safer support email body that warns users not to send passwords, payment details, ID documents, or private message screenshots.
- `PM_Web/src/components/modals/LegalModal.tsx` now separates launch-stage website information from app account information and gates account responsibilities behind app account availability.
- `PM_Web/src/lib/launchEmailLinks.ts` centralizes support, legal, waitlist, safety, and plan-interest email links so launch-safe subjects and sensitive-data warnings do not drift across sections.
- `PM_Web/scripts/check-product-design-contract.mjs` and `PM_Web/scripts/check-launch-claims.mjs` now guard the new waitlist, store, pricing, support, safety, FAQ, and legal launch boundaries.

## Product Risk Reduced

- Reduced false expectation that the waitlist creates a profile or starts matching.
- Reduced false expectation that App Store or Google Play downloads are already available.
- Reduced false expectation that paid tiers are active checkout.
- Reduced false expectation that review cues guarantee safety, identity, or background checks.
- Reduced sensitive-data risk in support and waitlist email paths.

## Not Proven By This Evidence

- PM_Web lint, typecheck, build, `npm run check:local-links`, `npm run check:launch-claims`, and `npm run check:release-local` results after the PM_Web email-helper refactor.
- PM_Web checks, browser smoke, and production URL validation were not run.
- Desktop or mobile browser rendering.
- Keyboard/focus behavior in the live browser.
- Production domain, DNS, mailbox delivery, or support/legal inbox ownership.
- App-store availability, checkout readiness, or final public launch approval.
