# Matching Discovery Safety Polish

## Status

Source update completed. Automated validation, build, native runtime QA, and visual QA were not run in this turn by instruction.

## Changed

- Added a discovery safety note to the active matching discovery screen so users understand that visibility settings and preferences shape the feed.
- Clarified the empty discovery state so users are not pushed to widen filters unless they are comfortable doing so.
- Reworded profile-card fit language from compatibility-style phrasing to preference-fit language to avoid implying guaranteed matches.
- Added a short profile-card reminder not to share codes, ID photos, or payment details from ordinary profile browsing.
- Added a match-list empty-state reminder that users control the pace and can report anything that feels off.

## Product rationale

This makes discovery feel more trustworthy without overclaiming safety. The UI now sets expectations around preference-based browsing, respectful pacing, and private-information boundaries while keeping the main swipe flow intact.

## Evidence needed before launch

- Run PM_App lint and TypeScript checks.
- Run the privacy/static contract guards if this language is covered by launch checks.
- Validate the screen on native device or emulator for layout height, dynamic text, and swipe usability.
