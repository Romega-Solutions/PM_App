# PM_App Product Design Contract

Date: 2026-06-11
Status: Source gate added - not run

## What changed

- Added `scripts/check-product-design-contract.mjs`.
- Added `check:product-design-contract` to `package.json`.
- Wired the design contract into `check:source-contracts`.
- Added the script to the launch file contract markers.

## What the gate checks

- Auth and verification screens keep trust, recovery, and newest-link copy.
- Discovery keeps preference, visibility, retry, and filter-recovery cues.
- Profile and match cards keep review-first, no-photo, report, unmatch, and message affordances.
- Chat keeps active-conversation photo handling, private-photo copy, and visible report/block/unmatch actions.
- Report modal keeps data-minimization and retry-block copy.
- Privacy settings keep backend-backed, locked-load-failure, hidden-profile, and account-deletion review copy.
- Product design QA standard remains present.
- Forbidden guarantees, fake live calls, instant deletion claims, and automatic verification claims stay out of protected source surfaces.

## Verification

Not run in this pass. This is a source-only contract and does not replace native device QA, screenshots, accessibility review, or release-local validation.
