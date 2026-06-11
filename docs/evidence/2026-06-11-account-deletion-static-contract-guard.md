# Account Deletion Static Contract Guard

Date: 2026-06-11

Status: Static guard updated, checks not rerun in this note.

## What changed

- Expanded the Supabase static contract audit with account-deletion request controls.
- The guard now requires local markers for:
  - `account_deletion_requests` table creation
  - one pending/reviewing request per user
  - row-level security
  - no direct authenticated writes
  - `request_account_deletion` RPC ownership
  - fixed `SECURITY DEFINER` search path
  - smoke-test rejection of direct inserts
  - smoke-test proof that the RPC creates or updates a pending request

## Why this matters

- Account deletion is a privacy-sensitive flow.
- The app UI says deletion is a backend-reviewed request, so the release guard should also require that backend contract to stay present.

## Required next proof

- Rerun `npm run check:supabase-static-contract` from `PM_App`.
- Apply the full migration set and run the Supabase smoke test against a target database before launch.
