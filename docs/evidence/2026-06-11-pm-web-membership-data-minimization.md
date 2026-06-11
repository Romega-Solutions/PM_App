# PM_Web membership data minimization

Date: 2026-06-11
Owner: Codex

## What changed

- Removed preferred-name and location prompts from membership-interest email bodies.
- Membership CTAs now send only plan-interest wording.
- Updated the action note to say the email is not checkout and does not create a profile.

## Why it matters

- Membership interest should not collect extra personal data before mailbox ownership and support operations are verified.
- The website remains honest that checkout, paid membership, and profile creation are not live.

## Verification status

- Source files were patched locally.
- PM_Web local CTA/link audit, launch-claims audit, lint, build, browser QA, and production mailbox checks were not rerun after this change.
- This does not prove support mailbox deliverability, checkout readiness, or production domain behavior.
