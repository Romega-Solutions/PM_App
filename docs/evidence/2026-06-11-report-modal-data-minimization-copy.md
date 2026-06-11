# Report Modal Data-Minimization Copy

Date: 2026-06-11

Status: Source updated, checks not rerun in this note.

## What changed

- Added "What support receives" copy to the report-user modal.
- Clarified that the form sends the selected reason, optional details, source context, and chat context only when available.
- Clarified that the form does not ask for passwords, payment details, or ID documents.
- Updated the primary submit action from "Send report" to "Send private report."
- Updated native QA expectations so the report modal check includes data-minimization copy.

## Why this matters

- Reporting is a sensitive safety and privacy flow.
- The UI now sets clearer expectations about what data is included and what users should not share.

## Required next proof

- Rerun PM_App local quality checks.
- Verify the report modal on a native device or emulator before launch.
