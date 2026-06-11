# Notification Delivery Contract

Date: 2026-06-11
Status: Source gate added - not run

## What changed

- Added `scripts/check-notification-delivery-contract.mjs`.
- Added `check:notification-delivery-contract` to `package.json`.
- Wired the notification contract into `check:source-contracts`.
- Added the notification contract and notification settings screen to launch file contract markers.

## What the gate checks

- Notification settings remain framed as launch-stage preferences.
- Push delivery is not claimed until notification provider proof exists.
- Email delivery is not claimed until mailbox/provider proof exists.
- Native QA and product-design QA continue to require notification delivery evidence.
- PM_Web mailto evidence is not over-counted as app notification or transactional email proof.

## Verification

Not run in this pass. This is source-only protection and does not prove push delivery, email delivery, provider configuration, device permissions, or mailbox routing.
