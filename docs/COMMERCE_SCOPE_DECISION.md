# PinayMate commerce scope decision

Status: source decision only - this is not checkout proof.
Last updated: 2026-06-11
Owner: product design + full-stack release owner

## Launch decision

PinayMate does not ship paid checkout, subscriptions, card collection, paid boosts, paid ranking, paid verification, or paid feature access in this launch scope.

PM_Web may show planned membership direction and collect plan-interest email only. PM_App may show unavailable or future paid-feature states only when the copy clearly says paid features are launch-gated.

## Allowed customer-facing language

- Planned pricing.
- Register interest.
- Launch-interest email.
- Paid features are not open yet.
- Checkout is not available today.
- No payment is collected on PM_Web or PM_App.

## Forbidden customer-facing language until proof exists

- Pay now.
- Subscribe now.
- Checkout now.
- Upgrade now.
- Buy now.
- Premium is active.
- Paid members get more matches.
- Paid members get higher ranking.
- Payment creates a profile, match request, verification badge, safety status, or faster moderation.

## Required proof before enabling commerce

- Romega-owned payment processor account and recovery ownership proof.
- Legal terms, refund policy, support path, and charge-dispute owner signoff.
- Checkout UI QA on desktop and mobile.
- Backend schema for products, prices, subscriptions, payment records, webhook events, and entitlement state.
- RLS or server-only access proof for payment and entitlement tables.
- Webhook signature verification proof.
- Failed, canceled, refunded, expired, and renewed subscription behavior proof.
- Receipt and support mailbox delivery proof.
- Evidence recorded in `docs/LAUNCH_EVIDENCE_PACKET.md`.

## Product rationale

Plan-interest capture is useful for conversion learning, but collecting payment before the app has current native QA, live Supabase proof, safety operations, support ownership, and legal/refund coverage would create avoidable user trust and support risk.

## Launch-state contract

If this decision changes, update all of these before publishing stronger claims:

- `docs/PINAYMATE_LAUNCH_STATE_MATRIX.md`
- `PM_Web/docs/PINAYMATE_LAUNCH_STATE_MATRIX.md`
- `PM_Web/src/lib/launchEmailLinks.ts`
- PM_Web membership and CTA copy
- PM_App paid-feature or unavailable-feature copy
- release evidence and signoff checklists
