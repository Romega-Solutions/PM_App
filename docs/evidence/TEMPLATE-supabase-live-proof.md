# Supabase live proof template

Date:
Owner:
Environment: staging / production
Supabase project ref: redacted

## Scope

Use this template when proving that the backend-backed PinayMate platform is actually ready in a target Supabase environment.

Do not paste secrets, access tokens, raw user data, raw ID documents, private messages, or provider keys into this file.

## Migration state

| Check | Result | Evidence note |
| --- | --- | --- |
| Full launch migration manifest applied in order |  |  |
| Legacy `99_` / `999_` tail migrations remain safe after timestamped migrations |  |  |
| `20260611123000_add_notification_preferences.sql` applied |  |  |
| `20260611140000_add_waitlist_edge_abuse_control.sql` applied |  |  |
| Migration history matches target environment |  |  |

## RLS, grants, and policy proof

| Check | Result | Evidence note |
| --- | --- | --- |
| Direct message insert denied to authenticated clients |  |  |
| Message creation allowed only through `send_message` RPC |  |  |
| Direct `get_or_create_conversation` execution denied to anon/authenticated/service-role clients |  |  |
| Empty conversations hidden from `get_user_conversations` |  |  |
| Direct report table writes denied to authenticated clients |  |  |
| Report creation allowed only through `submit_user_report` RPC |  |  |
| Direct notification preference table writes denied to authenticated clients |  |  |
| Direct waitlist table writes denied to anon/authenticated clients |  |  |
| Direct `submit_waitlist_signup` execution denied to anon/authenticated clients |  |  |
| Direct `service_role` table grants denied on `waitlist_signups` |  |  |
| `claim_waitlist_edge_attempt` executable only by service role |  |  |
| Notification preferences allowed only through RPCs |  |  |
| Hidden profiles do not appear in discovery |  |  |
| Blocked users do not appear in discovery or chat flows |  |  |

## Safety smoke SQL

| Smoke area | Result | Evidence note |
| --- | --- | --- |
| report RPC behavior |  |  |
| block persistence |  |  |
| unmatch behavior |  |  |
| storage bucket/policy presence |  |  |
| OCR quota controls |  |  |
| privacy settings RPC controls |  |  |
| notification preference RPC controls |  |  |
| push-disabled child flag clearing |  |  |
| hidden-profile discovery filtering |  |  |
| read-receipt privacy behavior |  |  |
| account deletion request controls |  |  |
| direct match-forging rejection |  |  |
| direct message-update rejection |  |  |
| unmatched-chat rejection |  |  |
| blocked-chat enforcement |  |  |

## OCR Edge Function proof

| Check | Result | Evidence note |
| --- | --- | --- |
| OCR function deployed to target project |  |  |
| JWT verification enabled |  |  |
| `OCR_SPACE_API_KEY` present as Supabase secret |  |  |
| unauthenticated request rejected |  |  |
| authenticated valid document request handled |  |  |
| invalid/oversized document request handled safely |  |  |
| rate limit blocks excess attempts |  |  |
| no sensitive payload logged |  |  |

## Waitlist Edge Function proof

| Check | Result | Evidence note |
| --- | --- | --- |
| `waitlist-signup` function deployed to target project |  |  |
| `WAITLIST_ALLOWED_ORIGINS` present and approved |  |  |
| `WAITLIST_RATE_LIMIT_SALT` present, value not recorded |  |  |
| service-role key present only server-side, value not recorded |  |  |
| Turnstile/challenge decision recorded |  |  |
| valid approved-origin request returns generic accepted shape |  |  |
| malformed email fails safely |  |  |
| repeated same-client request is throttled |  |  |
| honeypot-filled request does not create a waitlist row |  |  |
| PM_Web backend flags remain disabled until this proof is accepted |  |  |

## Notification delivery boundary

| Check | Result | Evidence note |
| --- | --- | --- |
| notification preference RPC persists launch-stage preferences |  |  |
| push-disabled child flags are cleared server-side |  |  |
| provider delivery remains blocked or separately proven |  |  |
| UI copy does not imply provider delivery before proof |  |  |

## Final operator note

Decision: pass / fail / blocked / deferred with risk acceptance

Residual risks:

-

Follow-up owner:

Next review date:
