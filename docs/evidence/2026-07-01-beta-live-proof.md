# PM_App beta live proof

Date: 2026-07-01
Branch/source: `dev` at `ff77de4`
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

Command:

```powershell
npm run smoke:beta-preview
```

## GitHub and Vercel

| Check | Result | Evidence note |
| --- | --- | --- |
| Latest dev CI | Pass | `PM_App CI` passed for `ff77de4`. |
| Beta deployment | Pass | `pm-app-beta-bugv5u1ye-romega-solutions.vercel.app` is Ready. |
| Beta domain | Pass | `beta.pinaymate.com` aliases to `pm-app-beta`. |
| Production domain separation | Pass | `app.pinaymate.com` remains aliased to `pm-app`, not `pm-app-beta`. |
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
- OCR valid-document extraction and waitlist approved-origin/rate-limit behavior still require dedicated provider/secret proof before stronger launch claims.
- Native QA should be rerun on release builds before promoting beta behavior to production-ready status.
