# Location Selection Privacy Feedback

Date: 2026-06-11

Status: Source updated, checks not rerun in this note.

## What changed

- Updated the location onboarding screen selected-location card.
- Manual city selection now explicitly says PinayMate will not treat it as exact GPS.
- Current-location selection now explicitly says approximate coordinates may be saved for matching preferences.
- Added a screen-reader label that includes the selected location and privacy/precision expectation.

## Why this matters

- Location is a sensitive dating-app privacy surface.
- Users should understand the difference between manual city-level input and current-location coordinates before continuing.

## Required next proof

- Rerun PM_App local quality checks.
- Include manual-city and current-location paths in native device/emulator QA before launch.
