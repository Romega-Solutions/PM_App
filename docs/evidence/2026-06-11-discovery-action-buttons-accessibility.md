# Discovery Action Buttons Accessibility Polish

## Status

Source update completed. No tests, lint, typecheck, native runtime QA, or accessibility tooling were run in this turn by instruction.

## Changed

`src/features/matching/components/ActionButtons.tsx`

- Added expanded `hitSlop` to pass, super-like, like, and details controls.
- Added disabled-state accessibility hints so screen-reader users hear why controls are temporarily unavailable during a pending action.
- Kept existing visible labels, action labels, and disabled opacity.

## Why it matters

Discovery actions are core retention controls. Larger tap areas and clearer disabled feedback reduce accidental misses and make pending swipe states easier to understand on mobile.

## Evidence still needed

- Run PM_App lint and TypeScript checks.
- Validate on native device/emulator with touch and screen-reader paths.
