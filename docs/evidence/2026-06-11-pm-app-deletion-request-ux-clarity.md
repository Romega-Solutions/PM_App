# PM_App Deletion Request UX Clarity

Date: 2026-06-11

Status: Source updated, checks not rerun in this note.

## What changed

- Added a visible "Before you request deletion" checklist to the privacy settings screen.
- Clarified that account deletion is reviewed by support before account records change.
- Clarified that safety, fraud, legal, or verification records may need retention.
- Clarified that users receive a request status after the backend accepts the request.
- Updated the deletion request button accessibility label and hint so screen-reader users hear the same expectation-setting.
- Updated the native QA script so account-deletion testing checks the review, retention, and status messaging.

## Why this matters

- Account deletion is a sensitive trust and safety flow.
- The UI now reduces accidental destructive requests and avoids implying instant deletion when the backend flow is review-based.

## Required next proof

- Rerun PM_App local quality checks.
- Include this screen in native device/emulator QA before launch using the updated native QA script rows.
