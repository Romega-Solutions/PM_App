# Settings Error Client-Facing Copy

Date: 2026-06-11
Owner: Codex
Scope: PM_App notification and privacy settings load-error alerts.

## What changed

- Replaced `Notification preferences unavailable` with `Could not load notification preferences`.
- Replaced `Privacy settings unavailable` with `Could not load privacy settings`.
- Kept the existing inline recovery copy and retry actions unchanged.

## Why

Settings failures should read like recoverable user-facing errors, not release-state or availability labels. The screens already lock toggles and explain that defaults will not overwrite the account; the alert title now matches that recovery model.

## Verification

Not run in this step. Run:

```powershell
npm run check:product-design-contract
```

## Boundary

This is local PM_App source-copy work only. It does not prove native-device rendering, backend settings availability, or production behavior.
