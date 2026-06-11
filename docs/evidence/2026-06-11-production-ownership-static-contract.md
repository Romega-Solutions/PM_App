# Production Ownership Static Contract

## Status

Source update completed. The ownership contract was not run in this turn by instruction.

## Added

`scripts/check-production-ownership-contract.mjs`

## What it checks

- Expo app name, slug, and scheme.
- iOS bundle identifier.
- Android package identifier.
- EAS project ID presence.
- EAS production build and submit profile presence.
- Expo owner is present and not an explicitly unverified/personal owner.

## Current source signal

`app.json` currently declares `owner: "canthought"`. This must either be proven as Romega-controlled or transferred to a Romega-owned account/team before production launch signoff.

## Why it matters

App-store and EAS ownership cannot depend on one unclear personal account. This static contract makes the ownership blocker executable before launch.

## Evidence still needed

- Run `node scripts/check-production-ownership-contract.mjs`.
- Attach EAS owner/team proof without exposing tokens.
- Confirm at least one backup owner can access or recover the EAS project.
