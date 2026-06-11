# User-Safe Error Mapping

Date: 2026-06-11

Status: Code updated, full release checks not rerun in this note.

## What changed

- Safety/reporting API errors no longer return unknown raw backend messages to users.
- Privacy settings API errors no longer return unknown raw backend messages to users.
- OCR client errors no longer surface raw provider or backend response text to users.
- OCR errors now map response status codes to safe user-facing messages for sign-in, unreadable documents, quota limits, temporary service failures, and generic retry states.

## Why this matters

- Report, block, privacy, and OCR flows are trust-sensitive surfaces.
- User-facing error copy should explain the next action without exposing backend internals, provider details, policy names, SQL errors, or raw response bodies.

## Required next proof

- Rerun PM_App local quality checks after the current patch set is finalized.
- Confirm OCR positive, invalid-document, unauthenticated, and quota-limit behavior against the deployed Edge Function before launch.
