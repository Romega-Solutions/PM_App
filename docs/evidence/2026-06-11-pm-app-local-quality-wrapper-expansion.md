# PM_App local quality wrapper expansion

Date: 2026-06-11
Owner: Codex

## What changed

- Expanded `npm run check:local-quality` to include:
  - `npm run check:privacy-logs`
  - `npm run check:supabase-static-contract`
  - `npm run lint`
  - `npx tsc --noEmit --pretty false`
  - `npm test -- --runInBand --no-cache`
  - `npm run build:web`
- Updated the launch signoff checklist so PM_App local verification uses the wrapper first, then `npm run check:release-local` for secret hygiene.

## Why it matters

- Privacy-log safety and the static Supabase contract are local, in-control gates.
- They should be part of the same local-quality pass as lint, typecheck, tests, and web export.
- `npm run check:release-local` remains intentionally blocked until tracked `.env` cleanup is approved.

## Verification status

- Script and docs were patched locally.
- `npm run check:local-quality` was not executed after this expansion.
- No secret hygiene cleanup, live Supabase proof, OCR deployment, native QA, or production PM_Web proof was performed.
