# Dependency Audit Release Gate

Date: 2026-06-11

Status: Gate added, not rerun in this note.

## What changed

- Added `npm run check:dependency-audit`.
- Updated `npm run check:release-local` to include dependency audit before local quality checks.
- Added a dependency audit remediation plan for Expo-chain advisories.
- Updated README release notes to explain that forced audit fixes are not approved on the release branch when they change Expo runtime dependencies.

## Why this matters

- QA already observed moderate advisories through the Expo dependency chain.
- A production-ready launch should not pass release-local while dependency advisories are known but unenforced.
- Forced audit remediation can create a larger release risk if it downgrades or changes Expo runtime dependencies without a planned upgrade/test cycle.

## Required next proof

- Rerun `npm run check:dependency-audit`.
- Resolve advisories through a dedicated dependency branch or attach an explicit accepted-risk decision to the launch evidence packet.
- Rerun PM_App local quality and native QA after any dependency changes.
