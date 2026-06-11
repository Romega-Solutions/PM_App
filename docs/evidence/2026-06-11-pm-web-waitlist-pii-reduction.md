# PM_Web waitlist PII reduction

Date: 2026-06-11
Owner: Codex

## What changed

- Removed the location prompt from the prepared iOS and Android waitlist email bodies.
- Kept platform preference and preferred name only.
- Left the launch-stage disclaimer that no account, profile, or payment is created from the page.

## Why it matters

- The support mailbox and production routing still need ownership proof before public traffic.
- The waitlist should avoid collecting extra personal data until support operations are confirmed.

## Verification status

- PM_Web source was patched locally.
- Browser visual QA and production mailbox delivery were not run after this note.
