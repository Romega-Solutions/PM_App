# Profile details photo fallback

Date: 2026-06-11
Owner: Codex

## What changed

- Added a no-photo fallback state to the Discovery profile details modal.
- The details modal now shows a branded placeholder instead of rendering a missing image directly.
- The fallback includes an accessibility label so screen readers do not receive an empty image state.

## Why it matters

- Discovery profiles can exist without a visible photo.
- Profile details is also where users can inspect a member and report or block if something feels unsafe, so the modal should stay usable even when photo data is missing.

## Verification status

- Source files were patched locally.
- TypeScript, lint, native device QA, and visual QA were not rerun after this change.
- This does not prove production backend data quality or native-device rendering.
