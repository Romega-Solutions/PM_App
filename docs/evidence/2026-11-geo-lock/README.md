# Ticket #48: geo-lock check at sign-up (evidence)

Date: 2026-11-21
Owner: Kirk Gamo. Reviewer: Duane Vargas.
Scope: closed beta (soft launch Philippines + California). Nothing here was run against production project `prxykmkexfovbiatylue`.

Plan source: *PinayMate — 6-week production-readiness plan (Nov 2026)*, section "How the geo-lock works and its limits", and positioning row 2 "Geo + ID as a filter, not a wall".

## 1. What changed

| Piece | File |
|---|---|
| Auth hook (Edge Function) | `supabase/functions/before-user-created/index.ts` (+ `README.md`) |
| Table + RPCs | `supabase/migrations/20261121140000_add_signup_geo_signals.sql` |
| Function config | `supabase/config.toml` → `[functions.before-user-created] verify_jwt = false` |
| App helper (no UI change) | `src/features/auth/api/signupSignalApi.ts` + test |
| Local proof SQL | `supabase/tests/07_signup_signal_proof.sql` (local only, rolls back) |

Flow: app → Supabase Auth `/signup` (or OAuth callback) → **Before User Created hook** → this Edge Function → vendor lookup on `metadata.ip_address` → `record_signup_signal()` → `{}` (allow).

`public.signup_signals` stores: country, region, `is_vpn`, `is_proxy`, `is_tor`, `is_mobile`, fraud score, `soft_flag`, `reasons`, `enforcement`, trimmed vendor status, auth provider. **No raw IP.** No client can read or write it; the signed-in user can read only their own `soft_flag` via `get_my_signup_signal()`.

## 2. Vendor comparison (read 2026-11-21)

Numbers change: **check current pricing** before Duane signs up.

| | IPQS (IPQualityScore) free | IPinfo Lite (free) |
|---|---|---|
| Country | yes (`country_code`, plus `region`, city) — *from API docs, not re-read today* | yes (`country_code`, continent) |
| US state / California | yes (`region`) | **no** (country level only) |
| VPN / proxy / Tor flags | yes (`vpn`, `proxy`, `tor`, `active_vpn`, `mobile`, `fraud_score`) | **no**. Privacy detection starts at IPinfo **Core**, $26/mo (check current pricing) |
| Mobile carrier flag | yes (`mobile`) | no (Core "Connection Context") |
| Free cap | **1,000 lookups / month** on the product page per search snippet; older IPQS pages say 5,000 (check current pricing) | **unlimited** API requests ("no daily or monthly limit") |
| Commercial use on free plan | **not confirmed** (pages blocked automated reading; terms not read) | yes, CC BY-SA 4.0, **attribution to IPinfo required** (ShareAlike terms to check) |
| Auth | key in URL path (`/api/json/ip/{key}/{ip}`) | `?token=` query param |
| Sign-up | https://www.ipqualityscore.com/create-account (verify link) | https://ipinfo.io/signup ("Free forever · no credit card") |
| Sources | https://www.ipqualityscore.com/proxy-vpn-tor-detection-service , https://www.ipqualityscore.com/ | https://ipinfo.io/products , https://ipinfo.io/pricing , https://ipinfo.io/lite , https://ipinfo.io/developers/lite-api |

How the IPQS column was checked: ipqualityscore.com serves a Cloudflare bot check to automated readers (HTTP 403 in the fetch tool and the in-app browser), so I did not bypass it. The cap comes from IPQS's own pages as indexed by search today. **Kirk/Duane: open https://www.ipqualityscore.com/plans in a normal browser and confirm the free cap, that the free plan includes VPN/proxy flags, and the commercial-use terms before choosing.**

Correction to the plan doc: the plan says "IPinfo Lite is free and flags VPNs and proxies". IPinfo's current pricing page marks Privacy Detection as **not included** in Lite; it starts at Core.

**Recommendation for beta: IPQS free** (`GEO_SIGNAL_PROVIDER=ipqs`). It is the only free option that gives the VPN/proxy signal the plan asks for, plus California (region) and the mobile-carrier flag we need to avoid punishing carrier NAT. The hook calls the vendor only on account creation, so 1,000/month covers closed beta. If the IPQS terms rule out commercial use, or the quota runs out, switch the secret to `ipinfo_lite`: country stays available (unlimited), VPN flags become NULL, and nothing else changes. Both providers are already implemented and tested against a stub.

## 3. Vercel `x-vercel-ip-country`: why it is not used yet

The plan names Vercel's free header as the first signal. In this codebase it cannot reach the server path:

- PM_App on Vercel is a static Expo web export (`vercel.json` has no functions; there is no `api/` folder).
- Sign-up goes **browser → Supabase Auth directly**, not through Vercel. The header only exists on requests to Vercel, so neither Supabase Auth nor the hook sees it.
- The hook payload only carries `metadata.ip_address`; Supabase does not forward client headers to hooks.
- Native apps also talk to Supabase directly.

So the vendor lookup on `metadata.ip_address` is the server signal for **web and native alike**. Sending the header value from the app would make it app-supplied, which the ticket rules out. Using Vercel's header would need a Vercel function that signs the country (short-lived HMAC token passed in sign-up metadata, verified in the hook). That is a follow-up only if Duane wants a second country source; it is not needed for beta.

## 4. Soft filter and enforcement

Default: **allow every sign-up, store the signal, return a soft flag.**

| Case | `soft_flag` | `reasons` |
|---|---|---|
| PH, or US + California | `none` | – |
| US outside California | `review_suggested` | `outside_launch_region` |
| Outside PH/US | `review_suggested` | `outside_launch_country` |
| VPN / proxy / Tor | `review_suggested` | `vpn_or_proxy` |
| No country from vendor | `review_suggested` | `country_unknown` |
| Vendor error / timeout / quota / not configured | `unavailable` | `lookup_<status>` |

- No hard block of non-PH/US this week.
- `GEO_BLOCK_VPN_SIGNUPS=true` (off by default) rejects VPN/proxy/Tor sign-ups, **never** when the vendor says the IP is mobile (carrier NAT). Only if Duane chooses it.
- The app may show a gentle note for `review_suggested` ("we may ask for an ID check later"); the RPC hides the country and VPN details so the note doesn't teach evasion. OFWs and travelers go through the ID-review path (Persona, week 3), not a block.

## 5. Vendor failure: fail-open vs fail-closed

| | Fail-open (chosen for beta) | Fail-closed |
|---|---|---|
| Vendor down / slow / quota | sign-up goes through, row stored as `unavailable` | sign-up refused |
| Risk | spam gets in while the vendor is down; caught later by moderation / ID review | a vendor outage or a used-up free quota freezes all sign-ups |
| Fit for beta | yes: low volume, ID review comes later | no |

**Platform limit (proved locally):** our code fails open, but if the Edge Function itself is down or not deployed, Supabase Auth refuses the sign-up after 5 s (HTTP 422 "Failed to reach hook within maximum time"). That is Supabase's behavior, not ours. Kill switch: Dashboard → Authentication → Hooks → disable "Before User Created". Worst-case added latency we saw is ~2.6 s (vendor timeout 2.5 s).

## 6. Social sign-in (Google / Facebook / Apple)

Not installed at `fc903cc` (no `signInWithOAuth` / `signInWithIdToken` in `src/` or `app/`). When Belle adds it:

- The Before User Created hook runs before **every** new `auth.users` row, whatever the method. Supabase's doc example "Block by OAuth Provider" checks `app_metadata.provider`, so OAuth first sign-in goes through it. The doc does not list every method explicitly, so this must be confirmed on preview (see section 8).
- Locally proved: email sign-up and admin `createUser` both trigger the hook (`auth_provider = email`).
- The hook stores `app_metadata.provider` (`google`, `apple`, `facebook`) in `auth_provider`, so we can compare spam rates per method.
- The hook fires on **account creation only**. A returning OAuth user is not re-checked (same as email sign-in).
- IP: for browser OAuth the callback is the user's browser, so `metadata.ip_address` is the user. For native `signInWithIdToken` the app calls Supabase directly, same as email. No app-side work is needed beyond calling Supabase Auth.

## 7. Local proof

Stack: own local Supabase `geo48` (ports 567xx) from a scratch copy = main + PR #28 rebuild fixes + this branch; vendor replaced with a local stub (`GEO_IPQS_BASE_URL` / `GEO_IPINFO_BASE_URL`). Raw output in `proof/`.

| # | Check | Result |
|---|---|---|
| 1 | Soft mode, IPQS stub: PH, US-CA, US-TX, JP VPN, PH mobile proxy, quota, HTTP 500, 4.5 s timeout | all 8 users created; flags/reasons as in section 4; timeout case 2.6 s, `unavailable` |
| 2 | `GEO_BLOCK_VPN_SIGNUPS=true`: JP VPN | HTTP 403 with the message, no user, row `enforcement = blocked` |
| 2b | same, PH **mobile** proxy | allowed (carrier exemption) |
| 2c | hook returning HTTP 403 status instead of 200 + error body | Auth answered 500, so the code returns 200 + error body |
| 3 | `GEO_SIGNAL_PROVIDER=ipinfo_lite` | PH stored, VPN fields NULL, token sent as query param |
| 4 | Edge Function stopped | sign-up **fails** (422 after 5 s): platform fail-closed, see section 5 |
| 5 | Forged calls (no / wrong signature) | 401, nothing written |
| 6 | Admin `createUser` | hook fired, row stored |
| 7 | `07_signup_signal_proof.sql` | PASS: no anon/authenticated table access, RLS forced, EXECUTE grants, `search_path=""`, writer normalisation, orphan purge, own-row scoping |
| 8 | `04_safety_smoke_test.sql` (PR #28 copy) and `05_release_preflight_audit.sql` | PASS (main's own 04 fails on the known `open`/`pending` assertion that PR #28 fixes) |
| 9 | `npm run check:local-quality` | see PR |

## 8. Left to verify on preview / production (needs Duane)

1. Duane creates the vendor account and sets the secrets (names in the function README). Tell Kirk the real secret name if it differs from `GEO_IPQS_API_KEY`.
2. Duane confirms IPQS free-plan cap, VPN flags on free, and commercial-use terms in a browser.
3. Apply the migration, deploy `before-user-created`, enable the hook in the Dashboard with a generated `v1,whsec_...` secret.
4. One real sign-up from a PH IP and one through a VPN; check the `signup_signals` rows. Mind the built-in email limit (about 2/hour).
5. Confirm the real (non-local) Auth version also maps a 200 + error body to HTTP 403, if hard-block is ever turned on.
6. When social sign-in lands: one Google sign-up on preview to confirm the hook fires and `auth_provider = google`.
7. Schedule `purge_orphan_signup_signals()` (or run it weekly by hand) and agree a retention period.

## 9. Honest limits

- Residential proxies and new VPNs slip through. This is a filter, not proof of location.
- Mobile carrier IPs are shared; we never block them.
- OFWs and travelers will be flagged `review_suggested` until the ID-review path exists.
- Lawyer confirmation of the product framing (decision #15) is still open; this change does not depend on it but the public wording does.
- IPinfo Lite data needs an IPinfo attribution link if we switch to it.
