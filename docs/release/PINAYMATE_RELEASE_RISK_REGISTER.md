# PinayMate Release Risk Register

Date: 2026-06-11
Review lane: static product/release risk review only
Status: Not launch-ready

This register is source-based only. No validation commands, tests, builds, lint, typecheck, live Supabase checks, browser checks, native device checks, deployments, git commands, or env-file inspections were run for this review by instruction.

## Source Basis

- `PM_App/docs\release\LAUNCH_SIGNOFF_CHECKLIST.md`
- `PM_App/docs\release\LAUNCH_EVIDENCE_PACKET.md`
- `PM_App/docs\release\RELEASE_READINESS.md`
- `PM_App/docs\testing\NATIVE_QA_SCRIPT.md`
- `PM_App/docs\release\PRODUCTION_OWNERSHIP_CHECKLIST.md`
- `PM_App/docs\operations\SAFETY_MODERATION_RUNBOOK.md`
- `PM_Web/RELEASE_CHECKLIST.md`
- Recent evidence notes under `PM_App/docs/evidence/`, especially the manager readiness, release-gate, Supabase, dependency-audit, safety-surface, and PM_Web notes dated 2026-06-11.
- `PM_App/package.json` and `PM_Web/package.json` scripts only for declared release gates.

## Launch Decision Snapshot

PinayMate should stay blocked from public launch until the release evidence packet is completed with owner, date, environment, command/source, and evidence links for each gate. Current docs show local implementation progress, but they also show open proof gaps across native app behavior, live Supabase state, OCR deployment, production web/mailbox behavior, safety operations, account ownership, secret hygiene, and dependency risk.

## Release Control Board

Use this board as the single go/no-go view. A lane can move to `Ready` only when the named owner has attached proof in `LAUNCH_EVIDENCE_PACKET.md`. `Local only`, `source only`, or `needs rerun` does not count as ready.

| Lane | Required owner | Stop condition | Evidence that clears the stop | Current decision |
| --- | --- | --- | --- | --- |
| Secret hygiene | Engineering/security owner | Tracked `.env`, exposed key uncertainty, or failed secret-hygiene gate | Approved cleanup/rotation decision plus `npm run check:secret-hygiene` pass output | Stop |
| PM_App local release | Engineering QA owner | Current-head quality or release wrapper not run after latest changes | `npm run check:local-quality` and, after secret cleanup, `npm run check:release-local` pass output | Stop |
| PM_App native experience | Product/design QA owner | Native auth, onboarding, permissions, verification, discovery, matching, chat, or safety flows untested | Completed `NATIVE_QA_SCRIPT.md` with device/build details and evidence | Stop |
| Supabase backend | Backend owner | Migrations, RLS, storage, RPCs, privacy, and safety smoke are not proven on target projects | Staging then production migration/smoke evidence | Stop |
| OCR verification | Backend owner + verification reviewer | Function deploy, JWT auth, quota, secret presence, and valid/invalid document behavior are unproven | Staging then production OCR deploy/check evidence | Stop |
| PM_Web launch | Web/product owner | Final URL, mobile/desktop rendering, CTA routing, claims, and mailbox delivery are unproven | Local gate output plus final URL/browser/mailbox evidence | Stop |
| Safety operations | Safety/support owner | Report, block, unmatch, verification review, escalation, and evidence handling owners are unnamed | Reviewed runbook with owner, backup, SLA, and escalation proof | Stop |
| Production ownership | Product/engineering owner | Accounts, domains, stores, provider projects, mailboxes, and recovery paths depend on unclear/personal access | Completed production ownership checklist | Stop |

Launch remains blocked while any lane is `Stop`. A deferred lane must have a written risk-acceptance note from the release owner and product owner before it can be treated as accepted risk.

## Risk Register

| ID | Severity | Area | Remaining risk | Owner lane | Current source signal | Evidence needed | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Critical | Release control | Launch could be approved from stale or partial evidence. | Release owner + product engineering | `LAUNCH_EVIDENCE_PACKET.md` marks several domains `Blocked` or `Needs rerun`; blank evidence fields are treated as blockers. | Completed launch evidence packet with owner, date, environment, result, and evidence link for every row. | Product owner, engineering, safety/support, and store/account ownership rows are signed off or explicitly deferred with written risk acceptance. |
| R2 | Critical | Secret hygiene | Previously exposed or shared env values could require rotation before production even when the local secret-hygiene scan passes. | Engineering owner + release/security approver | `npm run check:secret-hygiene` and `npm run check:release-local` passed locally on 2026-07-01; production rotation review remains an owner decision. | Approved rotation decision for any previously shared values plus secret-hygiene pass output captured without secret values. | Any exposed/shared key risk is either rotated or formally accepted before production launch. |
| R3 | Critical | Supabase/backend | Live database may not match the required security, storage, privacy, messaging, and safety contract. | Backend owner | Docs require the full ordered migration set in `supabase/LAUNCH_MIGRATION_MANIFEST.md`; live applied state is not proven. | Staging then production migration dry-run/apply logs, migration history, policy/function checks, and `supabase/tests/04_safety_smoke_test.sql` output. | Staging passes before production; production has the full ordered migration set, storage policies, RLS/RPC constraints, and safety smoke pass evidence attached. |
| R4 | Critical | OCR/verification | Identity document OCR could be undeployed, unauthenticated incorrectly, missing provider secrets, leaking provider details, or bypassing quota controls. | Backend owner + verification reviewer | Docs require `OCR_SPACE_API_KEY`, JWT-verified `ocr` function deploy, valid/invalid/rate-limit checks; live behavior is not proven. | Supabase secret presence proof, function deploy output, unauthenticated 401 check, valid document success, invalid document recoverable error, rate-limit proof, and no raw secret/provider details in client output. | OCR only works for authenticated users, calls quota control before provider spend, submits pending review rather than auto-approval, and records safe user-facing errors. |
| R5 | Critical | Native PM_App QA | Web/export/local checks do not prove the mobile release experience for auth, onboarding, permissions, verification, discovery, matching, chat, report/block, or unmatch. | QA owner + product/design owner | `NATIVE_QA_SCRIPT.md` is required before launch; evidence rows are blank. | Completed native QA script on emulator or physical device with device/OS/build, screenshots or signed notes, and pass/fail for critical flows. | No fail-stop items remain: auth gates hold, email/reset links work, privacy settings persist, verification stays review-based, match-gated chat holds, and report/block/unmatch remove unsafe access. |
| R6 | High | Dependencies | Future forced audit fixes could create Expo runtime regression risk even though the current dependency audit is clean. | Engineering owner | `npm run check:dependency-audit` passed with 0 vulnerabilities on 2026-07-01. | Fresh dependency audit output for each release candidate, plus local quality/native QA rerun after any dependency changes. | PM_App dependency audit stays clean or any future advisory is accepted by release/security with documented rationale and no untested Expo runtime changes on the release branch. |
| R7 | High | Local release gates | Local gates can become stale after source/script/docs changes and do not prove external production behavior. | Codex/engineering QA lane | PM_App `npm run check:release-local` passed on 2026-07-01; PM_Web local release checks still need current-head evidence after path corrections. | PM_App and PM_Web current-head local gate outputs plus any generated evidence reports required by the release checklist. | Current-head local gates pass, with any warnings triaged and evidence attached before external staging/prod signoff. |
| R8 | High | Privacy/account controls | Privacy settings, read receipt privacy, online-status privacy, hidden discovery, and account deletion requests may exist in source but remain unproven live/native. | Backend owner + native QA owner + privacy/support owner | Migration/readiness docs list backend-backed privacy controls and account deletion, but live migration/native QA proof remains open. | SQL smoke outputs for privacy/account controls plus native QA evidence for toggles, hidden profile behavior, read receipt behavior, and deletion request submission. | Privacy toggles persist through backend, hidden profiles are excluded from discovery, read receipts respect user settings, and deletion requests create support-review queue rows. |
| R9 | High | Safety and moderation operations | User reports, verification review, critical escalation, evidence handling, and abuse response have no named production owners yet. | Safety/support owner + product owner | `SAFETY_MODERATION_RUNBOOK.md` has pending owner rows; launch checklist requires owner signoff. | Named report owner, verification reviewer, support owner, critical escalation owner, backups, SLA, and evidence-handling acceptance. | Support and safety can operate reports, blocks, unmatches, verification reviews, and critical escalations without relying on one developer or ad hoc chat. |
| R10 | High | PM_Web production | PM_Web may be locally safe but still unproven on final production URL, mobile viewport, DNS, CTA routing, and mailbox deliverability. | Web owner + product/design owner | `PM_Web/RELEASE_CHECKLIST.md` requires production URL, desktop/mobile smoke, support/legal mailbox proof, and waitlist-safe claims. | Final production URL smoke evidence, desktop/mobile screenshots, CTA/link audit, launch-claim audit, and test delivery proof for waitlist/support/legal mailboxes. | Public page stays waitlist-first, avoids fake app-store/checkout/matching/safety claims, renders on desktop/mobile, and mailboxes receive messages. |
| R11 | High | Production ownership | Launch surfaces may depend on personal accounts instead of Romega-owned recoverable access. | Product/engineering owner + account owners | `PRODUCTION_OWNERSHIP_CHECKLIST.md` rows for Expo/EAS, app stores, Supabase, OCR, DNS, mailboxes, safety, and incident response are pending. | Owner and backup proof for each production account, recovery path, project refs, app identifiers, mailbox access, and incident owner. | At least two approved owners can access or recover each launch-critical account without depending on one personal login. |
| R12 | Medium | Release deployment sequencing | Production work could start before staging gates prove migrations, OCR, and QA are safe. | Release owner + backend owner | Signoff checklist says staging must pass before production; production requires its own proof. | Staging migration/smoke/OCR/native/web evidence, then separate production evidence. | No production launch approval is recorded from staging-only or local-only proof. |
| R13 | Medium | Claims and support copy | Public copy could overstate launch status, safety, identity, active matching, app-store availability, or data handling. | Product/design owner + web owner | PM_Web guards/checklists exist for launch claims, data minimization, support/legal clarity, and waitlist-only positioning. | Fresh launch-claim guard output, product review, legal/support mailbox proof, and screenshots of final public pages. | Public copy remains accurate to actual launch stage and does not promise guaranteed safety, verified identity, checkout, app-store availability, or active matching without proof. |
| R14 | Medium | Incident/rollback readiness | Launch could proceed without a rollback owner, communication owner, emergency contact path, or post-launch support triage. | Product/engineering owner + support owner | Production ownership checklist keeps incident response pending. | Incident response owner/backup, rollback path, escalation channel, and communication owner recorded. | A release incident can be triaged, rolled back, and communicated without waiting for one unavailable person. |

## Codex-Controllable Work

These are controllable by engineering/Codex once the active implementation lane permits code or validation work. They are not completed by this static review.

- Keep release docs synchronized when gates, scripts, env requirements, or launch claims change.
- Add or tighten static guards for launch claims, privacy logs, file contracts, and Supabase static contracts when gaps are found.
- Rerun allowed local gates and attach fresh evidence after code churn settles.
- Prepare remediation notes for dependency advisories without forcing Expo runtime changes on the release branch.
- Convert failed static review findings into bounded implementation tasks for PM_App, PM_Web, or backend owners.

## User, Business, or External Approval Blockers

These cannot be closed by static repo work alone.

- Approval to clean tracked `.env` from the git index/history plan and decide whether any keys require rotation.
- Access to staging and production Supabase projects, SQL editor/CLI linking, secrets, and provider dashboards.
- OCR provider account ownership, quota/billing owner, and secret rotation process.
- Native iOS/Android emulator or device QA execution and signed evidence.
- App-store, Expo/EAS, DNS, support mailbox, legal mailbox, and production host ownership proof.
- Named safety/support/verification/incident owners and accepted response SLAs.
- Product owner risk acceptance for any intentionally deferred launch blocker.

## Recommended Release Path

1. Close secret-hygiene approval and dependency-risk decision before treating PM_App release-local as meaningful.
2. Rerun PM_App and PM_Web local release gates on current head and attach fresh evidence.
3. Apply the full Supabase migration set in staging, then run the safety smoke SQL and OCR staging checks.
4. Complete native QA against the same staging backend and OCR endpoint.
5. Prove PM_Web production URL, responsive rendering, CTA routing, and mailbox delivery.
6. Complete production ownership, safety moderation, support, incident, and final signoff rows.
7. Repeat required Supabase/OCR/web evidence in production before any public launch claim.

## Immediate Owner Assignments to Close

These are the next business decisions needed before engineering evidence can become launch evidence.

| Assignment | Required decision |
| --- | --- |
| Release owner | Who can approve launch, staging-only release, or hold? |
| Engineering/security owner | Who approves `.env` git-index cleanup, rotation decision, dependency risk, and release-local evidence? |
| Backend owner | Who owns Supabase staging/production migration, smoke SQL, OCR deploy, and rollback? |
| Product/design QA owner | Who signs native app experience, copy accuracy, and PM_Web conversion flow? |
| Safety/support owner | Who owns report review, verification review, abuse escalation, and response SLA? |
| Production account owner | Who owns Expo/EAS, app stores, Supabase, OCR provider, DNS, support/legal mailboxes, and recovery? |

## Unverified in This Review

- Current runtime behavior of PM_App or PM_Web.
- Current pass/fail status of local release commands.
- Current live Supabase migration state, RLS/storage policies, advisors, or smoke SQL.
- Current OCR function deployment, provider secret, auth, quota, or valid/invalid document behavior.
- Native app behavior on iOS/Android emulator or physical devices.
- Production PM_Web URL, DNS, mobile rendering, links, waitlist, support, or legal mailbox deliverability.
- Account ownership, backup access, incident response readiness, or safety/support owner signoff.
