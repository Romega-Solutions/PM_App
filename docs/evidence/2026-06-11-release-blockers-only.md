# PinayMate Release Blockers Only

Date: 2026-06-11
Owner: Codex local QA
Scope: operator checklist for moving PinayMate from local/source-ready posture toward real production launch. This is not launch approval.

## Current decision

Launch is not approved.

The codebase has local/source proof for PM_Web and PM_App posture, but production readiness still depends on external access, live proof, native QA, and owner signoff.

Local release command note:
- `npm run check:release-local` now runs all configured local release gates and reports every failing gate in one run.

## 1. Vercel and PM_Web production

Current evidence:
- `PM_Web` has no local Vercel link.
- Current Vercel user is `iron-mark`.
- `pinaymate.com` is not visible under the current `marksiazon-dev` scope.
- Public `https://pinaymate.com` returned HTTP 200 and rendered on desktop/mobile on 2026-06-11.
- `npm run check:release-local` passes for PM_Web local/source posture.
- Public DNS lookup did not return MX records for `pinaymate.com`; support/legal mailbox delivery is not proven.
- PM_Web local checks and screenshots are source/local proof only.

Required operator action:
- Switch to or provide the Vercel team that owns `pinaymate.com`.
- Link `PM_Web` to the correct Vercel project.
- Confirm the previous known-good production deployment before any rollback.
- Keep final-domain desktop and mobile smoke evidence current after any deployment or rollback.
- Configure/prove MX records if needed, then prove `support@pinaymate.com` and `legal@pinaymate.com` receive mail.

Codex can continue after access:
```powershell
cd "C:\Codes Local\__Work-Romega\Work - Romega Projects (Workspace)\PM_Web"
npx vercel link --scope <team-that-owns-pinaymate>
npx vercel --target=preview --scope <team-that-owns-pinaymate>
npx vercel rollback <previous-pinaymate-production-deployment-id-or-url> --scope <team-that-owns-pinaymate> --yes
```

## 2. Supabase staging and production

Current evidence:
- No local Supabase project ref is present.
- `npx supabase migration list --linked` fails because the project is not linked.
- `npx supabase functions list` fails because no Supabase access token is available.
- Local static contract proof exists, but it is not live DB proof.

Required operator action:
- Link the correct staging Supabase project.
- Authenticate Supabase CLI or provide `SUPABASE_ACCESS_TOKEN` securely.
- Run migration dry-run and apply sequence in staging.
- Run safety smoke SQL and release preflight audit.
- Repeat the approved sequence for production after staging passes.
- Capture redacted SQL/output evidence.

Codex can continue after access:
```powershell
cd "C:\Codes Local\__Work-Romega\Work - Romega Projects (Workspace)\PM_App"
npx supabase link --project-ref <staging-ref>
npx supabase migration list --linked
npx supabase db push --dry-run --linked
npx supabase db push --linked
```

## 3. OCR Edge Function

Current evidence:
- OCR source/static checks exist.
- Live function deployment is not proven.
- `OCR_SPACE_API_KEY` presence in the target Supabase project is not proven.
- Authenticated, unauthenticated, invalid-document, and rate-limit behavior are not proven live.

Required operator action:
- Confirm `OCR_SPACE_API_KEY` exists in the target Supabase project without exposing the value.
- Deploy the OCR Edge Function.
- Capture live proof for authenticated valid request, unauthenticated rejection, invalid document handling, and rate limiting.

Codex can continue after access:
```powershell
cd "C:\Codes Local\__Work-Romega\Work - Romega Projects (Workspace)\PM_App"
npx supabase functions list
npx supabase functions deploy ocr
```

## 4. Native PM_App QA

Current evidence:
- `npx eas-cli whoami` returns `Not logged in`.
- `adb devices` shows no attached Android device.
- Android emulator tooling is not available in PATH.
- `npm run check:release-local` stops at production ownership because `expo.owner` is `canthought`.
- Web-export screenshots prove only limited signed-out/local behavior.

Required operator action:
- Prove `canthought` is Romega-controlled or transfer the Expo/EAS app to a Romega-owned account/team.
- Log in to the correct EAS/Expo account after ownership is confirmed.
- Attach a physical device or provide a working emulator.
- Run authenticated native QA using `docs\testing\NATIVE_QA_SCRIPT.md`.
- Capture evidence for auth, onboarding, location, verification, discovery, matching, messaging, report/block/unmatch, privacy, notifications, account deletion request, and accessibility.

Codex can continue after access:
```powershell
cd "C:\Codes Local\__Work-Romega\Work - Romega Projects (Workspace)\PM_App"
npx eas-cli whoami
adb devices
npm run check:release-local
```

## 5. Safety, support, legal, and release ownership

Current evidence:
- `npm run check:safety-operations-contract` fails.
- Safety, support, legal, and release owner fields are still placeholder-like.
- Backup owners, escalation paths, and evidence-handling rules are not accepted.

Required operator action:
- Assign named safety owner and backup.
- Assign named support owner and backup.
- Assign named legal owner and backup.
- Assign named release owner and backup.
- Record escalation paths and SLAs.
- Record evidence-handling acceptance: no raw IDs, private messages, tokens, or private customer data in public trackers.

Codex can continue after owner names are provided:
```powershell
cd "C:\Codes Local\__Work-Romega\Work - Romega Projects (Workspace)\PM_App"
npm run check:safety-operations-contract
```

## 6. Final product/design and launch signoff

Current evidence:
- PM_Web local desktop/mobile/product-design proof exists.
- PM_App first impression web-export proof exists.
- PM_App authenticated/native product-design QA is not complete.
- Production ownership proof is not complete because `expo.owner` is currently `canthought`.
- Final product/design owner review is not recorded.
- Launch approval is not recorded.

Required operator action:
- Complete authenticated native PM_App review.
- Complete final PM_Web production review on `pinaymate.com`.
- Record product owner signoff.
- Record engineering signoff.
- Record safety/support signoff.
- Record store/account ownership signoff.
- Record final launch decision.

## Go/no-go rule

Do not launch until every blocked row in `docs\release\LAUNCH_EVIDENCE_PACKET.md` is changed by real evidence to either `Pass` or explicit `Deferred with risk acceptance` by the correct owner.
