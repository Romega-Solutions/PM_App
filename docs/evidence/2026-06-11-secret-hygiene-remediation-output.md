# Secret hygiene remediation output

Date: 2026-06-11
Owner: Codex

## What changed

- Improved the secret-hygiene guard failure message.
- The guard now prints safe remediation steps for tracked env files:
  - remove tracked env files from the git index after explicit approval
  - keep the local env file on disk
  - commit cleanup only after review
  - record whether tracked values need rotation
  - never paste env values into evidence

## Why it matters

- PM_App release-local is currently blocked by tracked `.env`.
- The guard should tell the next engineer exactly how to clear the blocker safely without deleting local configuration or exposing values.

## Verification status

- Script and evidence docs were patched locally.
- `npm run check:secret-hygiene` was not rerun after this message update.
- No git-index cleanup, commit, push, or secret rotation was performed.
