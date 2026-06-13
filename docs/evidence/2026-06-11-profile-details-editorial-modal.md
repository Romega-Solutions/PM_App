# PM_App profile details editorial modal

Date: 2026-06-11
Owner: Codex
Status: Source updated, not run

## What changed

- Refactored `src/features/matching/components/ProfileDetailsModal.tsx` to reduce chip and boxed-panel clutter.
- Changed interests from pill tags into a simple editorial list.
- Changed expanded profile details from pill chips into icon-led rows.
- Changed the safety panel into a vertical safety rail with an inline Report or block action.
- Preserved image fallback, close action, expandable sections, profile copy, report handler, accessibility labels, and hints.

## Why this matters

The profile detail modal is where users decide whether to keep engaging or use safety controls. It should feel readable and trustworthy, not like stacked chips inside a boxed warning card.

## Verification

- Not run this turn.
- Recommended check when requested: `npm run check:product-design-contract` from `PM_App`.
