# PinayMate Secret Hygiene Guard

Date: 2026-06-11
Scope: PM_App tracked environment-file hygiene.

## What changed

- Added `scripts/check-secret-hygiene.mjs`.
- Added `npm run check:secret-hygiene`.
- Added the secret hygiene audit to `npm run check:release-local`.

## What the guard checks

- Uses `git ls-files` to inspect tracked files.
- Fails if a real env file such as `.env`, `.env.local`, `.env.production`, or similar is tracked.
- Allows env templates such as `.env.example`, `.env.sample`, and `.env.template`.
- Does not print or inspect secret values.

## Why it matters

PinayMate uses Supabase, OCR, app-store, DNS, and support/mailbox configuration. Real env files should not be tracked, and any value that was previously tracked should be reviewed for rotation before production launch.

## Not verified in this pass

- `npm run check:secret-hygiene` was not executed.
- No git-index change was made.
- `.env` was not removed from tracking because that requires explicit approval.

## Current remediation guidance

- The guard should fail while real env files are tracked.
- After explicit approval, remove tracked env files from the git index without deleting the local file.
- Record whether previously tracked Supabase anon/publishable or provider values need rotation.
- Do not paste env values into release evidence.
