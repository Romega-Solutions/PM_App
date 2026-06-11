# PM_App local quality script

Date: 2026-06-11
Owner: Codex

## What changed

- Added `npm run check:local-quality` to PM_App.
- The script runs privacy-log guard, Supabase static contract guard, lint, TypeScript, Jest, and web export in the same order used by launch evidence.
- Updated release docs so the local-quality command is the short path for in-control app verification.

## Why it matters

- `npm run check:release-local` is correctly blocked by tracked `.env` until secret hygiene cleanup is approved.
- Engineers still need a single command for local app quality checks that do not require live Supabase, OCR, devices, or account access.
- The local-quality command now covers the non-secret local privacy and static backend-contract checks before the slower app checks.

## Verification status

- Script and docs were patched locally.
- `npm run check:local-quality` was not executed after this addition or after the later wrapper expansion.
- This does not prove native-device QA, live Supabase state, deployed OCR behavior, or production web/mailbox behavior.
