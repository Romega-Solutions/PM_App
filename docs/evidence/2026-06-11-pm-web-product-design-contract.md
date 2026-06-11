# PM_Web Product Design Contract

Date: 2026-06-11
Status: Source gate added - not run

## What changed

- Added `PM_Web/scripts/check-product-design-contract.mjs`.
- Added `check:product-design-contract` to `PM_Web/package.json`.
- Wired the design contract into `PM_Web` `check:release-local`.
- Updated the PM_Web release checklist to include the product design source contract.

## What the gate checks

- Hero conversion hierarchy and waitlist limitation copy.
- Download/waitlist privacy and no-profile/no-payment boundary.
- Feature trust/safety copy framed as review status, not guarantees.
- Membership interest framed as non-checkout.
- About and legal modal launch-stage limitations.
- Release checklist links to the cross-platform design QA standard.
- Forbidden app-store, live-checkout, guaranteed-safety, and waitlist-overclaim language.

## Verification

Not run in this pass. This is a source-only PM_Web contract and does not replace desktop/mobile browser review, screenshots, accessibility review, or production URL checks.
