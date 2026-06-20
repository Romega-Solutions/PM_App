# Secret Hygiene Remediation Runbook

## Status

Source/documentation update completed. No `.env` cleanup, git tracking change, secret inspection, rotation, tests, or release gates were run in this turn.

## Added

`docs\operations\SECRET_HYGIENE_REMEDIATION.md`

## What it defines

- Required approval before removing `.env` from git tracking.
- Safe cleanup command using `git rm --cached -- .env`.
- Rotation decision template.
- Git history cleanup decision template.
- Evidence required to clear the secret hygiene blocker.

## Why it matters

The release-local gate is intentionally blocked by tracked `.env`. This runbook makes the next step concrete without performing an approval-bound secret-handling action.

## Evidence still needed

- Explicit release/security approval.
- Approved cleanup execution.
- `npm run check:secret-hygiene` pass output.
- Rotation and history-cleanup decisions.
