# Production Ownership Release Gate

Date: 2026-06-11
Owner: Codex
Result: Source patch only - not run

## What changed

- Added `npm run check:production-ownership-contract` to `npm run check:release-local`.
- Added `package.json` markers to the launch file contract so the release gate wiring is guarded.
- Updated the launch signoff checklist to state that PM_App release-local remains blocked until the current Expo owner is proven Romega-controlled or transferred.

## Current ownership status

`app.json` still contains `expo.owner: canthought`.

The existing `scripts/check-production-ownership-contract.mjs` treats `canthought` as personal or unverified and requires proof of Romega control or transfer to a Romega-owned account/team before launch.

## Why it matters

A production-ready app cannot depend on one personal developer account for Expo/EAS ownership, release builds, recovery, or incident access. This change makes ownership proof part of the local release gate instead of a standalone optional check.

## Verification status

Not run by instruction in this session. Required follow-up:

- Run `npm run check:release-local`.
- Provide Romega-controlled EAS owner proof or transfer the Expo project to a Romega-owned account/team.
- Capture redacted EAS ownership evidence in the launch packet.
