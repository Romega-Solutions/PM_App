# Launch Evidence Contract

Date: 2026-06-11
Status: Source gate added - expected to fail until real launch evidence is filled

## What changed

- Added `scripts/check-launch-evidence-contract.mjs`.
- Added `check:launch-evidence-contract` to `package.json`.
- Wired the launch evidence contract into `check:release-local`.
- Added the new script to the launch file contract markers.
- Updated launch-critical evidence tables to include an explicit `Result` column.

## What the gate checks

- Supabase staging evidence must include a launch result, owner, date, and evidence note/path.
- OCR live evidence must include a launch result, owner, date, and evidence note/path.
- Native app evidence must include a launch result, owner, date, and evidence note/path.
- PM_Web production evidence must include a launch result, owner, date, and evidence note/path.
- Safety/moderation evidence must include a launch result, owner, date, and evidence note/path.
- Final launch decision rows must be approved, passed, or explicitly deferred with risk acceptance.

## Why it matters

The launch packet already says evidence rows need result, owner, date, and proof. The launch-critical tables now expose that field directly, and this gate prevents blank or blocked rows from being missed during a local release check.

## Verification

Not run in this pass. The gate is expected to fail until real staging, OCR, native, production-web, safety, and final signoff evidence is filled.
