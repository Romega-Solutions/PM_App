# PM_App chat accessibility fallback-copy cleanup

Date: 2026-06-11
Owner: Codex
Status: Source updated, not run

## What changed

- Replaced the chat emoji button accessibility hint from fallback-oriented wording to direct member guidance.
- Extended `scripts/check-user-facing-safe-errors.mjs` to block the old accessibility hint phrase from returning.

## Why this matters

Screen-reader copy is still product copy. It should explain the action clearly instead of exposing implementation or fallback language.

## Verification

- Not run this turn.
- Recommended check when requested: `npm run check:user-facing-safe-errors` from `PM_App`.
