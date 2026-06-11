# Privacy Settings Load Fail-Safe

Date: 2026-06-11
Owner: Codex
Result: Source patch only - not rerun

## What changed

- Added an inline privacy-settings load error state in `app/(main)/profile-settings/privacy.tsx`.
- Locked all privacy toggles while settings are loading, while any setting is saving, or after a load failure.
- Added a retry action so users do not accidentally save default privacy settings over their real backend-backed account settings.
- Added a hidden-profile notice when profile visibility is off, making the discovery impact clearer.
- Added the privacy screen fail-safe to the launch file contract markers.

## Why it matters

Privacy settings are high-trust controls. If the backend load fails, the app should not display defaults as if they were the user's real choices or allow those defaults to be saved.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run `npm run check:source-contracts`.
- Run the PM_App local quality gate.
- Run native QA for the privacy settings screen against a real Supabase environment.
