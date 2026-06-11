# Read Receipt Privacy Static Contract Guard

Date: 2026-06-11

Status: Static guard updated, checks not rerun in this note.

## What changed

- Added a dedicated "Read receipt privacy controls" section to the Supabase static contract audit.
- The guard now requires local markers for:
  - `current_user_allows_read_receipts`
  - `mark_conversation_read`
  - `read_receipts` privacy usage
  - smoke-test coverage that read status is not exposed when read receipts are off
  - smoke-test coverage that unread counts still clear locally when read receipts are hidden

## Why this matters

- Read receipts are a privacy-sensitive messaging behavior.
- The app UI and QA script treat read-receipt privacy as a launch requirement, so the backend guard should also require the database contract to stay present.

## Required next proof

- Rerun `npm run check:supabase-static-contract` from `PM_App`.
- Apply the full ordered migration set and run the Supabase smoke test against a target database before launch.
