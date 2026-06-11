# PM_Web Store Availability Claim Guard

Date: 2026-06-11
Owner: Codex
Result: Source patch only - not run

## What changed

- Tightened `PM_Web/scripts/check-launch-claims.mjs` to reject official app-store badge-style copy before availability proof.
- Tightened `PM_Web/scripts/check-local-cta-links.mjs` to treat app-store badge text as a risky live destination signal, even if no store URL is present.

## Why it matters

PM_Web is still waitlist-only. Store badge copy such as "Download on the App Store" or "Get it on Google Play" would imply live app-store availability before PM_App release proof exists.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run `npm run check:release-local` from `PM_Web`.
- Run browser/mobile production smoke when the final domain is available.
