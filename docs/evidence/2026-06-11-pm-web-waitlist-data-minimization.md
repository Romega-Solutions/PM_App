# PM_Web waitlist data minimization

Date: 2026-06-11
Owner: Codex

## What changed

- Removed the preferred-name prompt from prepared iOS and Android waitlist email bodies.
- The prepared waitlist email now captures only platform interest by subject/body wording.
- Updated the visible note to say the page does not create an account, profile, payment, location, or profile data.

## Why it matters

- PM_Web production mailbox ownership and deliverability still need proof.
- Until support operations are confirmed, the waitlist CTA should avoid asking for extra personal data.

## Verification status

- Source files were patched locally.
- `npm run check:local-links`, `npm run check:launch-claims`, browser QA, and production mailbox checks were not rerun after this change.
- This does not prove support mailbox deliverability or production domain behavior.
