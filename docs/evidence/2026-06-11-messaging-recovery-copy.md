# Messaging Recovery Copy

Date: 2026-06-11
Owner: Codex
Scope: PM_App messaging, call, likes, and help-link recovery copy.

## What changed

- Replaced messaging alert titles such as `Block unavailable`, `Unmatch unavailable`, `Report unavailable`, and `Photo unavailable` with recoverable action language.
- Replaced disabled call-screen labels such as `Safety options unavailable` with chat/safety recovery wording.
- Replaced call button accessibility labels from unavailable-state wording to message-first wording.
- Replaced `Chat unavailable` and `Conversation unavailable` with `Could not open...` recovery titles.
- Replaced the FAQ fallback title with `Could not open FAQ`.

## Why

The app should not make core messaging and safety controls feel like unfinished features. These failures are now phrased as recoverable user actions while preserving the underlying safety boundaries.

## Verification

Not run in this step. Run:

```powershell
npm run check:product-design-contract
npm run check:user-facing-safe-errors
```

## Boundary

This is local PM_App source-copy work only. It does not prove native-device rendering, messaging backend behavior, or live safety-flow behavior.
