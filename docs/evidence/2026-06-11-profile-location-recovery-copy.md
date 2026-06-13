# Profile and Location Recovery Copy

Date: 2026-06-11
Owner: Codex
Scope: PM_App profile and location recovery copy.

## What changed

- Replaced `Location unavailable` with `Could not get location`.
- Replaced `Profile unavailable` accessibility copy with `Could not load profile`.

## Why

Profile and location failures should read like recoverable user actions, not feature availability states. The updated copy tells members what failed without implying the product area is unfinished.

## Verification

Not run in this step. Run:

```powershell
npm run check:product-design-contract
npm run check:user-facing-safe-errors
```

## Boundary

This is local PM_App source-copy work only. It does not prove native-device rendering, location permission behavior, profile API behavior, or production app behavior.
