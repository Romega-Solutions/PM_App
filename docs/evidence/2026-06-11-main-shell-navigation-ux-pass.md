# Main Shell Navigation UX Pass

Date: 2026-06-11
Owner: Codex sub-agent
Result: Source patch only - not rerun

## Changed files

- `app/(main)/_layout.tsx`
- `app/(main)/profile-settings/_layout.tsx`
- `app/(main)/profile-settings/about.tsx`
- `app/(main)/profile-settings/help.tsx`
- `app/(main)/profile-settings/preferences.tsx`

## What changed

- Clarified signed-in tab labels and destination accessibility labels.
- Improved tab bar active-state contrast, icon container sizing, bottom inset handling, and practical tap area.
- Improved auth-loading gate with brand mark, title, and explanatory copy.
- Added more consistent settings sub-stack background and non-privacy route titles.
- Improved About, Help, and Preferences headers with larger back targets, centered titles, safe-area scroll padding, and clearer button semantics.
- Improved Preferences loading state with a more useful loading card and screen-reader live region.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run PM_App typecheck/lint/tests.
- Run native QA on small and standard device sizes.
- Confirm Expo tab rendering and dynamic type behavior.
