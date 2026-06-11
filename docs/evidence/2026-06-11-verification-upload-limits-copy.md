# Verification Upload Limits Copy

Date: 2026-06-11

Status: Source updated, checks not rerun in this note.

## What changed

- Added a "Verification limits" card to the identity verification upload screen.
- Clarified that verification review is private and handled through the protected backend path.
- Clarified that submitting files does not automatically approve a verified badge.
- Clarified that support will not ask for passwords or payment in this flow.
- Added a screen-reader summary for the same limits.

## Why this matters

- Identity verification is a trust-sensitive onboarding step.
- The UI now communicates privacy boundaries and reduces the chance that users misunderstand verification as automatic approval or a payment/password request.

## Required next proof

- Rerun PM_App local quality checks.
- Include verification upload in native device/emulator QA before launch.
