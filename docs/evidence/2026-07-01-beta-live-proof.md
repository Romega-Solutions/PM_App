# PM_App beta live proof

Date: 2026-07-02
Branch/source: current `dev` proof source
Environment: `https://beta.pinaymate.com`
Owner: Codex / Romega engineering

## Browser beta smoke

| Check | Result | Evidence note |
| --- | --- | --- |
| Foreigner no-login preview | Pass | Beta welcome enters seeded app preview and shows Filipina demo profiles. |
| Pinay no-login preview | Pass | Beta welcome enters seeded app preview and shows foreigner demo profiles. |
| In-app preview switch | Pass | Profile switch changes Foreigner to Pinay preview and resets demo-only state. |
| Auth entry screens | Pass | No-login browser smoke opens Sign In, navigates through Create Account to profile type selection and Signup, verifies disabled-state and validation errors without creating an account, then opens Forgot Password and Reset Password validation paths without sending reset email or changing credentials. |
| Messages preview | Pass | Seeded inbox loads, including Pinay-preview-specific conversation copy. |
| Bottom navigation | Pass | Discover, Liked You, Messages, and You tabs are visible and not clipped. |
| Viewports | Pass | Checked mobile `390x844`, laptop `1366x900`, and desktop `1512x982`. |
| Browser errors | Pass | No critical page errors, console errors, or non-aborted failed requests. |
| Authenticated sign-in shell | Pass | Disposable beta account signed in on mobile `390x844` and laptop `1366x900`; Discover, Liked You, Messages, and You tabs loaded and were not clipped. |
| Authenticated setup screens | Pass | After sign-in, basic info, profile photo upload, and review-based verification setup screens rendered on laptop without HTTP/page failures. |
| Authenticated profile photo picker upload | Pass | The signed-in browser smoke opened the real Library picker, uploaded the PM image fixture through Supabase Storage, verified the profile photo profile update, waited for the public image to load in the setup UI, then restored the disposable account's original photo list and completion flag through the signed-in Supabase client. |
| Authenticated verification OCR submission | Pass | The signed-in browser smoke opened the real selfie and ID document pickers, generated a synthetic QA ID image, posted it through the Supabase `ocr` Edge Function, uploaded selfie and document files to private `verification-docs` storage, submitted the `submit_verification` RPC, showed `Review pending`, then cleared the disposable account submission and private proof files. When repeated proof runs exhaust the OCR rate limit, the smoke accepts only the expected `429` response and verifies the beta manual-review fallback message. Malformed upload responses such as `400` or `422` still fail the smoke. |
| Authenticated profile edit | Pass | After sign-in, the protected Edit Profile route loaded, opened the real Change profile photo picker, uploaded the PM image fixture through Supabase Storage, verified the profile photo PATCH and public image load, restored the disposable account's original photo list, saved a public Occupation field through the Supabase profile update path, reloaded the saved value, then restored the original value. |
| Authenticated beta discovery match | Pass | When the signed-in disposable beta account had no live discovery candidates, Discover showed the seeded beta feed, opened profile details, liked a seed profile, showed the demo match receipt, and opened the seeded demo chat without backend match/message writes. |
| Authenticated beta liked-you actions | Pass | When the signed-in disposable beta account had no live matches, Liked You showed seeded beta matches, changed to the Mutual filter, opened the demo report/block flow with a beta-safe receipt, hid a seeded match through local-only unmatch, showed the decaying beta action snackbar, and opened a seeded demo chat without backend match, report, block, unmatch, or message writes. |
| Authenticated beta seeded inbox | Pass | When the signed-in disposable beta account had no live conversations, Messages showed the seeded beta inbox, opened a seeded chat, sent a local-only reply, opened the real browser photo picker for a demo chat image, rendered the local-only outgoing photo bubble, submitted a chat safety report with block enabled, and showed the beta-safe demo report receipt without backend safety writes. Live conversations, storage uploads, and moderation RPC paths remain preserved for real conversations. |
| Authenticated settings screens | Pass | After sign-in, protected Privacy, Match Preferences, and Notifications routes rendered on laptop without reload-error banners, HTTP failures, or page errors. The live smoke saved and restored read-receipt privacy, submitted the backend-backed account deletion request through its support-review RPC, saved the Marriage relationship goal, and saved/restored email notification preferences through their Supabase RPC paths. |
| Authenticated mobile privacy settings | Pass | A targeted authenticated smoke passed against `https://beta.pinaymate.com` at mobile `390x844`. It signed in with the disposable beta user, opened protected Privacy Settings, verified the Read Receipts switch fit within the viewport and was enabled, saved through the real `save_privacy_settings` RPC, and restored the original privacy settings through the signed-in Supabase client. |
| Authenticated mobile match preferences | Pass | After Vercel deployed `16b77aa` to `pm-app-beta`, a targeted authenticated smoke passed against `https://beta.pinaymate.com` at mobile `390x844`. It signed in with the disposable beta user, opened protected Match Preferences, verified the named minimum/maximum age sliders fit within the viewport, changed the age range to `24-36`, saved through the real profile PATCH path, confirmed the profile screen returned, and restored the original preference fields through the signed-in Supabase client. |
| Profile photo upload/storage | Pass | Live proof signed in as the disposable beta user, uploaded a generated image to the user-scoped `profile-photos` storage path, updated the profile photo list, verified public image readability, and cleaned up profile/storage state. |
| Demo safety report/block | Pass | No-login Foreigner preview opened seeded profile details, submitted a private safety report with block enabled, showed the beta-safe demo receipt, and sent no real moderation report for seeded data. |
| Demo liked-you actions | Pass | No-login Foreigner preview opened Liked You, changed to the Mutual filter, submitted a demo report/block with beta-safe receipt, hid a seeded match through local-only unmatch, showed the decaying beta action snackbar, and opened seeded chat without backend writes. |
| Demo chat send path | Pass | No-login Foreigner preview opened a seeded conversation, rendered the demo chat, sent a local-only reply, opened the browser photo picker for a demo chat image, confirmed the outgoing message and photo bubbles, and opened chat safety options without backend failures. |
| Demo discovery filters | Pass | No-login Foreigner preview opened Discovery filters, confirmed age range, distance radius, and relationship-goal controls, saved the Marriage capsule in demo mode, and verified the seeded feed updated to marriage-intent demo profiles without backend writes. Mobile web proof also opens the same filter sheet at `390x844`, verifies the named minimum/maximum age sliders fit within the viewport, updates the age range, saves, and confirms bottom navigation remains unclipped. |

Command:

```powershell
npm run smoke:beta-preview
$env:PM_APP_BETA_URL="http://localhost:5174"
npm run smoke:beta-preview
$env:PM_WEB_MVP_EMAIL="<disposable-beta-user>"
$env:PM_WEB_MVP_PASSWORD="<local-only-password>"
$env:EXPO_PUBLIC_SUPABASE_URL="<supabase-url>"
$env:EXPO_PUBLIC_SUPABASE_ANON_KEY="<supabase-anon-key>"
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
| Latest functional dev CI | Pass | `PM_App CI` passed for `928d68e` on pull request run `28554459634` and push run `28554458252`. |
| Manual beta preview CI | Pass | GitHub Actions run `28554628685` completed `PM_App CI` and `Beta preview smoke` successfully against `https://beta.pinaymate.com`, covering no-login preview, role switch, auth entry signup/user-type/recovery validation without backend-changing submits, seeded messages, seeded chat local send, demo safety report/block, demo Liked You filter/report/block/unmatch/chat with local-only receipts, demo discovery filter save/update, and responsive bottom navigation. |
| Manual authenticated web MVP CI | Pass | GitHub Actions run `28553957995` completed `PM_App CI` and `Web MVP live smoke` successfully on `da013cb` using repo secrets `PM_WEB_MVP_EMAIL`, `PM_WEB_MVP_PASSWORD`, `EXPO_PUBLIC_SUPABASE_URL`, and `EXPO_PUBLIC_SUPABASE_ANON_KEY`; no credential values were logged. The run covers sign-in, core tabs, setup screens, setup profile photo picker upload/profile update/public image load with cleanup, real verification selfie picker, real ID picker, OCR Edge Function success or expected rate-limit/manual-review fallback, private verification storage uploads, `submit_verification` RPC, verification cleanup, authenticated Edit Profile photo picker upload/profile PATCH/public image load with cleanup, authenticated profile edit save/restore, signed-in discovery details/demo match/demo chat when live discovery candidates are absent, signed-in Liked You seeded match filter/report/block/unmatch/chat with local-only demo receipts, signed-in seeded inbox/chat local send when live conversations are absent, browser picker demo chat photo insertion, local-only demo report/block receipt from chat safety options, protected settings routes, authenticated privacy save/restore, authenticated account deletion request submission through the support-review RPC, authenticated match preference save, and authenticated notification save/restore. |
| Local authenticated web MVP smoke | Pass | `npm run smoke:web-mvp` passed 8/8 against `https://beta.pinaymate.com` on 2026-07-02 using ignored local `.env.local` disposable credentials. This run covered sign-in, core tabs, setup screens, setup profile photo picker upload/profile update/public image load with cleanup, real verification selfie picker, real ID picker, OCR Edge Function success, private verification storage uploads, `submit_verification` RPC, verification cleanup, authenticated Edit Profile photo picker upload/profile PATCH/public image load with cleanup, authenticated profile edit save/restore, signed-in discovery details/demo match/demo chat when live discovery candidates are absent, signed-in Liked You seeded match filter/report/block/unmatch/chat with local-only demo receipts, signed-in seeded inbox/chat local send when live conversations are absent, real browser picker demo chat photo insertion, local-only demo report/block receipt from chat safety options, protected settings routes, authenticated privacy save/restore, authenticated account deletion request submission through the support-review RPC, authenticated match preference save, and authenticated notification save/restore. |
| Local beta preview smoke | Pass | `npm run smoke:beta-preview` passed 9/9 against a local web export on 2026-07-02. This run covered no-login Foreigner and Pinay previews, role switch, auth entry signup/user-type/recovery validation without backend-changing submits, seeded messages, seeded chat local send, browser picker demo chat photo insertion, demo safety report/block, demo Liked You filter/report/block/unmatch/chat with local-only receipts, demo discovery filter save/update, mobile age-slider controls, and responsive bottom navigation. |
| Post-deploy beta preview smoke | Pass | After Vercel deployed `3b59517` to `pm-app-beta`, `npm run smoke:beta-preview` passed 9/9 against `https://beta.pinaymate.com` on 2026-07-02. This re-proved the no-login preview roles, seeded chat text/photo path, safety receipts, Liked You actions, auth entry validation, laptop filter save, mobile age-slider filter save, and unclipped bottom navigation on the live beta domain. |
| Post-deploy targeted mobile preferences smoke | Pass | After the `16b77aa` beta deployment completed, the targeted authenticated mobile Match Preferences smoke passed against `https://beta.pinaymate.com`, proving shared web age sliders, real profile preference save, and cleanup/restore of the disposable beta user's preference fields. |
| Post-deploy targeted mobile privacy smoke | Pass | After the `72f20b8` beta deployment completed, the targeted authenticated mobile Privacy Settings smoke passed against `https://beta.pinaymate.com`, proving mobile Read Receipts layout, real privacy RPC save, and cleanup/restore of the disposable beta user's privacy settings. |
| Post-deploy targeted web smoke | Pass | After the `e61d6f8` beta deployment completed, the targeted authenticated seeded inbox browser smoke passed against `https://beta.pinaymate.com`, proving local-only demo reply, browser picker demo chat photo insertion, and local-only demo report/block receipt from chat safety options. |
| Manual photo upload/storage CI | Pass | GitHub Actions run `28479924029` completed `Photo upload live proof` successfully using repo secrets; no credential values, tokens, raw URLs, or uploaded image content were logged. |
| Manual OCR live CI | Pass | GitHub Actions run `28482324309` completed `OCR live proof` successfully using repo secrets; no credential values, tokens, raw OCR text, or document images were logged. The run covered authenticated OCR success and invalid-document safe failure. |
| Beta deployment | Pass | Vercel `pm-app-beta` deployment target `https://vercel.com/romega-solutions/pm-app-beta/5UeQZVBr2X94YUHHKnztV3AqAX4x` completed for `928d68e` and aliased to `beta.pinaymate.com`. |
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
