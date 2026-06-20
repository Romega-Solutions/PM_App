# PinayMate Launch-State Matrix

Status: source-of-truth for launch-stage claims as of 2026-06-11.

Use this matrix when editing PM_Web, PM_App, Supabase release docs, support copy, legal copy, and launch evidence. It defines what the product may say today, what it must not imply yet, and what proof is required before stronger public claims are allowed.

This is not launch proof by itself. It is the shared contract that local checks, release notes, and manager-facing evidence must stay aligned to.

## Single launch-state source of truth

- PM_Web is a launch-interest and support surface, not a live dating-account surface.
- PM_App is a launch-stage app experience with gated functionality, not a fully public matching network until native, backend, safety, and operational evidence are current.
- Supabase migrations and RPCs may exist in source, but live backend readiness requires applied migration evidence, smoke SQL, and target-environment proof.
- Supabase launch proof requires applied migrations, smoke SQL, release preflight SQL, storage policy checks, and target-environment evidence.
- Safety, verification, moderation, and notification language must describe controls and review paths, not guarantees.
- Any older `Pass` evidence is historical if PM_Web, PM_App, scripts, migrations, or docs changed after that run.

## Evidence classes for go/no-go

Use this exact contract when marking a lane for launch review:

- **Source-complete**: code or docs exist in repo and are reviewed.
- **Runtime-verified**: proof from target environment (staging/production) with date and owner in evidence packet.
- **Launch-ready**: all source-complete and runtime-verified gates for a lane are green, with owner signoff.

Interpretation:

- Source-complete alone does not allow user-facing or manager-facing launch claims.
- Runtime proof is required whenever behavior depends on Supabase, native devices, app stores, DNS, mail delivery, OCR provider behavior, notifications, or support operations.
- Any stale or historical evidence entry is treated as blocked until rerun on current HEAD.

### Operator gates tied to June hardening wave

| Lane | Source-complete status | Runtime gate still required | Product impact if not yet live-verified |
| ---- | ---------------------- | -------------------------- | -------------------------------------- |
| Waitlist edge capture | ✅ | Staging/prod function deploy, origin allowlist + challenge behavior, repeated-request and direct-RPC denial proof | keep web in waitlist fallback mode if any proof is missing |
| Conversation helper boundary | ✅ | `04_safety_smoke_test.sql` assertion for direct `get_or_create_conversation` rejection | avoid implying empty chats cannot be created, since live proof is absent |
| Empty-inbox filtering | ✅ | `04_safety_smoke_test.sql` assertion for `last_message_id IS NULL` filtering | keep messaging trust claims guarded until runtime proof is recorded |
| Chat creation UX | ✅ | Native QA trace for first-send conversation creation and image-path gating | avoid claiming message continuity/reachability improvements until QA proves flow |

## Customer-facing launch state

| Area | Current allowed claim | Do not imply yet | Required proof before stronger claim |
| --- | --- | --- | --- |
| PM_Web hero and CTA | Waitlist only. Users can express launch interest or contact support. | No profile is created from PM_Web. Matching is not promised today. No payment is collected. | Current PM_Web local checks, desktop/mobile smoke, production domain smoke, support/legal mailbox proof. |
| App store links | Store links are locked until release sign-off. | The app is available now on App Store or Google Play. | Final store listing URLs, owner proof, app-store review status, and production smoke evidence. |
| Membership and pricing | Plans are planned pricing and interest signals only. | Payments are planned interest only; no checkout, subscription, card collection, paid ranking, paid boost, paid verification, or paid feature access starts today. | Payment processor ownership, legal terms, checkout QA, refund/support path, webhook proof, entitlement backend proof, and release approval. |

No checkout, subscription, card collection, paid ranking, paid verification, or paid feature access starts today.
| Account creation | Email signup can prepare launch access when the app flow is available. | Web waitlist email creates an app account or dating profile. | Native auth QA, email redirect QA, session persistence QA, and backend profile creation evidence. |
| Profile visibility | Profiles can become visible only after launch-stage gates, review state, and privacy settings allow it. | Completing setup guarantees public visibility, immediate discovery placement, or badge approval. | Native profile QA, privacy-settings backend proof, discovery view proof, and owner signoff. |
| Matching and discovery | Discovery can show launch-stage suggestions or empty states. | Matching is guaranteed, available today, or based on a live supply of reviewed profiles. | Applied Supabase migrations, discovery privacy smoke SQL, native discovery QA, and two-account matching QA. |
| Likes and chat | Messaging appears only when backend match/conversation rules allow it, and a visible conversation is created only by a real `send_message` action. | Likes guarantee a chat, empty conversations are created before a message, unmatched users can continue chat, or blocked users remain reachable. | Secure message RPC proof, direct conversation-helper execution rejection, match-gated conversation proof, block/unmatch QA, and native messaging QA. |
| SMS phone verification | SMS phone verification is off for launch. | A phone badge is created, SMS is sent, or phone verification improves access today. | Provider ownership, SMS send/receive QA, privacy/legal review, and native phone flow QA. |
| Voice and video calls | Voice and video calls are off for launch. | Starting a call, requesting mic/camera permission, or real-time call availability. | Call provider selection, safety review, permission UX QA, and release signoff. |
| Verification badges | Verification is a review path or trust cue, not an automatic guarantee. | Uploading documents automatically verifies identity, guarantees safety, or publishes a verified badge. | Private storage proof, OCR function proof, service-role review RPC proof, evidence-handling rules, and native verification QA. |
| Reports and safety | Report submission is a review path and report decisions must be made by named, active reviewers before blocking/escalation actions. Reviewer roster changes must go through approved management actions, remain auditable with operator/reason, and finalized report decisions should not be silently overwritten. | Reports are not emergency service and do not promise instant moderation action. | Safety owner roster, active reviewer registry proof, reviewer management RPC proof, reviewer audit proof with operator/reason, finalized-decision overwrite rejection, SLA proof, report queue QA, escalation path, and support handoff proof. |
| Notifications | Notification preferences are backend-backed source controls. | Notification provider delivery, push/email routing, or receipt delivery is proven. | Provider configuration, test recipient proof, failure handling, and native notification QA. |
| Supabase backend | Source migrations, RPCs, and static contracts define intended backend controls. | Source files alone prove staging or production backend readiness. | Applied ordered migrations, smoke SQL, release preflight SQL, storage policy checks, and advisor output. |
| OCR verification | OCR proxy source exists and should keep provider keys server-side. | Live OCR extraction, quota handling, or provider secret configuration is proven. | Deployed Edge Function, secret presence, authenticated/unauthenticated checks, valid/invalid document checks, and rate-limit evidence. |
| Support and legal email | Support/legal mailto links may be used for launch questions with sensitive-data warnings. | Mailboxes are monitored, delivered, owned, or production-ready without proof. | Mailbox ownership proof, delivery test, escalation owner, and legal/support signoff. |

## Feature availability and proof map

Use this table to connect product surfaces to implementation evidence. A feature can be source-complete while still not launch-ready.

| Feature area | User-facing state today | Source/backend artifact | Proof required before launch-ready |
| --- | --- | --- | --- |
| Waitlist website | Available as launch-interest only | PM_Web sections, `PM_Web/src/components/waitlist/WaitlistCaptureForm.tsx`, `PM_Web/src/lib/launchEmailLinks.ts`, PM_Web CTA/link/claim scripts, `waitlist_signups` migration, `submit_waitlist_signup` RPC | Current PM_Web local checks, desktop/mobile browser smoke, production URL proof, mailbox delivery proof, applied waitlist migration proof, source/platform bucket-lock proof, public source restriction proof, and generic duplicate/blocked response proof before backend capture is public. |
| Email signup | Active path for launch preparation | PM_App auth screens, Supabase Auth config, auth redirect contract | Native auth QA, email verification redirect proof, password reset proof, session restore/signout proof. |
| Basic profile setup | Setup can collect profile details for launch preparation | Account setup screens and backend profile/basic-info RPCs | Native onboarding QA, Supabase RPC existence/permission proof, safe error proof. |
| Profile photos | Profile-photo upload path exists in app source | Profile photo screens, storage bucket migration, profile photo API | Native media permission QA, storage bucket/policy proof, upload/display proof, privacy copy review. |
| Location | Manual/current-location setup is available when permissions allow it | Location setup screen and location hook | Native allow/deny QA, coordinate persistence proof, manual fallback proof. |
| Preferences | Preferences guide discovery but do not guarantee matches | Preferences screen and backend preference save path | Native save/load QA, backend persistence proof, discovery behavior proof. |
| Discovery | Launch-stage suggestions or empty states only | Discovery screen, matching API, `discoverable_profiles` view | Applied migrations, discovery privacy smoke SQL, native empty/loading/error/member-state QA. |
| Likes and matches | Mutual match behavior depends on backend gates | Likes/matching APIs, secure match/conversation migrations | Two-account QA, direct match-forging rejection, direct conversation-helper execution rejection, block/unmatch behavior proof. |
| Messaging | Chat is available only for matched, unblocked users | Messaging APIs, secure send-message RPC, conversation RPCs, private conversation helper boundary | Two-account chat QA, direct message-write rejection, direct conversation-helper execution rejection, first-message conversation creation proof, blocked/unmatched-chat rejection, image-path proof. |
| Read receipts | Privacy-aware read behavior is intended in source | Read receipt privacy migration and message read RPCs | Smoke SQL proving unread count clears without exposing sender-visible read status when off. |
| Reports | Report submission is a review path, not instant moderation | Report modal, safety API, hardened report RPC, duplicate-report abuse controls, service-role report review RPC, reviewer management RPCs, active reviewer registry, reviewer audit log | Report submit/review RPC smoke SQL, duplicate/open-report suppression proof, active reviewer identity proof (`reviewer_id` required, authorized, and recorded), reviewer management RPC proof, reviewer registry audit proof with operator/reason, finalized-report overwrite rejection, two-account report/block QA, safety owner and SLA proof. |
| Block/unmatch | Contact restriction path is expected after safety action | Block/unmatch APIs, safety migrations, runbook | Block persistence, unmatch behavior, blocked discovery/chat proof, support escalation proof. |
| Verification review | Review-based trust cue only, not automatic approval | Verification upload screens, OCR service, private storage migrations | Private storage proof, OCR deploy proof, reviewer workflow proof, native valid/invalid upload QA. |
| OCR extraction | Source proxy exists but live extraction is unproven | `supabase/functions/ocr`, OCR service, quota RPC | Edge Function deploy, secret presence, JWT enforcement, valid/invalid/rate-limit checks. |
| Notification settings | Backend-backed preferences exist in source | Notification settings screen, notification preferences API, notification migration/RPCs | Applied migration, RPC smoke SQL, API mapping tests, provider delivery proof before delivery claims. |
| Account deletion requests | Backend-backed request queue path exists | Privacy screen, deletion request migration/RPC | RPC smoke SQL, support owner proof, retention workflow proof, native request QA. |
| Phone verification | Off for launch | Phone verification screen copy | Provider ownership, SMS QA, privacy/legal review before enabling. |
| Voice/video calls | Off for launch | Voice/video unavailable screens | Provider decision, permission UX QA, safety review, release signoff before enabling. |
| Membership/pricing | Planned pricing and interest only | PM_Web membership section and mailto helper | Legal/payment approval, checkout QA, processor ownership, support/refund path before billing claims. |
| Support/legal mailboxes | Mailto links exist with sensitive-data warnings | PM_Web helper, footer/legal/FAQ CTAs, safety runbook | Mailbox ownership, delivery test, owner backup, SLA and escalation proof. |

## Product design rules

- One primary action per screen or section: join waitlist, continue setup, save settings, submit report, or contact support.
- Every unavailable feature needs a clear state: off for launch, pending release sign-off, pending review, or requires operational proof.
- Empty states should explain what happened, what is safe to do next, and what is not promised.
- CTAs must avoid prefilled personal data, private profile details, IDs, payment details, private messages, or location data.
- Accessibility labels and helper text must match the actual launch-stage behavior.

## Evidence discipline

- Source-complete means code or docs exist locally; it does not mean live, deployed, passing, or launch-ready.
- Local-passing means the named command passed on the stated date and source revision only.
- Production-ready requires current local checks plus target-environment proof, native QA, safety operations proof, and owner signoff.
- If a script, source file, migration, or launch doc changes after a pass, rerun the affected checks before using that pass as launch evidence.

Waitlist backend note: public backend capture must route through the `waitlist-signup` Edge Function; `submit_waitlist_signup` remains private/service-role behind that edge layer until target-environment proof is captured.
