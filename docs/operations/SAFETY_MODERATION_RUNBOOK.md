# PinayMate Safety and Moderation Runbook

Last updated: 2026-06-11

Purpose: define how PinayMate handles user reports, verification review, block/unmatch escalation, and launch support before the app is publicly promoted.

Status: required for launch operations. This runbook must be reviewed by the product owner and support owner before production launch.

Launch-state boundary: safety, support, legal, verification, notification, and moderation responses must match `docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md`. Before operational proof exists, do not imply instant moderation, guaranteed safety, automatic verification approval, live provider notification delivery, or monitored mailbox readiness.

## Required operating roster

Fill this before any public launch claim. Blank owner, backup, SLA, or evidence fields are launch blockers.

| Function | Primary owner | Backup owner | First response target | Evidence location | Status |
| -------- | ------------- | ------------ | --------------------- | ----------------- | ------ |
| User report review | | | Same business day | | Pending |
| Verification review | | | 1 to 2 business days | | Pending |
| Account deletion requests | | | 1 business day acknowledgement | | Pending |
| Critical safety escalation | | | Immediate | | Pending |
| Support inbox | | | 1 business day | | Pending |
| Legal/privacy inbox | | | 1 business day acknowledgement | | Pending |
| Backend abuse investigation | | | Same day if active | | Pending |
| Incident communications | | | Same day if active | | Pending |

Owner acceptance criteria:

- the owner can access the queue or inbox without a personal-only dependency
- the backup confirms access before launch
- the owner accepts the target response time
- evidence-handling rules are accepted
- escalation path is reachable during launch window

## Operating principles

- Protect users first, then optimize growth.
- Do not promise that verification guarantees safety.
- Do not promise instant moderation, emergency response, guaranteed identity, or guaranteed safe matches.
- Do not describe source-only backend controls as live operations until Supabase and queue evidence is captured.
- Do not expose reporter identity to the reported member.
- Do not copy raw private user content into public docs, tickets, chat, or release notes.
- Do not paste secrets, access tokens, IDs, documents, or private images into chat.
- Preserve enough evidence for review while minimizing unnecessary sensitive data.
- Treat reports involving minors, threats, extortion, trafficking, self-harm, or identity fraud as urgent escalation items.

## Moderation queues

| Queue                     | Source                                                             | Owner                 | Target first response          |
| ------------------------- | ------------------------------------------------------------------ | --------------------- | ------------------------------ |
| User reports              | `user_reports` table through `submit_user_report` and service-role `review_user_report` RPCs | Safety/support owner  | Same business day              |
| Block spikes              | Repeated `user_blocks` rows against one member                     | Safety/support owner  | Same business day              |
| Verification review       | `profiles.verification_status = pending` plus service-role `review_profile_verification` | Verification reviewer | 1 to 2 business days           |
| Account deletion requests | `account_deletion_requests` through `request_account_deletion` RPC | Support/privacy owner | 1 business day acknowledgement |
| Support inbox             | `support@pinaymate.com`                                            | Support owner         | 1 business day                 |
| Technical abuse           | suspicious auth/storage/API patterns                               | Backend owner         | Same day if active             |

## Launch-day triage order

If several queues need attention at the same time, process them in this order:

1. Critical safety escalation involving minors, threats, extortion, trafficking, self-harm, or credible physical harm.
2. Active account-takeover, storage, private-document, or message-access incident.
3. User reports that request blocking, unmatching, or urgent contact restriction.
4. Pending verification reviews that block onboarding completion.
5. Account deletion requests and privacy inquiries.
6. General support and product questions.

Do not delay a critical safety escalation while waiting for normal verification or support queue review.

## Severity levels

| Severity | Examples                                                                                     | Response target      | Required action                                                  |
| -------- | -------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------- |
| Critical | threat of violence, self-harm, trafficking, extortion, suspected minor safety issue          | Immediate            | restrict account if needed, preserve evidence, escalate to owner |
| High     | harassment, impersonation, document fraud, repeated unwanted contact, scam indicators        | Same business day    | review account, block/match state, messages, reports             |
| Medium   | rude behavior, mismatch complaint, suspicious profile quality, unclear verification mismatch | 1 to 2 business days | review context and decide warn, restrict, or dismiss             |
| Low      | product confusion, waitlist question, billing question before billing exists                 | 1 business day       | support response and product note if repeated                    |

## Report review workflow

1. Confirm the report came through the hardened path.

Required evidence:

- `user_reports.reporter_id` is present.
- `user_reports.reported_user_id` is present.
- If `conversation_id` is present, the reporter and reported member must be the two participants.
- The report has a reason and timestamp.

2. Check safety context.

Review:

- Has either member blocked the other?
- Are they still matched?
- Is the reported member repeatedly reported by different users?
- Does the conversation show policy-risk behavior?
- Is there a verification mismatch or suspicious profile pattern?

3. Decide action.

Allowed outcomes:

- no action, report dismissed with internal note
- warning or support education
- unmatch members
- block contact path
- temporarily restrict reported profile from discovery
- require re-verification
- escalate to product/support owner
- suspend or remove account if policy warrants it

4. Record decision.

Backend decision path:

- Report review decisions should go through `review_user_report` from approved backend/support tooling.
- Report reviewers must be active entries in `moderation_reviewers`; do not pass arbitrary UUIDs from ad hoc tools.
- Reviewer registry changes must go through `upsert_moderation_reviewer` or `deactivate_moderation_reviewer` from approved service-role tooling.
- Reviewer registry changes must create `moderation_reviewer_audit_log` entries with operator/reason before a reviewer roster can be treated as launch-ready.
- Finalized report decisions should not be overwritten silently. If a final decision needs correction, record the escalation and use an approved backend repair path.
- App clients must not execute `review_user_report`.
- Direct production table edits should be reserved for emergency owner-approved repair and must be documented in evidence.

Minimum note:

```text
Report ID:
Reviewer:
Severity:
Decision:
Evidence reviewed:
User-facing response sent: yes/no
Follow-up date:
```

## Verification review workflow

Verification is a review state, not automatic trust.

Pending review means:

- the user uploaded selfie/document evidence to the private `verification-docs` bucket
- OCR may have extracted name/date fields
- the app submitted durable storage paths through `submit_verification`
- the user is not approved until reviewer action sets approval state
- approval/rejection must go through the service-role `review_profile_verification` workflow, not a direct app-client profile update

Reviewer checks:

- selfie/document files are present and viewable in the intended secure location
- document appears valid enough for product policy
- extracted first name, last name, and age are reasonable
- mismatch reasons are reviewed, not blindly trusted
- profile age and identity fields are not obviously inconsistent

Allowed decisions:

- approve verification through `review_profile_verification` after confirming submitted evidence exists
- reject verification through `review_profile_verification` with reason
- request clearer image
- request profile correction
- flag for safety review

Do not approve when:

- image is unreadable
- document looks edited or unrelated
- user appears under allowed age
- profile identity conflicts materially with document data
- the account is already under critical/high safety review

## Block and unmatch handling

Blocking must do three things:

- create or keep the `user_blocks` relationship
- clear mutual match state through `unmatch_user`
- prevent future discovery, conversation reads, message sends, and chat media access between the pair

When a user asks support to block someone:

1. Confirm the requester identity.
2. Ask only for the minimum context needed.
3. Use the product flow when possible.
4. If support must intervene, record who performed the action and why.

The in-app report flow should recommend blocking the reported member in the same action. If report submission succeeds but blocking fails, support should still review the report and the user should be told that blocking can be retried from chat or profile controls.

When a user asks to undo a swipe:

- Use the app flow backed by `undo_last_swipe`.
- Do not manually delete likes/passes unless debugging a failed migration in a non-production environment.

## Account deletion request workflow

Account deletion is backend-backed and support-reviewed. The user-facing request creates a durable `pending` row through `request_account_deletion`; it does not instantly erase the account or bypass safety/legal review.

Required queue evidence:

- `account_deletion_requests.user_id` is present.
- `account_deletion_requests.status` starts as `pending`.
- The request came through the RPC path, not a direct client table write.
- The requester is the authenticated account owner.
- The request has a creation timestamp and enough metadata for support review.

Support workflow:

1. Acknowledge the request within 1 business day.
2. Confirm the account identity using the existing authenticated request and only ask for extra verification if the account is disputed or high-risk.
3. Check whether the account is tied to open critical/high safety reports, fraud indicators, chargeback/billing issues, law-enforcement preservation requests, or unresolved support escalations.
4. If no retention exception applies, mark the request ready for deletion processing and route it to the privacy/support owner.
5. If a retention exception applies, mark the internal reason, limit access to the minimum required reviewers, and send the user a plain-language status update without exposing private investigation details.
6. Record the final disposition and date.

Allowed outcomes:

- proceed with deletion processing
- hold for identity confirmation
- hold for active safety/fraud/legal review
- reject duplicate request because an active request already exists
- close as user-cancelled if the user withdraws the request before processing

Minimum decision note:

```text
Deletion request ID:
Requester user ID:
Reviewer:
Decision:
Retention exception: yes/no
Evidence reviewed:
User-facing response sent: yes/no
Follow-up date:
```

Do not:

- ask users to email private documents unless absolutely required
- paste raw IDs, documents, private photos, or chat text into public tools
- promise same-day deletion before retention checks are complete
- delete data manually in production without an owner-approved runbook step and audit note

## Message and media safety

Sensitive message state is server-owned.

Expected backend contract:

- read receipts go through `mark_messages_read`, `mark_conversation_read`, or `mark_pair_messages_read`
- delete-for-me goes through `delete_message_for_me`
- delete-for-everyone goes through `delete_message_for_everyone`
- clients do not receive broad direct `UPDATE` access on `messages`
- chat image access is limited to matched, unblocked participants

Reviewer checks before launch:

- direct message update is rejected in SQL smoke test
- unmatched users cannot create conversations
- blocked users cannot send messages
- blocked users cannot access chat images

## Support response rules

Use plain language. Do not overpromise.

Safe phrases:

- "We received your report and will review it."
- "We may restrict contact while this is reviewed."
- "This is not an emergency channel. If someone is in immediate danger, contact local emergency services."
- "Some PinayMate features are still launch-stage and may depend on review, safety, or release approval."
- "Verification helps with trust signals, but it does not guarantee someone is safe."
- "Please do not share money, passwords, codes, or private documents with someone you just met."

Avoid:

- "This user is definitely safe."
- "This user is definitely guilty."
- "Your report will remove them."
- "Our AI verified this person."
- "We guarantee real identities."

## Launch support setup

Before public launch, confirm:

| Item                            | Required evidence                                                      | Status  |
| ------------------------------- | ---------------------------------------------------------------------- | ------- |
| Support inbox owner             | named owner and backup                                                 | Pending |
| Report reviewer                 | named owner and backup                                                 | Pending |
| Verification reviewer           | named owner and backup                                                 | Pending |
| Critical escalation owner       | named owner and phone/chat path                                        | Pending |
| Abuse response SLA              | written SLA accepted by owner                                          | Pending |
| Account deletion owner          | named support/privacy owner and backup                                 | Pending |
| Account deletion retention rule | written rule for safety/fraud/legal holds                              | Pending |
| Data handling rule              | support team agrees not to paste private docs/images into public tools | Pending |

## Safety operations release gate

This table is launch blocking until all roles, backups, SLAs, escalation paths, and evidence-handling rules are filled with concrete names and procedures.

| Function | Primary owner | Backup owner | SLA / first response | Escalation path | Evidence handling rules |
| -------- | ------------- | ------------ | -------------------- | --------------- | ---------------------- |
| Safety owner | Romega | Romega Backup | Same business day | support@romegasolutions.com | Redact PII |
| Support owner | Romega | Romega Backup | 1 business day | support@romegasolutions.com | Redact PII |
| Legal owner | Romega | Romega Backup | 1 business day | legal@romegasolutions.com | Redact PII |
| Release owner | Romega | Romega Backup | 1 business day | release@romegasolutions.com | Redact PII |

## Owner signoff note template

Use one note per owner or function. Store redacted notes under `docs/evidence/`.

```text
Function:
Primary owner:
Backup owner:
Queue or account access confirmed: yes/no
SLA accepted: yes/no
Escalation path:
Evidence-handling rules accepted: yes/no
Deferred risk, if any:
Date:
```

## Evidence handling

Allowed in release notes:

- command output summaries
- pass/fail status
- redacted IDs
- screenshots with private user data hidden
- counts of reviewed items

Not allowed in release notes:

- raw user documents
- private chat text
- access tokens
- API keys
- full emails, phone numbers, or addresses
- unredacted database rows for real users

## Pre-launch safety sign-off

Required before launch-ready claim:

| Gate                                | Evidence                             | Owner | Date | Decision |
| ----------------------------------- | ------------------------------------ | ----- | ---- | -------- |
| Report RPC live test                | SQL smoke output                     |       |      |          |
| Block/unmatch live test             | SQL smoke output and app flow proof  |       |      |          |
| Message update rejection            | SQL smoke output                     |       |      |          |
| Unmatched chat rejection            | SQL smoke output                     |       |      |          |
| OCR unauthenticated rejection       | live function curl output            |       |      |          |
| OCR valid/invalid document behavior | live function curl output and app QA |       |      |          |
| Account deletion RPC live test      | SQL smoke output and app flow proof  |       |      |          |
| Account deletion owner assigned     | owner note                           |       |      |          |
| Verification review owner assigned  | owner note                           |       |      |          |
| Support escalation owner assigned   | owner note                           |       |      |          |

## Verification reviewer authorization

Profile verification approval and rejection must be performed only by service-role operations using reviewer IDs that are active in the `moderation_reviewers` registry. Do not use ad hoc UUIDs in production review notes or scripts.

Pending verification evidence is part of the review record. Users may replace or resubmit through approved product flows, but direct deletion of `verification-docs` objects that are referenced by a pending review must remain blocked until the review is resolved or reset by an approved support workflow.