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
  "turnstileToken": "optional-token"
}
```

`website`, `company`, and `nickname` are honeypot fields. If a bot fills them, the function returns a generic accepted response without writing a waitlist row.

## Launch boundary

This function does not create an app account, dating profile, match request, matching session, checkout, payment record, verified badge, or paid access. It captures only launch-interest email and platform preference after the release owner enables PM_Web backend capture flags.