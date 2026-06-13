# Call Screens Client-Facing Copy

Date: 2026-06-11
Owner: Codex
Scope: PM_App voice and video call placeholder screens.

## What changed

- Replaced launch/readiness copy on the voice and video call screens with client-facing safety copy.
- Removed public references to provider verification, support-process verification, and launch approval.
- Kept the important user-safety facts: no call was started, no microphone permission was requested, and no camera permission was requested.
- Kept report/block access visible when the member can be identified.
- Updated PM_App launch-file and product-design source contracts to guard the new wording.

## Why

The call screens should not feel like unfinished release notes. They should clearly tell the member that this chat stays in messages, no device permission was requested, and safety actions remain available.

## Verification

Not run in this step. Run:

```powershell
npm run check:launch-file-contract
npm run check:product-design-contract
```

## Boundary

This is local PM_App source-copy and source-guard work only. It does not prove native-device rendering, live calling provider behavior, or production release readiness.
