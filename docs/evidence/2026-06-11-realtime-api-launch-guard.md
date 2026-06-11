# Realtime API Launch Guard

## Status

Source update completed. The launch-file contract guard was not run in this turn by instruction.

## Changed

`scripts/check-launch-file-contract.mjs` now checks `src/features/messaging/api/realtime.api.ts` for defensive realtime handling markers.

## Why it matters

Realtime chat failures should degrade safely. This guard makes the launch file contract track defensive handling for message hydration, typing broadcast, and presence tracking.

## Evidence still needed

- Run `npm run check:launch-file-contract`.
- Run PM_App lint and TypeScript checks.
- Native-test realtime behavior.
