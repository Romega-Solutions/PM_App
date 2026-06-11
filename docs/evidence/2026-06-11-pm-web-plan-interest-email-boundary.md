# PM_Web plan-interest email boundary

Date: 2026-06-11
Owner: Codex

## Status

Source update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/src/lib/launchEmailLinks.ts` so `PLAN_INTEREST_EMAIL_WARNING` states that plan-interest email is not checkout and does not create an app account, dating profile, match request, matching session, checkout step, or payment record.
- Kept the sensitive-data boundary for payment details, ID documents, precise location, and private profile information.
- Updated PM_Web product-design, local CTA, and launch-claim guards so the plan-interest boundary remains required.
- Updated visible PM_Web membership action notes and CTA accessibility labels so users hear the same no-account/profile/match/payment boundary before opening plan-interest email.

## Why it matters

Membership interest is a high-conversion action. It needs to stay clearly framed as launch planning input, not payment, subscription, profile creation, or matching access.

## Not proven

- PM_Web checks were not run.
- Payment, checkout, mailbox delivery, and production URL behavior were not tested.
- No lint, build, browser, DNS, Supabase, or live validation was performed.
