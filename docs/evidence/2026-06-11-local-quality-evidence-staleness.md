# Local quality evidence staleness

Date: 2026-06-11
Owner: Codex

## What changed

- Updated the launch evidence packet to show PM_App and PM_Web local quality as needing rerun after later source, script, and documentation changes.
- Kept prior passing command evidence in place as historical proof, not current launch clearance.
- Pointed the current proof path to the newer wrapper commands:
  - PM_App: `npm run check:local-quality`, then `npm run check:release-local` after secret hygiene cleanup
  - PM_Web: `npm run check:local-quality`

## Why it matters

- Passing checks from earlier in the day do not prove later source and guard changes.
- Launch evidence must distinguish historical local checks from current releasable state.

## Verification status

- Evidence docs were patched locally.
- No lint, TypeScript, Jest, build, web audit, browser, native, Supabase, OCR, or production checks were rerun for this note.
