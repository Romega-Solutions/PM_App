# PM_Web Mailto Encoding Guard

Date: 2026-06-11
Owner: Codex
Result: Source guard added, checks not rerun

## What changed

- Updated `PM_Web/scripts/check-local-cta-links.mjs` to require explicit percent encoding for the plan-interest mailto helper.
- Updated `PM_Web/scripts/check-product-design-contract.mjs` to require the centralized `encodeMailtoField` helper.
- Updated `PM_Web/RELEASE_CHECKLIST.md` so release review includes mailto encoding quality, not only destination and sensitive-data checks.

## Why it matters

The plan-interest mailto helper previously risked `+` characters appearing in subjects or bodies for some email clients. The source helper now uses explicit percent encoding, and the CTA guard should fail if the implementation regresses to `URLSearchParams`.

## Verification status

No validation commands were run after this change.

Required reruns before launch approval:

- `npm run check:local-links` from `PM_Web`
- `npm run check:product-design-contract` from `PM_Web`
- `npm run check:release-local` from `PM_Web`
