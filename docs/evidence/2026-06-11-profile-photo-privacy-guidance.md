# Profile Photo Privacy Guidance

Date: 2026-06-11

Status: Source and QA docs updated, checks not rerun in this note.

## What changed

- Added profile-photo privacy guidance to the account setup photo screen.
- Clarified that profile photos are public-facing for discovery and matches.
- Clarified that ID documents, screenshots, and private records should not be uploaded in the profile-photo step.
- Clarified that verification documents belong only in the protected ID review flow.
- Updated native QA expectations for the profile-photo checklist and continue step.

## Why this matters

- Profile photos and ID documents have different privacy expectations.
- Users should understand that profile photos may be visible to others, while identity documents belong in the private verification flow.

## Required next proof

- Rerun PM_App local quality checks.
- Verify the profile-photo onboarding step on a native device or emulator before launch.
