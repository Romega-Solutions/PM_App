# PinayMate Before User Created hook (ticket #48)

Supabase Auth HTTP hook. Supabase Auth calls it **before** every new `auth.users`
row is created. It records the sign-up country and a VPN/proxy signal on the
server. It is a **soft filter, not a wall**: by default every sign-up is allowed.

Evidence, vendor comparison and test output: `docs/evidence/2026-11-geo-lock/README.md`.

## What it does

1. Verifies the Standard Webhooks signature (`webhook-id`, `webhook-timestamp`,
   `webhook-signature`) with `BEFORE_USER_CREATED_HOOK_SECRET`. Bad or missing
   signature returns 401 and writes nothing.
2. Reads `metadata.ip_address` from the hook payload (the IP that called Supabase
   Auth). The raw IP is sent to the vendor but **never stored**.
3. Looks it up with `GEO_SIGNAL_PROVIDER` (`ipqs`, `ipinfo_lite` or `none`),
   2.5 s timeout.
4. Calls `public.record_signup_signal(...)` with the service-role key, which
   writes one `public.signup_signals` row per user.
5. Returns `{}` (allow). Only when `GEO_BLOCK_VPN_SIGNUPS=true` does it reject a
   VPN/proxy/Tor sign-up that is not a mobile-carrier IP.

## Soft flag

| `soft_flag` | When | App can show |
|---|---|---|
| `none` | PH, or US + California (US with unknown region counts as OK) | nothing |
| `review_suggested` | VPN/proxy/Tor, outside PH/US, US outside California, or no country | gentle "we may ask for ID later" note |
| `unavailable` | vendor error, timeout, quota, not configured, private IP | nothing (treat as unknown) |

`reasons` (stored, not shown to the user): `vpn_or_proxy`, `outside_launch_country`,
`outside_launch_region`, `country_unknown`, `lookup_<status>`.

The app reads its own flag with `supabase.rpc("get_my_signup_signal")`
(`src/features/auth/api/signupSignalApi.ts`). The RPC returns only the flag and
time, never the country or VPN details.

## Vendor failure: fail-open

| Failure | Result |
|---|---|
| Vendor timeout / 5xx / bad JSON | sign-up allowed, `soft_flag = unavailable` |
| Vendor quota exceeded | sign-up allowed, `soft_flag = unavailable`, `reasons = {lookup_quota}` |
| Vendor key not set | sign-up allowed, `lookup_status = not_configured` |
| `record_signup_signal` fails | sign-up allowed, error logged, no row |
| Hook secret not set | sign-up allowed, nothing written, error logged |
| **This function is down / not deployed** | **Supabase Auth fails the sign-up** (local proof: HTTP 422 "Failed to reach hook within maximum time of 5.000000 seconds"). Kill switch: Dashboard → Authentication → Hooks → disable "Before User Created". |

## Config

Secrets (Supabase → Edge Functions → Secrets). **Names only; values are set by Duane.**

| Name | Needed | Notes |
|---|---|---|
| `BEFORE_USER_CREATED_HOOK_SECRET` | yes | `v1,whsec_<base64>` generated in Dashboard → Authentication → Hooks. Same value in the hook config and the function secret. |
| `GEO_SIGNAL_PROVIDER` | yes | `ipqs` (recommended for beta), `ipinfo_lite`, or `none` |
| `GEO_IPQS_API_KEY` | if `ipqs` | placeholder name until Duane confirms the real one |
| `GEO_IPINFO_TOKEN` | if `ipinfo_lite` | placeholder name until Duane confirms the real one |
| `GEO_BLOCK_VPN_SIGNUPS` | no | default off. `true` = reject VPN/proxy/Tor (never mobile carrier IPs). Only if Duane chooses it. |
| `GEO_LAUNCH_COUNTRIES` | no | default `PH,US` |
| `GEO_US_LAUNCH_REGIONS` | no | default `California` |
| `GEO_PROVIDER_TIMEOUT_MS` | no | default 2500 (200-4000). Auth gives the whole hook 5 s. |
| `GEO_IPQS_BASE_URL`, `GEO_IPINFO_BASE_URL`, `GEO_LOOKUP_PRIVATE_IPS` | local tests only | point at a stub; never set in production |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided by Supabase.

`supabase/config.toml` sets `verify_jwt = false` for this function: Supabase Auth
does not send a user JWT; the webhook signature is the authentication.

Hook registration (Dashboard → Authentication → Hooks → Before User Created → HTTPS):
`https://prxykmkexfovbiatylue.supabase.co/functions/v1/before-user-created`.

Local `config.toml` block used for the proof (scratch copy only, not committed):

```toml
[auth.hook.before_user_created]
enabled = true
uri = "http://host.docker.internal:<api-port>/functions/v1/before-user-created"
secrets = "env(BEFORE_USER_CREATED_HOOK_SECRET)"
```

## Rejecting (only with `GEO_BLOCK_VPN_SIGNUPS=true`)

The function returns HTTP **200** with `{"error":{"http_code":403,"message":...}}`.
A non-2xx status from the hook makes Supabase Auth answer a generic 500
("Unexpected status code returned from hook: 403"), proved locally. With 200 +
error body the client gets HTTP 403 and the message. The PM_App sign-up screen
currently maps any sign-up error to its generic message.

## Limits

- Residential proxies and new VPNs slip through. This is a filter, not proof.
- Mobile carrier NAT shares IPs; we never block on carrier IPs.
- OFWs and travelers will get `review_suggested`; the ID-review path (Persona,
  week 3) is the way through, not a block.
