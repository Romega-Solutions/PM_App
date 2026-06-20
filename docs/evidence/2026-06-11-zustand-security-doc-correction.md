# PinayMate Zustand Security Doc Correction

Date: 2026-06-11
Scope: `docs\architecture\ZUSTAND_IMPLEMENTATION.md`.

## What changed

- Replaced the stale claim that session tokens are "encrypted by OS via AsyncStorage."
- Updated the storage description to match the launch posture: native builds use SecureStore through the configured auth storage adapter, while web builds use web-compatible storage.
- Clarified that passwords are not persisted and that signup/profile metadata should not be stored persistently unless a launch requirement explicitly needs it.

## Why it matters

The previous wording overclaimed storage security and could mislead launch reviewers. The revised wording is more accurate for a cross-platform Expo app.

## Not verified in this pass

- No command, lint, test, or build was run.
- Live native storage behavior and production auth behavior remain part of native QA and release verification.
