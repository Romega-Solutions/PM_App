# PM_Web mailto helper guard compatibility

Date: 2026-06-11
Owner: Codex

## Status

Source guard update completed. Checks were not run in this turn.

## Changed

- Updated `PM_Web/scripts/check-local-cta-links.mjs` so local CTA checks accept shared helper-generated support and legal mailto subjects.
- Kept compatibility with older encoded subject markers.
- Required `buildSupportEmailHref` and `buildLegalEmailHref` when checking support/legal contact subjects.
- Added audit output for waitlist, support, and legal helper-boundary presence so later release evidence can show which centralized mailto safeguards were detected.
- Added audit output for evidence write mode so future reports show whether the run was read-only or intentionally writing an evidence file.
- Aligned `PM_Web/RELEASE_CHECKLIST.md` with the helper-boundary audit so release review checks generated mailto body safeguards, not only visible page copy.

## Why it matters

PM_Web mailto links now use shared helper functions so launch-boundary and sensitive-data warnings do not drift. The local CTA guard should validate that safer helper pattern instead of failing only because subjects are no longer duplicated as encoded literals in source.

## Not proven

- PM_Web local CTA checks were not run.
- Mailbox delivery was not tested.
- No lint, build, browser, DNS, Supabase, or live validation was performed.
