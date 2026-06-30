# PM_App beta live proof

Date: 2026-07-01
Branch/source: `dev` at `157d829`
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

Command:

```powershell
npm run smoke:beta-preview
$env:PM_WEB_MVP_EMAIL="<disposable-beta-user>"
$env:PM_WEB_MVP_PASSWORD="<local-only-password>"
npm run smoke:web-mvp
```

## GitHub and Vercel

| Check | Result | Evidence note |
| --- | --- | --- |
| Latest dev CI | Pass | `PM_App CI` passed for `157d829`. |
| Beta deployment | Pass | GitHub deployment `Production - pm-app-beta` completed for `157d829`; target deployment URL was `pm-app-beta-fn194wzz5-romega-solutions.vercel.app`. |
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
| OCR Edge Function deployment | Partial | `ocr` is ACTIVE and `verify_jwt=true`; unauthenticated POST returns HTTP `401`. Provider-secret and valid-document behavior were not re-proven in this pass. |
| OCR live proof tooling | Pass | `npm run proof:ocr:live -- --include-rate-limit` confirmed `ocr` is present, `OCR_SPACE_API_KEY` is present by name, unauthenticated OCR returns HTTP `401`, authenticated synthetic valid document returns `result.fullText`, invalid document fails safely with HTTP `422`, and repeated attempts return HTTP `429`. No secret values, hashes, tokens, raw OCR text, or documents were recorded. |
| Waitlist Edge Function deployment | Partial | `waitlist-signup` is ACTIVE and `verify_jwt=false`; tested origin returned safe email-path fallback `403`. Approved-origin, rate-limit, and provider/challenge proof remain separate release proof items. |

Commands:

```powershell
npx -y supabase@latest migration list --linked
npx -y supabase@latest db push --dry-run --linked
npx -y supabase@latest db query --linked --file supabase/tests/05_release_preflight_audit.sql
npx -y supabase@latest db query --linked --file supabase/tests/04_safety_smoke_test.sql
```

## Current limits

- This is beta/live-web proof, not native App Store or Play Store release proof.
- Waitlist approved-origin, challenge, and rate-limit behavior still require dedicated provider proof before stronger launch claims.
- Native QA should be rerun on release builds before promoting beta behavior to production-ready status.
