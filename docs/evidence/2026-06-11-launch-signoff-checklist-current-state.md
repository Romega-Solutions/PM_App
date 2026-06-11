# Launch signoff checklist current-state update

Date: 2026-06-11
Owner: Codex

## What changed

- Updated the launch signoff checklist to show that PM_App release-local is currently blocked by tracked `.env`.
- Added a local release gate section that lists the PM_App and PM_Web commands to run before staging or production signoff.
- Added secret-hygiene as a named owner gate with required evidence.

## Why it matters

- The release checklist previously summarized local code checks as green, but the current release guard fails until `.env` is removed from the git index/history plan.
- Managers and engineers now see the exact first blocker before spending time on staging, OCR, native QA, or production web proof.

## Verification status

- Documentation was patched locally.
- No commands were rerun for this evidence note.
- This note does not prove `.env` cleanup, Supabase live state, OCR deployment, native QA, or production PM_Web behavior.
