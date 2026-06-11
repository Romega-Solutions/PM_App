# PM_Web CTA Sensitive Data Guard

## Status

Source update completed. The PM_Web local CTA/link audit was not run in this turn by instruction.

## Changed

`PM_Web/scripts/check-local-cta-links.mjs`

- Added required evidence that membership interest email copy warns against sending sensitive payment, ID, location, or private profile data.
- Added required evidence that FAQ support email copy warns against sending passwords, payment details, ID documents, or private message screenshots.
- Added a sensitive-data warnings section to the generated CTA audit report.

## Why it matters

The CTA audit now checks not only that the site avoids prefilled personal-data prompts, but also that high-conversion mailto paths actively warn users not to send sensitive data before secure support and account workflows are proven.

## Evidence still needed

- Run PM_Web `npm run check:local-quality` or `npm run check:release-local`.
- Browser-check CTA behavior.
- Confirm mailbox receipt for waitlist, plan-interest, support, and legal emails.
