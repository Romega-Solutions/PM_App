# Verification Upload Client-Facing Copy

Date: 2026-06-11
Owner: Codex
Scope: PM_App verification upload screen.

## What changed

- Replaced "unavailable" trust-cue wording with clearer badge-after-approval language.
- Kept the safety boundary that verification is private review, not instant approval.
- Kept the user boundary that verified status does not guarantee another member is safe.
- Updated PM_App launch-file and product-design source contracts to guard the revised copy.

## Why

The verification flow should explain the member outcome without sounding like an internal launch checklist. Members now see the practical rule: they can continue setup, and the verified badge appears only after an approved review.

## Verification

Not run in this step. Run:

```powershell
npm run check:launch-file-contract
npm run check:product-design-contract
```

## Boundary

This is local PM_App source-copy and source-guard work only. It does not prove native-device rendering, live reviewer operations, storage policy behavior, or production verification approval behavior.
