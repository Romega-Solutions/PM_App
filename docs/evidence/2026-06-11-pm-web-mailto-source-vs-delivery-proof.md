# PM_Web mailto source vs delivery proof

Date: 2026-06-11
Owner: Codex

## Status

Release checklist update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/RELEASE_CHECKLIST.md` with a separate `Mailto source audit` gate.
- Clarified that `npm run check:local-links:report` should prove helper-generated waitlist, support, and legal body boundaries before mailbox proof is accepted.
- Kept mailbox delivery as a separate external gate for monitored support/legal inboxes.

## Why it matters

Correct source-generated mailto bodies do not prove mailbox deliverability or monitored ownership. PM_Web release review needs both:

- source proof that generated email bodies are safe
- external proof that the intended inboxes receive and are monitored

## Not proven

- PM_Web local-link report was not run.
- Waitlist, support, and legal mailbox delivery were not tested.
- No lint, build, browser, DNS, Supabase, or live validation was performed.
