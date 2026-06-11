# Safety surface QA rerun

Historical evidence notice: this rerun predates later 2026-06-11 PM_App and PM_Web source, UI copy, script, and release-gate changes. Treat all green results below as historical local evidence until the current commands are rerun on the latest source.

Date: 2026-06-11
Owner: Codex

## Scope

This rerun covered the local changes that added report/block entry points to Discovery profile details and Likes match cards, plus the PM_Web waitlist PII reduction.

## PM_App results

| Command | Result | Notes |
| --- | --- | --- |
| `npm run check:privacy-logs` | Pass | App runtime and Supabase Edge Function logging passed the privacy log guard. |
| `npx tsc --noEmit --pretty false` | Pass | No TypeScript errors reported. |
| `npm run lint` | Pass with warnings | Exit code 0. Existing warnings remain; no lint errors. |
| `npm test -- --runInBand --no-cache` | Pass | 18 suites passed, 99 tests passed. |
| `npm run check:supabase-static-contract` | Pass | 11 passed, 0 failed. Static audit only; live DB state is not proven. |
| `npm run check:release-local` | Fail | Stops at secret hygiene because `.env` is tracked. No secret values were printed here. |

## PM_Web results

| Command | Result | Notes |
| --- | --- | --- |
| `npm run check:local-links` | Historical pass | At the time of this rerun, waitlist email bodies avoided location prompts. Current PM_Web email helper copy changed afterward, so rerun this before treating it as current. |
| `npm run check:launch-claims` | Historical pass | No forbidden live app-store, checkout, matching, profile creation, or safety-guarantee claims were found at the time of the run. Current PM_Web source changed afterward, so rerun before using as launch proof. |
| `npm run lint` | Historical pass | Exit code 0 at the time of the run. Current PM_Web source changed afterward, so rerun before using as launch proof. |
| `npx tsc -p tsconfig.app.json --noEmit --pretty false` | Historical pass | No TypeScript errors reported at the time of the run. Current PM_Web source changed afterward, so rerun before using as launch proof. |
| `npm run check:release-local` | Historical pass | Local CTA/link audit and launch claims audit both passed at the time of the run. Current PM_Web source changed afterward, so rerun before using as launch proof. |

## Not proven

- PM_App native iOS/Android simulator or device behavior was not checked.
- PM_App web export was not rerun in this pass.
- PM_Web production domain, DNS, and mailbox deliverability were not checked.
- Supabase live migrations, live RLS behavior, SQL smoke tests, and deployed OCR function behavior were not checked.
- PM_App release cannot pass until tracked `.env` is removed from the git index/history plan and secret rotation is considered.
