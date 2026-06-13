# PinayMate Waitlist Signup Edge Function

Public Edge Function front door for backend-backed waitlist capture.

## Purpose

- Keeps the service-role key server-side.
- Prevents PM_Web from calling `submit_waitlist_signup` directly from the browser.
- Adds origin allowlisting, honeypot handling, optional Turnstile validation, and database-backed per-client attempt throttling before the waitlist RPC runs.
- Returns the same minimal accepted response shape as the waitlist RPC so PM_Web can fall back to email on any non-OK response.

## Auth and config

`supabase/config.toml` sets:

```toml
[functions.waitlist-signup]
verify_jwt = false
```

This function is public by design, but it fails closed unless these Supabase secrets are configured:

```bash
npx supabase secrets set WAITLIST_ALLOWED_ORIGINS=https://pinaymate.com,https://www.pinaymate.com
npx supabase secrets set WAITLIST_RATE_LIMIT_SALT=<high-entropy-random-value>
```

Supabase provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions. Do not expose the service-role key in PM_Web or PM_App.

Browser callers should send only the public `apikey`, `Content-Type`, and `x-client-info` headers. The CORS preflight deliberately does not allow a browser `Authorization` header; service-role authorization is used only inside the Edge Function when it calls private Supabase RPCs.

POST requests must use `Content-Type: application/json`. Non-JSON requests return the generic fallback message instead of implementation-shaped parsing guidance.

POST requests must include an approved `x-client-info` marker:

- `pm-web-waitlist`
- `pm-app-waitlist`

The marker must match the submitted `source` field: `pm-web-waitlist` must send `source: "pm_web"`, and `pm-app-waitlist` must send `source: "pm_app"`.

The function also sends security response headers on preflight and JSON responses:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

Public operational failures use a generic fallback message so origin, provider, secret, and RPC failures do not expose implementation details to browser callers. User-correctable validation can still return specific guidance such as an invalid email address or missing challenge.

The request body is capped at 4096 UTF-8 bytes before JSON parsing. Waitlist submissions should contain only email, platform/source, honeypot fields, optional challenge token, and the backend contract marker.

Challenge tokens from the JSON body or Turnstile headers are capped at 2048 UTF-8 bytes before provider verification.

Optional challenge-provider controls:

```bash
npx supabase secrets set WAITLIST_TURNSTILE_SECRET_KEY=<turnstile-secret>
npx supabase secrets set WAITLIST_REQUIRE_TURNSTILE=true
```

Optional rate tuning:

```bash
npx supabase secrets set WAITLIST_MAX_ATTEMPTS_PER_HOUR=6
```

For non-browser operator smoke checks only:

```bash
npx supabase secrets set WAITLIST_ALLOW_NO_ORIGIN=true
```

Do not enable `WAITLIST_ALLOW_NO_ORIGIN` for public production capture unless the release owner explicitly accepts that risk.

## Deploy

```bash
npx supabase functions deploy waitlist-signup --no-verify-jwt
```

The corresponding database migration must be applied before deploy signoff:

```text
supabase/migrations/20260611140000_add_waitlist_edge_abuse_control.sql
```

## Request shape

```json
{
  "email": "user@example.com",
  "platform": "ios",
  "source": "pm_web",
  "website": "",
  "turnstileToken": "optional-token",
  "backendContract": "submit_waitlist_signup"
}
```

`website`, `company`, and `nickname` are honeypot fields. If a bot fills them, the function returns a generic accepted response without writing a waitlist row.
`backendContract` must be `submit_waitlist_signup` so the public web handoff and Edge Function stay on the same backend capture contract.

## Response shape

Successful public responses must contain exactly one generic accepted row:

```json
[
  {
    "email_normalized": "user@example.com",
    "platform": "ios",
    "status": "accepted"
  }
]
```

The returned `email_normalized` must match the submitted normalized email, `platform` must match the submitted normalized platform, and `status` must be `accepted`. The Edge Function fails closed with the generic fallback message if the private RPC returns zero rows, multiple rows, mismatched row values, or a non-accepted status.

## Launch boundary

This function does not create an app account, dating profile, match request, matching session, checkout, payment record, verified badge, or paid access. It captures only launch-interest email and platform preference after the release owner enables PM_Web backend capture flags.
