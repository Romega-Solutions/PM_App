# Source Contract Wrapper

## Status

Source update completed. The npm scripts were not run in this turn by instruction.

## Changed

`package.json`

- Added `check:source-contracts`.
- Wired `check:source-contracts` into `check:local-quality`.
- Added named scripts for:
  - `check:user-facing-safe-errors`
  - `check:auth-redirect-contract`
  - `check:env-template-contract`
  - `check:production-ownership-contract`
- Kept `check:production-ownership-contract` separate from `check:local-quality` because it is expected to fail until Expo/EAS ownership is proven or transferred.
- Simplified `check:release-local` so source contracts run through `check:local-quality`.

## Why it matters

Recent hardening added several static source contracts. This wrapper turns them into a single local-quality gate without mixing in approval-bound ownership proof.

## Evidence still needed

- Run `npm run check:source-contracts`.
- Run `npm run check:local-quality`.
- Run `npm run check:production-ownership-contract` separately after ownership proof or transfer.
