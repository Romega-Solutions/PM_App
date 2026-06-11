# PinayMate waitlist abuse and rate-limit decision

Status: source Edge Function path added - not live abuse-protection proof.
Last updated: 2026-06-11
Owner: product design + full-stack release owner

## Launch decision

PM_Web remains email-fallback first until the backend waitlist path has target-environment proof.

PM_Web remains email-capture only until the backend waitlist RPC has target-environment proof.

The public backend path is now designed as:

```text
PM_Web waitlist form -> Supabase Edge Function `waitlist-signup` -> service-role RPC calls -> `claim_waitlist_edge_attempt` -> `submit_waitlist_signup`
```

PM_Web must not call `submit_waitlist_signup` directly from the browser. The final waitlist hardening migration makes the RPC service-role-only and adds a separate Edge Function attempt bucket before the row-writing RPC runs.

## Minimum public-launch controls

Before setting `VITE_PINAYMATE_WAITLIST_ABUSE_CONTROL_APPROVED=true`, the release owner must prove all of this in the target environment:

- `20260611140000_add_waitlist_edge_abuse_control.sql` is applied.
- `waitlist-signup` Edge Function is deployed with `verify_jwt = false` only because it is the public form endpoint.
- `SUPABASE_SERVICE_ROLE_KEY` is available only inside the Edge Function runtime and is not exposed to PM_Web or PM_App.
- `WAITLIST_ALLOWED_ORIGINS` contains only approved PM_Web origins.
- `WAITLIST_RATE_LIMIT_SALT` is present and high entropy.
- `WAITLIST_ALLOW_NO_ORIGIN` is disabled in production unless explicitly risk-accepted.
- `WAITLIST_TURNSTILE_SECRET_KEY` and `WAITLIST_REQUIRE_TURNSTILE=true` are present if challenge-provider proof is required for the launch decision.
- The public path runs through an edge/server route that enforces IP or fingerprint rate limits.
- Turnstile or reCAPTCHA is enabled, or the release owner records why challenge protection is not required.
- provider-level WAF/rate-limit rules are reviewed for the public waitlist route.
- Anonymous and authenticated clients cannot execute `submit_waitlist_signup` directly.
- Anonymous and authenticated clients cannot execute `claim_waitlist_edge_attempt` directly.
- Repeated requests from the same client bucket are throttled by `claim_waitlist_edge_attempt`.
- Honeypot-filled bot submissions return a generic accepted response without creating a waitlist row.

## Required backend proof

- `waitlist_signups` exists with RLS enabled and forced.
- `waitlist_edge_attempts` exists with RLS enabled and forced.
- `anon` and `authenticated` cannot directly select, insert, or update `waitlist_signups`.
anon and authenticated cannot directly select, insert, or update waitlist_signups.
- `anon`, `authenticated`, and direct `service_role` grants cannot directly select, insert, or update `waitlist_edge_attempts`.
- `anon`, `authenticated`, and direct `service_role` grants cannot directly select, insert, update, or delete `waitlist_signups`.
- `submit_waitlist_signup` is executable only by `service_role`.
- `claim_waitlist_edge_attempt` is executable only by `service_role`.
- `waitlist-signup` accepts valid minimal email/platform input from an approved origin.
- `waitlist-signup` rejects malformed email safely.
- Duplicate email/platform submissions return the generic accepted shape.
- Blocked or unsubscribed waitlist rows are not refreshed by public duplicate submissions.
- Public abuse-control evidence is recorded before routing PM_Web traffic to the Edge Function.

## Data minimization boundary

Waitlist capture may store only:

- email address
- normalized email
- platform interest
- source
- status
- timestamps
- coarse IP prefix for abuse buckets
- HMAC client fingerprint for abuse buckets
- edge attempt counts and bucket timestamps

Waitlist capture must not ask for passwords, payment details, ID documents, precise location, private profile details, or private messages.

## Launch-state boundary

Backend waitlist capture does not create an app account, dating profile, match request, matching session, checkout, payment record, verified badge, or paid access.
