# Ticket #44: server-side rate limits (evidence)

Date: 2026-11-21
Owner: Kirk Gamo. Reviewer: Duane Vargas.
Scope: closed beta. Nothing here was run against production.

## 1. Supabase Auth limits (dashboard)

Source: https://supabase.com/docs/guides/auth/rate-limits (read 2026-11-21).

Live values from the dashboard (Authentication → Rate Limits, production project `prxykmkexfovbiatylue`, captured by Kirk 2026-11-21): [screenshot 1](auth-rate-limits-1.png), [screenshot 2](auth-rate-limits-2.png).

| Auth limit | Endpoints | Scope | Documented default | Live value | Status |
|---|---|---|---|---|---|
| Sign-ups and sign-ins | `/signup`, `/recover`, `/resend`, `/magiclink`, `/otp`, `/user` | per IP | 30 per 5 min | 30 per 5 min | default |
| Token refresh (`/token`) | `/token` | per IP | 150 per 5 min | 150 per 5 min | default |
| Token verifications (OTP / magic link) | `/verify` | per IP | 30 per 5 min | 30 per 5 min | default |
| Emails sent | all email endpoints | per project | 2 per hour (built-in email) | 2 per hour | default |
| SMS sent | all SMS endpoints | per project | 30 per hour | 30 per hour | default (SMS not used) |
| Anonymous sign-ins | `/signup` without email/phone | per IP | 30 per hour | 30 per hour | default |
| Web3 sign-ups and sign-ins | `/token` (web3) | per IP | 30 per 5 min | 30 per 5 min | default (not used) |
| Minimum interval per user (OTP, signup confirmation, recover) | `/otp`, `/signup`, `/recover` | per user | 60 s | 60 s (dashboard says it only applies with custom SMTP) | default |
| MFA challenge/verify | `/factors/*` | per IP | 15 per min (not adjustable) | not shown | n/a |

All live values match the documented defaults. Nothing is looser than the default.

A blocked Auth call returns HTTP 429 from Supabase Auth.

Recommendation: keep the defaults for beta. Do not tighten without Duane's OK.

- The built-in email limit (2 per hour per project) is the tightest limit we have. It already blocked the #26 retest. It caps new sign-ups that need email confirmation, but it also blocks real testers. Custom SMTP is the fix. That is Duane's call and is outside this ticket.
- `Sb-Forwarded-For` / IP forwarding: not needed today. The mobile app and the PM_App web build (a static export on Vercel) both call Supabase Auth straight from the user's device, so Auth sees each user's own IP. Forwarding only matters if we later add a server (SSR, API route, Edge Function) that calls Auth for users. All of those calls would then share the server's IP and hit 30 per 5 min together. If that happens: turn on IP Address Forwarding, send `Sb-Forwarded-For` with an `sb_secret_` key (anon and service_role keys are not supported), and never trust a client-supplied header.
- No extra database sign-up limit was added. A global "new users per hour" cap in a trigger on `auth.users` would let one attacker lock every real tester out of sign-up. The per-IP Auth limit plus the email limit is enough for a closed beta. CAPTCHA was not enabled (not requested this week).

## 2. Throttles that already existed

| Path | How it is limited | Where |
|---|---|---|
| OCR Edge Function (paid provider) | `claim_ocr_attempt`: per user, 5 per 60 min by default (`OCR_MAX_ATTEMPTS_PER_HOUR`), table `ocr_usage_events`, advisory lock | `20260610100323_add_ocr_rate_limit.sql`, `functions/ocr` |
| Waitlist Edge Function | `claim_waitlist_edge_attempt`: per HMAC client fingerprint/platform/source, 6 per hour, table `waitlist_edge_attempts` | `20260611140000_add_waitlist_edge_abuse_control.sql` |
| Waitlist RPC | `submit_waitlist_signup`: same email 10-min cooldown; 30 new rows per source/platform per minute burst cap; service role only | `20260611133000_...burst_control.sql` |
| User reports | `submit_user_report`: advisory lock + 10-min cooldown and open-report merge for the same reporter/target/source/conversation | `20260625091000_repair_release_audit_drift.sql` |
| Supabase Auth | section 1 | dashboard |

Gap in the report cooldown: it only stops repeats against the same member. One account could still file reports against many different members. Now covered by `report_submit` below.

## 3. Sensitive paths with no throttle before this PR

| Path | Risk | This PR |
|---|---|---|
| `send_message` (RPC) | message flood / spam to a match | limited (`message_send`) |
| new chats (`get_or_create_conversation`, private helper called by `send_message`) | conversation spam | limited (`conversation_create`) |
| `like_profile` (RPC) | like spam, notification spam | limited (`like`) |
| `pass_profile` (RPC) | bulk scraping through the deck | limited (`pass`) |
| `undo_last_swipe` (RPC) | like → undo → like loops | covered: undo deletes the like row but not the rate limit event, so the loop still uses the like/pass quota (proved in section 6) |
| `submit_user_report` (RPC) | reports against many members | limited (`report_submit`) |
| `submit_verification` (RPC) | fills the moderator review queue | limited (`verification_submit`) |
| Storage `profile-photos` upload (direct) | storage fill, cost | limited (`storage_upload:profile-photos`) |
| Storage `chat-images` upload (direct) | storage fill, cost | limited (`storage_upload:chat-images`) |
| Storage `verification-docs` upload (direct) | storage fill | limited (`storage_upload:verification-docs`) |
| `request_account_deletion` (RPC) | low: upsert, one row per user (`ON CONFLICT (user_id)`) | not limited (idempotent) |
| `block_user`, `unmatch_user` | low: own relationships only, idempotent | not limited |
| `save_basic_info`, `save_privacy_settings`, `save_notification_preferences`, direct `profiles` column updates | low: own row only, overwrite in place | not limited |
| `mark_messages_read`, `mark_conversation_read`, `update_message_status`, `delete_message_for_me`, `delete_message_for_everyone` | low: own conversations, no new rows | not limited |
| `clear_verification_submission` | low: clears own evidence | not limited |
| Realtime subscriptions, read RPCs (`get_user_conversations`, `discoverable_profiles` reads) | read volume | not limited here (Supabase platform limits apply) |

Side finding for Duane: the three Storage buckets have no `file_size_limit` or `allowed_mime_types` set (local rebuild: all NULL). Upload count is now limited, but a single upload can still be up to the project-wide maximum size. Not changed here because it could break current uploads (HEIC, document formats).

## 4. What this PR adds

Migration `supabase/migrations/20261121100000_add_server_side_rate_limits.sql`, the same table-backed pattern as OCR:

- `public.rate_limit_events`: one row per allowed action per user. Forced RLS, no grants to `anon` or `authenticated`. Pruned on write past the longest window (24 h).
- `public.rate_limit_rules`: the numbers. Forced RLS, no client grants. Tune with SQL (service role / SQL editor), no migration needed.
- `public.consume_rate_limit(action)`: advisory lock per user+action, count inside each window, raise, else insert. No-op when `auth.uid()` is NULL (service role, migrations, reviewer tools).
- BEFORE INSERT triggers on `messages`, `conversations`, `likes`, `passes`, `user_reports`. BEFORE UPDATE trigger on the profile verification evidence columns. These rows are only written by the SECURITY DEFINER RPCs, so the trigger is the RPC limit. I used triggers so I didn't have to copy the long RPC bodies that PR #28 also edits.
- RESTRICTIVE INSERT policy `Uploads are rate limited per member` on `storage.objects`. It counts the member's own objects created in the window. The restrictive pattern is the same as the existing `Pending verification docs cannot be deleted` policy.
- Helpers are SECURITY DEFINER with `search_path = ''`. Only `storage_upload_within_rate_limit(text)` is executable by `authenticated`, because the Storage policy needs it. It can only check the caller's own uploads.

The app cannot turn any of this off: it has no access to the tables or helpers (proved in section 6, check 5).

## 5. Beta defaults (Duane to confirm)

These are starting numbers for the closed beta, not production SLAs.

| Action | Limit per member | Second limit |
|---|---|---|
| `message_send` | 20 per minute | 200 per hour |
| `conversation_create` (new chats) | 10 per hour | 30 per day |
| `like` | 30 per minute | 300 per day |
| `pass` | 60 per minute | 1000 per day |
| `report_submit` (new reports) | 5 per hour | 20 per day |
| `verification_submit` | 5 per day | |
| `storage_upload:profile-photos` | 20 per hour | |
| `storage_upload:chat-images` | 10 per minute | 100 per day |
| `storage_upload:verification-docs` | 10 per hour | |

Change a number (SQL editor):

```sql
UPDATE public.rate_limit_rules
SET max_count = 40, updated_at = NOW()
WHERE action = 'message_send' AND window_seconds = 60;
```

Turn one rule off in an emergency: `SET enabled = FALSE` on that row.

## 6. What a blocked call looks like (for Belle)

RPCs (`supabase.rpc(...)`, i.e. send message, like, pass, report, submit verification):

- HTTP 429
- `error.code === "PT429"`
- `error.message === "Too many requests. Please wait and try again."`
- `error.details`: JSON string, e.g. `{"action" : "message_send", "limit" : 20, "window_seconds" : 60, "retry_after_seconds" : 60}`
- `error.hint`: `retry_after_seconds=60`

Storage uploads (`supabase.storage.from(bucket).upload(...)`):

- Storage API turns the custom SQLSTATE into a 500, so uploads raise SQLSTATE `42501` instead.
- The local probe got HTTP 400 with body `{"statusCode":"403","error":"Unauthorized","code":"AccessDenied","message":"Too many uploads. Please wait and try again. rate_limited retry_after_seconds=3600"}`.
- Detect it with `error.message.includes("rate_limited")`. A plain permission problem says `new row violates row-level security policy` instead.

Suggested friendly copy (Belle to finalise): "You're going a bit fast. Please wait a moment and try again." Don't retry automatically on PT429 or `rate_limited`.

## 7. Local proof

Stack: local `supabase start` (project `rl44`, ports 564xx). It ran origin/main plus the PR #28 rebuild fixes, the PR #29 migrations, and this migration. All migrations applied, and `supabase db reset` was clean.

`supabase/tests/06_rate_limit_proof.sql` runs in one transaction that rolls back. Inside it, the per-minute like/pass/message rules and the profile-photo rule are lowered to 3, and the report and verification rules to 1. A same-pair repeat report is merged by the existing cooldown and is not counted.

```
PASS static contract
PASS 3 pass + undo cycles allowed
PASS pass #4 within a minute (after undos) blocked: sqlstate=PT429 ... {"action" : "pass", "limit" : 3, ...}
PASS 3 like + undo cycles allowed
PASS like #4 within a minute (after undos) blocked: sqlstate=PT429 ... {"action" : "like", "limit" : 3, ...}
PASS message #4 within a minute blocked: sqlstate=PT429 ... {"action" : "message_send", "limit" : 3, ...}
PASS client cannot read, reset or disable rate limits (4/4 denied)
PASS profile photo upload #4 within an hour blocked: sqlstate=42501 message=Too many uploads. ... rate_limited ...
PASS new report on a second member within an hour blocked: sqlstate=PT429 ... {"action" : "report_submit", "limit" : 1, ...}
PASS second verification submission within a day blocked: sqlstate=PT429 ... {"action" : "verification_submit", "limit" : 1, ...}
PASS 10 server-side message inserts without auth.uid() were not limited
PASS: rate limit proof completed; transaction will roll back
```

The other member's reply went through while the sender was blocked, so limits are per member.

HTTP probe against the local REST and Storage APIs, real signed-in users, default beta numbers:

```
send_message statuses: 200 x20, then 429
send_message #21: 429 {"code":"PT429","details":"{\"action\" : \"message_send\", \"limit\" : 20, \"window_seconds\" : 60, \"retry_after_seconds\" : 60}","hint":"retry_after_seconds=60","message":"Too many requests. Please wait and try again."}
storage upload statuses: 200 x20, then 400
storage upload #21: 400 {"statusCode":"403","error":"Unauthorized","message":"Too many uploads. Please wait and try again. rate_limited retry_after_seconds=3600","code":"AccessDenied"}
```

Existing suites on the same rebuilt DB: `04_safety_smoke_test.sql` PASS, `05_release_preflight_audit.sql` PASS.

## 8. Rollout notes for Duane

- Apply after PR #28 and PR #29 (timestamp `20261121100000` sorts after both).
- After apply, run `06_rate_limit_proof.sql` on local or staging only. It creates throwaway auth users inside a rolled-back transaction, so never run it on production.
- Existing rows are not counted. Limits start from zero when the migration is applied.
- Not in this PR: Redis/Upstash (not needed), CAPTCHA, custom SMTP, bucket size limits, and client UI for the errors (Belle).
