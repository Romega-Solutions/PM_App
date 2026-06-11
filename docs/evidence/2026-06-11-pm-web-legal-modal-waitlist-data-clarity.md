# PM_Web Legal Modal Waitlist Data Clarity

Date: 2026-06-11

Status: Source and guard updated, checks not rerun in this note.

## What changed

- Updated PM_Web Privacy Policy modal copy to separate website waitlist/support email data from app-account data.
- Clarified that profile information, photos, matches, messages, reports, blocks, and verification status apply only when app account features are available.
- Updated legal modal `Last Updated` date to June 11, 2026.
- Added mailto subjects and accessibility labels to legal/support contact links.
- Added a launch-claims guard marker for the legal waitlist-data distinction.

## Why this matters

- The legal modal is a public trust surface.
- Users should not infer that joining the website waitlist creates a profile, uploads photos, starts messaging, or enables app account processing.

## Required next proof

- Rerun PM_Web `npm run check:release-local`.
- Rerun PM_Web `npm run check:local-quality`.
- Verify legal modal keyboard and mobile behavior in browser smoke checks before production launch.
