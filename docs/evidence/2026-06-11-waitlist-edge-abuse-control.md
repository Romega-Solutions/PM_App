# Waitlist Edge Function Abuse Control

Date: 2026-06-11
Status: Source-only update, not runtime proof
Owner: Codex

## What changed

- Added `supabase/functions/waitlist-signup` as the public waitlist backend front door.
- Added `supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql`.
- Added `waitlist_edge_attempts` and `claim_waitlist_edge_attempt` for service-role-only hourly attempt throttling.
- Revoked anonymous/authenticated execution from `submit_waitlist_signup` so browser clients cannot call the row-writing RPC directly after the final migration is applied.
- Revoked direct `service_role` table privileges from `waitlist_signups`; the Edge Function should use the service-role key only to execute the security-definer RPC.
- Rewired PM_Web `src/lib/waitlistBackendHandoff.ts` to call `/functions/v1/waitlist-signup` instead of `/rest/v1/rpc/submit_waitlist_signup`.
- Added PM_Web honeypot support through the waitlist form.
- Updated smoke/preflight SQL, release docs, and source guards to require Edge Function deploy/secrets/rate-limit proof before backend capture can be enabled.

## Runtime proof still required

This source update is not launch proof. Before enabling `VITE_PINAYMATE_WAITLIST_ABUSE_CONTROL_APPROVED`, capture target-environment evidence for:

- migration history through `20260611140000_add_waitlist_edge_abuse_control.sql`
- preflight SQL pass
- safety smoke SQL pass
- `waitlist-signup` deploy output
- `WAITLIST_ALLOWED_ORIGINS` approved values
- `WAITLIST_RATE_LIMIT_SALT` presence
- service-role secret present only server-side
- direct anon/authenticated RPC execution denied
- valid approved-origin request accepted
- repeated same-client request throttled
- honeypot-filled request does not create a waitlist row
