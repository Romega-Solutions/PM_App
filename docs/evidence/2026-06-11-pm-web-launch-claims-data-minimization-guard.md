# PM_Web launch claims data-minimization guard

Date: 2026-06-11
Owner: Codex

## What changed

- Updated the PM_Web launch-claims audit to require current data-minimization disclaimers:
  - waitlist email is platform-only
  - waitlist does not create account, profile, payment, location, or profile data
  - membership interest email is not checkout and does not create a profile
- Added a forbidden pattern for copy that says the waitlist creates an account, profile, or matching.
- Updated the passing result wording to include waitlist data-overclaim protection.

## Why it matters

- PM_Web launch copy should convert users without implying that waitlist or membership-interest emails create a dating account, collect profile data, or start matching.
- This keeps launch copy aligned with the current production blockers: mailbox ownership, PM_App launch readiness, checkout readiness, and Supabase/OCR proof.

## Verification status

- Script was patched locally.
- `npm run check:launch-claims`, `npm run check:release-local`, and `npm run check:local-quality` were not rerun after this guard change.
- This does not prove production domain, mailbox deliverability, checkout readiness, or deployed behavior.
