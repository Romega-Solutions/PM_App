# User-Facing Safe Error Contract Guard

## Status

Source update completed. The new guard and launch-file contract were not run in this turn by instruction.

## Added

`scripts/check-user-facing-safe-errors.mjs`

## What it checks

- Safe-error markers in high-risk auth, account setup, profile, matching, and messaging files.
- Raw caught-error propagation patterns such as:
  - throwing the caught backend/provider error directly
  - returning the raw error object
  - returning raw `error.message`
  - passing raw `error.message` directly into hook state
  - throwing `new Error(error.message)`

## Why it matters

Recent hardening replaced raw Supabase, storage, RPC, auth, and messaging errors with safe user-facing recovery copy. This guard makes that work auditable and harder to regress before launch.

## Launch-file contract

`scripts/check-launch-file-contract.mjs` now treats this guard script as launch-critical release content.

## Evidence still needed

- Run `npm run check:launch-file-contract`.
- Run `node scripts/check-user-facing-safe-errors.mjs`.
- Decide whether to wire this guard into `check:local-quality` or `check:release-local` after the current source churn settles.
