# PM_App beta live proof

Date: 2026-07-02
Branch/source: `dev` through deployed app commit `fc9e857`
Environment: `https://beta.pinaymate.com`
Owner: Codex / Romega engineering

## Browser beta smoke

| Check | Result | Evidence note |
| --- | --- | --- |
| Foreigner no-login preview | Pass | Beta welcome enters seeded app preview and shows Filipina demo profiles. |
| Pinay no-login preview | Pass | Beta welcome enters seeded app preview and shows foreigner demo profiles. |
| In-app preview switch | Pass | Profile switch changes Foreigner to Pinay preview and resets demo-only state. |
| Messages preview | Pass | Seeded inbox loads, including Pinay-preview-specific conversation copy. |
| Bottom navigation | Pass | Discover, Liked You, Messages, and You tabs are visible and not clipped. |
| Viewports | Pass | Checked mobile `390x844`, laptop `1366x900`, and desktop `1512x982`. |
| Browser errors | Pass | No critical page errors, console errors, or non-aborted failed requests. |
| Authenticated sign-in shell | Pass | Disposable beta account signed in on mobile `390x844` and laptop `1366x900`; Discover, Liked You, Messages, and You tabs loaded and were not clipped. |
| Authenticated setup screens | Pass | After sign-in, basic info, profile photo upload, and review-based verification setup screens rendered on laptop without HTTP/page failures. |
| Authenticated settings screens | Pass | After sign-in, protected Privacy, Match Preferences, and Notifications routes rendered on laptop without reload-error banners, HTTP failures, or page errors. The live smoke also selected the Marriage relationship goal, submitted Save preferences, required the success dialog, and confirmed the preferences screen remained usable after save. |
| Profile photo upload/storage | Pass | Live proof signed in as the disposable beta user, uploaded a generated image to the user-scoped `profile-photos` storage path, updated the profile photo list, verified public image readability, and cleaned up profile/storage state. |
| Demo safety report/block | Pass | No-login Foreigner preview opened seeded profile details, submitted a private safety report with block enabled, showed the beta-safe demo receipt, and sent no real moderation report for seeded data. |
| Demo chat send path | Pass | No-login Foreigner preview opened a seeded conversation, rendered the demo chat, sent a local-only reply, confirmed the outgoing message bubble, and opened chat safety options without backend failures. |
| Demo discovery filters | Pass | No-login Foreigner preview opened Discovery filters, confirmed age range, distance radius, and relationship-goal controls, saved the Marriage capsule in demo mode, and verified the seeded feed updated to marriage-intent demo profiles without backend writes. |

Command:

```powershell
npm run smoke:beta-preview
$env:PM_WEB_MVP_EMAIL="<disposable-beta-user>"
$env:PM_WEB_MVP_PASSWORD="<local-only-password>"
npm run smoke:web-mvp
Get-Content .env.local | Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object { $pair = $_ -split '=',2; [Environment]::SetEnvironmentVariable($pair[0], $pair[1], 'Process') }; npm run smoke:web-mvp
gh workflow run "PM_App CI" --ref dev -f run_live_supabase_proof=false -f run_web_mvp_smoke=true
npm run proof:photo-upload:live
gh workflow run "PM_App CI" --ref dev -f run_live_supabase_proof=false -f run_web_mvp_smoke=false -f run_photo_upload_proof=true
gh workflow run "PM_App CI" --ref dev -f run_beta_preview_smoke=true
gh workflow run "PM_App CI" --ref dev -f run_ocr_live_proof=true
```

## GitHub and Vercel

| Check | Result | Evidence note |
| --- | --- | --- |
| Latest dev CI | Pass | `PM_App CI` passed for `fc9e857` on pull request run `28483593945` and push run `28483592086`. |
| Manual beta preview CI | Pass | GitHub Actions run `28483228615` completed `Beta preview smoke` successfully against `https://beta.pinaymate.com`, covering no-login preview, role switch, seeded messages, seeded chat local send, demo safety report/block, demo discovery filter save/update, and responsive bottom navigation. |
| Manual authenticated web MVP CI | Pass / latest dispatch blocked | GitHub Actions run `28481935045` completed `Web MVP live smoke` successfully using repo secrets `PM_WEB_MVP_EMAIL` and `PM_WEB_MVP_PASSWORD`; no credential values were logged. A later dispatch attempt for the preference-save extension was blocked by GitHub with HTTP `403` because the current token lacks repository admin rights to create workflow dispatch events. |
| Local authenticated web MVP smoke | Pass | `npm run smoke:web-mvp` passed 4/4 against `https://beta.pinaymate.com` on 2026-07-02 using ignored local `.env.local` disposable credentials. This run covered sign-in, core tabs, setup screens, protected privacy/preferences/notifications routes, and authenticated match preference save. |
| Manual photo upload/storage CI | Pass | GitHub Actions run `28479924029` completed `Photo upload live proof` successfully using repo secrets; no credential values, tokens, raw URLs, or uploaded image content were logged. |
| Manual OCR live CI | Pass | GitHub Actions run `28482324309` completed `OCR live proof` successfully using repo secrets; no credential values, tokens, raw OCR text, or document images were logged. The run covered authenticated OCR success and invalid-document safe failure. |
| Beta deployment | Pass | GitHub deployment `Production - pm-app-beta` completed for `fc9e857`; Vercel status was successful. |
| Beta domain | Pass | `beta.pinaymate.com` aliases to `pm-app-beta`. |
| Production domain separation | Pass | `dev` also created a `Preview - pm-app` deployment, but production beta deployment was separate under `pm-app-beta`; `app.pinaymate.com` and `beta.pinaymate.com` both returned HTTP `200` from distinct custom domains. |
| Live HTTP smoke | Pass | `https://beta.pinaymate.com` returned HTTP `200`. |

## Supabase linked project proof

| Check | Result | Evidence note |
| --- | --- | --- |
| CLI version | Pass | `supabase` CLI `2.109.0` via `npx`. |
| Migration history reachable | Pass | `migration list --linked` completed successfully. |
| Migration dry-run | Pass | `db push --dry-run --linked` reported remote database is up to date. |
| Release preflight SQL | Pass | `05_release_preflight_audit.sql` returned the expected PASS marker. |
| Safety smoke SQL | Pass | `04_safety_smoke_test.sql` returned the expected PASS marker. |
| OCR Edge Function deployment | Pass | `ocr` is ACTIVE and `verify_jwt=true`; unauthenticated POST returns HTTP `401`. |
| OCR live proof tooling | Pass | `npm run proof:ocr:live -- --include-rate-limit` confirmed `ocr` is present, `OCR_SPACE_API_KEY` is present by name, unauthenticated OCR returns HTTP `401`, authenticated synthetic valid document returns `result.fullText`, invalid document fails safely with HTTP `422`, and repeated attempts return HTTP `429`. Manual GitHub Actions run `28482324309` re-proved authenticated valid-document and invalid-document behavior without the optional rate-limit stress path. No secret values, hashes, tokens, raw OCR text, or documents were recorded. |
| Waitlist Edge Function deployment | Partial | `waitlist-signup` is ACTIVE and `verify_jwt=false`; live metadata check found the required `WAITLIST_ALLOWED_ORIGINS`, `WAITLIST_RATE_LIMIT_SALT`, and Turnstile waitlist secret names are not configured in the linked project, so approved-origin, rate-limit, and challenge-provider behavior must stay unclaimed until configured and re-proven. |

Commands:

```powershell
npx -y supabase@latest migration list --linked
npx -y supabase@latest db push --dry-run --linked
npx -y supabase@latest db query --linked --file supabase/tests/05_release_preflight_audit.sql
npx -y supabase@latest db query --linked --file supabase/tests/04_safety_smoke_test.sql
```

## Current limits

- This is beta/live-web proof, not native App Store or Play Store release proof.
- Waitlist approved-origin, challenge, and rate-limit behavior still require configured waitlist secrets and dedicated provider proof before stronger launch claims.
- Native QA should be rerun on release builds before promoting beta behavior to production-ready status.
