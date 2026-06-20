# Supabase Live Proof Commands

Status: operator checklist for staging and production proof capture.

Use this with `docs/evidence/TEMPLATE-supabase-live-proof.md`. Save a dated copy of the template for each environment before marking Supabase rows as pass in the launch packet.

Do not paste secrets, access tokens, raw user data, raw ID documents, private messages, or provider keys into evidence files.

## 1. Confirm linked project and migration state

Run from `PM_App` after selecting the intended Supabase project:

```bash
npx supabase status
npx supabase migration list
```

Capture:

- target project reference redacted to the last 4 characters only
- whether all files from `supabase/LAUNCH_MIGRATION_MANIFEST.md` are applied
- whether `20260611123000_add_notification_preferences.sql` is applied
- whether legacy `99_` and `999_` migrations are present and safe in the target history

## 2. Run preflight/advisor checks

Run the repo SQL audit in the target SQL context:

```text
supabase/tests/05_release_preflight_audit.sql
```

Capture:

- missing RPCs, tables, RLS policies, grants, or constraints
- advisor/lint output if available from the Supabase dashboard or CLI
- any explicit risk acceptance if an advisory is not fixed before launch

## 3. Run safety smoke SQL

Run:

```text
supabase/tests/04_safety_smoke_test.sql
```

Capture pass/fail for:

- report RPC behavior
- block persistence
- unmatch behavior
- storage bucket and policy presence
- OCR quota controls
- privacy settings RPC controls
- notification preference RPC controls
- push-disabled child flag clearing
- hidden-profile discovery filtering
- read-receipt privacy behavior
- account deletion request controls
- direct match-forging rejection
- direct message-update rejection
- direct `get_or_create_conversation` execution rejection
- empty-conversation inbox hiding
- unmatched-chat rejection
- blocked-chat enforcement

## 4. Prove OCR Edge Function behavior

Deploy and inspect the OCR function in the intended environment:

```bash
npx supabase functions deploy ocr
npx supabase secrets list
```

Capture:

- function deployment success
- `OCR_SPACE_API_KEY` presence only, never the value
- unauthenticated request rejection
- authenticated valid document behavior
- invalid or oversized document behavior
- OCR rate-limit behavior
- confirmation that sensitive payloads are not logged

## 4b. Prove waitlist Edge Function behavior

Deploy and inspect the public waitlist function in the intended environment:

```bash
npx supabase functions deploy waitlist-signup --no-verify-jwt
npx supabase secrets list
```

Capture:

- function deployment success
- `WAITLIST_ALLOWED_ORIGINS` presence and approved values summarized without leaking unrelated secrets
- `WAITLIST_RATE_LIMIT_SALT` presence only, never the value
- `SUPABASE_SERVICE_ROLE_KEY` presence only inside Supabase runtime, never the value
- optional `WAITLIST_TURNSTILE_SECRET_KEY` presence only if challenge-provider proof is required
- direct anon/authenticated execution of `submit_waitlist_signup` denied
- direct `service_role` grants cannot select, insert, update, or delete `waitlist_signups`; service-role write access should route through the RPC
- valid approved-origin request returns the generic accepted shape
- repeated same-client request is throttled by `claim_waitlist_edge_attempt`
- honeypot-filled request does not create a waitlist row

Set non-secret request variables:

```powershell
$env:PROJECT_REF = "<target-project-ref>"
$env:WAITLIST_FUNCTION_URL = "https://$env:PROJECT_REF.functions.supabase.co/waitlist-signup"
$env:WAITLIST_ORIGIN = "https://<approved-pm-web-origin>"
$env:WAITLIST_EMAIL = "release-proof+waitlist@example.com"
$env:WAITLIST_PLATFORM = "ios"
```

Valid approved-origin request:

```powershell
curl.exe -i -X POST $env:WAITLIST_FUNCTION_URL `
  -H "Origin: $env:WAITLIST_ORIGIN" `
  -H "Content-Type: application/json" `
  --data "{`"email`":`"$env:WAITLIST_EMAIL`",`"platform`":`"$env:WAITLIST_PLATFORM`",`"source`":`"pm_web`",`"website`":`"`"}"
```

Expected: HTTP `200` and generic accepted JSON with `status` equal to `accepted`. Record only the status code and redacted response shape.

Malformed email request:

```powershell
curl.exe -i -X POST $env:WAITLIST_FUNCTION_URL `
  -H "Origin: $env:WAITLIST_ORIGIN" `
  -H "Content-Type: application/json" `
  --data "{`"email`":`"not-an-email`",`"platform`":`"ios`",`"source`":`"pm_web`",`"website`":`"`"}"
```

Expected: HTTP `400` with a client-safe validation message.

Honeypot request:

```powershell
curl.exe -i -X POST $env:WAITLIST_FUNCTION_URL `
  -H "Origin: $env:WAITLIST_ORIGIN" `
  -H "Content-Type: application/json" `
  --data "{`"email`":`"$env:WAITLIST_EMAIL`",`"platform`":`"ios`",`"source`":`"pm_web`",`"website`":`"bot-filled`"}"
```

Expected: generic accepted response. Confirm by SQL/admin inspection that no new waitlist row was created for the honeypot submission.

Repeated-request throttle:

- In staging, temporarily set `WAITLIST_MAX_ATTEMPTS_PER_HOUR=1` or send enough repeated requests to exceed the production limit.
- Repeat the valid approved-origin request from the same network/user-agent bucket.
- Expected: HTTP `429` or client-safe throttled response with `Retry-After`.
- Restore the intended rate-limit value after staging proof if it was changed for the test.

Direct RPC denial:

Use SQL preflight/smoke proof or a redacted REST call to confirm `anon` and `authenticated` cannot execute `/rest/v1/rpc/submit_waitlist_signup` directly after `20260611140000_add_waitlist_edge_abuse_control.sql` is applied. Confirm direct `service_role` table grants on `waitlist_signups` are denied so the Edge Function uses the service-role key only for RPC execution.

## 5. Prove notification boundary

Use the app or SQL/RPC calls to prove:

- `get_notification_preferences` reads launch-stage preferences
- `save_notification_preferences` persists preferences through RPC only
- direct table writes remain denied
- push-disabled child flags are cleared server-side
- provider delivery is either separately proven or remains blocked in launch copy

## 6. Attach evidence

Fill a dated copy of:

```text
docs/evidence/TEMPLATE-supabase-live-proof.md
```

Then update:

- `docs\release\LAUNCH_EVIDENCE_PACKET.md`
- `docs\release\LAUNCH_SIGNOFF_CHECKLIST.md`
- `docs\release\PINAYMATE_LAUNCH_STATE_MATRIX.md`

Only move Supabase rows from blocked/source-only to pass after the dated evidence file contains reviewed results.
