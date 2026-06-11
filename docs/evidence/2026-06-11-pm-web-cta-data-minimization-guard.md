# PM_Web CTA data minimization guard

Date: 2026-06-11
Owner: Codex

## What changed

- Updated the PM_Web local CTA/link audit to fail if waitlist or membership mailto bodies prefill `Preferred name` or `Location` prompts.
- Added source-text scanning so template-built or encoded mailto bodies cannot hide `Preferred name`, `Preferred%20name`, `Location:`, or `Location%3A` prompts.
- Added a required audit row for data-minimized waitlist and membership mailto bodies.
- Updated the audit result wording to include personal-data prompt checks.

## Why it matters

- PM_Web now avoids asking for personal data in launch-stage waitlist and membership-interest emails.
- The audit should prevent future CTA edits from reintroducing unnecessary personal-data prompts before mailbox ownership, support operations, and privacy handling are proven.

## Verification status

- Script was patched locally.
- `npm run check:local-links` and `npm run check:release-local` were not rerun after this guard change.
- This does not prove production mailbox deliverability, support operations, checkout readiness, or deployed domain behavior.
