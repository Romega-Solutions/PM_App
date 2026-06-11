# PinayMate Privacy Log Audit Guard

Date: 2026-06-11
Scope: PM_App runtime source under `app/` and `src/`.

## What changed

- Added `scripts/check-privacy-logs.mjs`.
- Added `npm run check:privacy-logs`.

## What the guard checks

- Fails on `console.log`, `console.debug`, and `console.info` calls in app runtime code.
- Fails on `console.error` and `console.warn` calls that pass multiple top-level arguments, which is the common pattern that leaks raw Supabase errors, profile rows, auth payloads, IDs, URLs, or media objects.
- Skips build output, coverage, `.expo`, `.git`, and `node_modules`.

## Why it matters

PinayMate handles dating, identity, verification, profile, location, and messaging data. The guard makes the recent privacy-hardening work repeatable instead of relying on manual review.

## Not verified in this pass

- The new audit command was not executed in this pass.
- Full lint, typecheck, test, and build gates were not rerun.
- Live Supabase, OCR, native-device QA, DNS/mailbox, app-store, and checkout readiness remain separate production gates.
