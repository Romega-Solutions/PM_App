# PM_App match card accessibility regression guard

Date: 2026-06-11

## Scope

PM_App product-design contract guard for matching UI accessibility.

## What changed

- Added `aria-hidden` to the forbidden markers for `src/features/matching/components/MatchCard.tsx` in the PM_App product design contract.
- This protects the React Native-safe separator cleanup from regressing back to a DOM-specific accessibility prop.
- The visual match card behavior is unchanged.

## Files touched

- `scripts/check-product-design-contract.mjs`

## Verification status

Not run in this pass.

This is source-level evidence only. It does not prove the product design contract passes, TypeScript passes, Expo runtime behavior works, native accessibility behavior is correct, or production readiness is complete.
