# PM_Web legal email boundary

Date: 2026-06-11
Owner: Codex

## Status

Source update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/src/lib/launchEmailLinks.ts` so the legal/privacy mailto link includes a body.
- Added `LEGAL_EMAIL_SENSITIVE_DATA_WARNING`.
- Added `buildLegalEmailHref` so legal email body generation uses shared constants and explicit percent encoding.
- Updated PM_Web product-design, local CTA, and launch-claim guards so the legal email warning remains required.

## Why it matters

Legal/privacy contact should be available, but users should not be prompted to send secrets, payment details, ID documents, private message screenshots, or raw identity documents by email. This keeps the launch-stage legal path useful without weakening privacy and safety expectations.

## Not proven

- Legal mailbox delivery was not tested.
- PM_Web checks were not run.
- No lint, build, browser, DNS, mailbox, Supabase, or live validation was performed.
