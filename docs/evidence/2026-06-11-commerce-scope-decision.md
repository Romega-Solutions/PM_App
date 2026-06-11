# Commerce scope decision

Date: 2026-06-11
Owner: Codex

## Scope

This source-only update makes commerce/payment de-scope explicit for launch.

## What changed

- Added `docs/COMMERCE_SCOPE_DECISION.md` as the commerce source decision.
- Updated the PM_Web launch-state snapshot so paid ranking, paid verification, paid boost, subscriptions, card collection, checkout, and paid feature access remain blocked.
- Updated PM_Web release checklist with a commerce de-scope audit row.
- Expanded PM_Web source guards to fail on paid ranking, paid badge, paid verification, and paid-feature-access claims.
- Added the commerce decision to the PM_App launch-file contract.

## Product decision

Plan-interest capture stays allowed as conversion learning. Payment collection, subscriptions, paid boosts, paid ranking, paid verification, and paid entitlements remain out of launch scope until processor ownership, legal/refund/support coverage, checkout QA, webhook proof, entitlement backend proof, and launch evidence are complete.

## Validation status

Not run. This is source evidence only.

Required proof before commerce can be claimed:

- Payment processor ownership proof.
- Checkout UI QA.
- Payment backend schema and RLS/server-only proof.
- Webhook signature verification proof.
- Refund, cancellation, failed-payment, renewal, and expired-entitlement proof.
- Receipt/support mailbox delivery proof.
