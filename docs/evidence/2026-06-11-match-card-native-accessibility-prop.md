# PM_App match card native accessibility prop cleanup

Date: 2026-06-11

## Scope

PM_App matching UI source cleanup.

## What changed

- Replaced the web-style `aria-hidden` prop on the match separator text with React Native `accessible={false}`.
- Kept the visual separator unchanged.
- Reduced the risk of native TypeScript/runtime incompatibility from a DOM-specific accessibility prop in a React Native component.

## Files touched

- `src/features/matching/components/MatchCard.tsx`

## Verification status

Not run in this pass.

This is source-level evidence only. It does not prove TypeScript, Jest, Expo runtime behavior, native screen-reader behavior, or production readiness.
