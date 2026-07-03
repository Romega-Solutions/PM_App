# PM_App Handoff And Archive Readiness

Date: 2026-07-03
Repository: `Romega-Solutions/PM_App`
Canonical repo URL: `https://github.com/Romega-Solutions/PM_App`
Canonical local project: `PM_App`

This is the current handoff note for leaving the repository clean, deployable, and understandable for the next owner. Do not use similarly named stale projects such as `PM-App` or `pm_app` as the canonical source unless Romega leadership explicitly changes the repository mapping.

## Current State

| Area | Status | Evidence |
| --- | --- | --- |
| PR #2 merge | Done | Merged to `main` on 2026-07-02T21:45:09Z. Merge commit `5b38750613852b41e03dc0add846f5d7e67e3d56`; PR head `2ae46f62358f7882ce3706e3275b1b177d9fec70`. |
| Production branch | Pass | GitHub remote `main` points to `5b38750613852b41e03dc0add846f5d7e67e3d56`. |
| Beta branch | Pass | GitHub remote `dev` points to `2ae46f62358f7882ce3706e3275b1b177d9fec70`. |
| Production domain | Pass | `https://app.pinaymate.com` returned HTTP 200 on 2026-07-03. Production intentionally does not expose beta preview buttons. |
| Beta domain | Pass | `https://beta.pinaymate.com` returned HTTP 200 and beta demo preview smoke passed 10/10 on 2026-07-03. |
| GitHub Actions | Pass | `PM_App CI` passed on `main` run `28623554460`; latest `dev` PR/push checks for `2ae46f6` also passed. |
| Vercel contexts | Pass | Merge commit has successful `Vercel - pm-app` and `Vercel - pm-app-beta` statuses. |
| Local release gate | Pass | `npm run check:release-local` passed on 2026-07-03: secret hygiene, dependency audit, ownership, safety ops, launch evidence, source contracts, lint, TypeScript, 20 Jest suites / 143 tests, and web export. |
| Supabase linked state | Pass | `npx -y supabase@latest migration list --linked` showed local/remote versions aligned; `db push --dry-run --linked` reported remote database is up to date. |
| Supabase SQL audits | Pass | `05_release_preflight_audit.sql` and `04_safety_smoke_test.sql` both returned PASS on 2026-07-03. |
| Web beta MVP | Pass | `npm run smoke:web-mvp` passed 18/18 against `https://beta.pinaymate.com` on 2026-07-03 using disposable local credentials from ignored `.env.local`. |
| Dependency audit | Pass | `npm audit --audit-level=moderate` found 0 vulnerabilities during `check:release-local`. |
| Worktree at handoff | Should be clean after the handoff commit | Run `git status --short --branch` before transferring ownership. |

## Branch And Domain Policy

| Branch | Purpose | Vercel project | Domain |
| --- | --- | --- | --- |
| `main` | Production | `pm-app` | `https://app.pinaymate.com` |
| `dev` | Beta/demo validation | `pm-app-beta` | `https://beta.pinaymate.com` |

`main` is protected with `PM_App CI`, code-owner review, one approving review, strict status checks, linear history, no force pushes, and no deletions. `dev` is protected with `PM_App CI`, strict status checks, linear history, no force pushes, and no deletions.

The Vercel ignored-build guard is in `scripts/vercel-ignore-build.mjs`, and its policy is documented in `docs/operations/BRANCH_DEPLOYMENT_POLICY.md`. Keep `main` and `dev` separated; do not point both to the same public domain.

## Required Secrets And Where They Live

Do not commit secrets. Keep real values only in provider secret stores or ignored local env files.

Required by app/runtime or proof tooling:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_ACCESS_TOKEN` for manual CI live Supabase proof
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_PASSWORD` or a local `DATABASE_URL` for Supabase SQL proof commands
- `OCR_SPACE_API_KEY` in Supabase Edge Function secrets only
- `PM_WEB_MVP_EMAIL` and `PM_WEB_MVP_PASSWORD` for disposable authenticated beta smoke
- `OCR_PROOF_EMAIL` and `OCR_PROOF_PASSWORD` for OCR live proof

`.env.local` is intentionally ignored and may hold disposable local proof values. `.env.example` must stay placeholder-only.

## Core Commands

Install and run locally:

```powershell
npm install
npm start
npm run web
```

Quality and release gate:

```powershell
npm run check:release-local
```

Beta no-login demo smoke:

```powershell
npm run smoke:beta-preview
```

Authenticated beta MVP smoke:

```powershell
Get-Content .env.local | Where-Object { $_ -match '^[A-Za-z_][A-Za-z0-9_]*=' } | ForEach-Object { $pair = $_ -split '=',2; [Environment]::SetEnvironmentVariable($pair[0], $pair[1], 'Process') }
npm run smoke:web-mvp
```

Supabase proof:

```powershell
npx -y supabase@latest migration list --linked
npx -y supabase@latest db push --dry-run --linked
npx -y supabase@latest db query --linked --file supabase/tests/05_release_preflight_audit.sql
npx -y supabase@latest db query --linked --file supabase/tests/04_safety_smoke_test.sql
```

Live OCR proof:

```powershell
npm run proof:ocr:live
```

## Current Beta Behavior

Beta includes seeded/demo flows so stakeholders can preview Discover, Liked You, Messages, filters, safety report/block receipts, local-only chat replies, and demo photo selection without requiring real users or live matches.

Do not remove the demo paths. They are intentionally plug-and-play fallbacks until live traffic and real data are ready. Live code paths remain preserved for real auth, profile setup, Supabase Storage uploads, verification submission, discovery, matching, messaging, safety reports, privacy settings, notification preferences, and account deletion requests.

Production `app.pinaymate.com` intentionally does not expose the beta preview entry buttons. A beta-preview smoke pointed at production will fail the preview-button assertions by design; use it only for beta.

## Open Follow-Ups

| Item | Status | Owner action |
| --- | --- | --- |
| Dependabot PR #3 Expo group | Open, CI failing as of 2026-07-03 | Review carefully in `dev`; Expo upgrades can affect native runtime. |
| Dependabot PR #4 React Native group | Open, CI failing as of 2026-07-03 | Review separately; do not batch with release handoff. |
| Dependabot PR #5 React group | Open, CI passing as of 2026-07-03 | Can review after handoff. |
| Dependabot PR #6 ESLint 10 group | Open, CI failing as of 2026-07-03 | Likely requires config/tooling work. |
| Dependabot PR #7 Zustand | Open, CI passing as of 2026-07-03 | Low-risk candidate after review. |
| Native iOS/Android QA | Not completed in this handoff run | Run `docs/testing/NATIVE_QA_SCRIPT.md` on release builds before app-store release claims. |
| Store/account ownership | Source contract passes | Keep Romega-owned recovery access for GitHub, Vercel, Supabase, Expo/EAS, DNS, OCR provider, and support/legal mailboxes. |
| Waitlist Edge Function provider proof | Partial | PM_App backend is proven; if PM_Web waitlist capture is enabled, run the waitlist Edge proof in `docs/operations/SUPABASE_LIVE_PROOF_COMMANDS.md`. |

## Archive Checklist

- Keep `main` as production and `dev` as beta.
- Keep `Romega-Solutions/PM_App` public unless leadership changes the distribution policy.
- Keep `.env.local` and any other secret files ignored.
- Keep `docs/evidence/2026-07-01-beta-live-proof.md` as the latest detailed live web proof.
- Keep `docs/operations/BRANCH_DEPLOYMENT_POLICY.md` as the branch/domain policy.
- Keep `supabase/LAUNCH_MIGRATION_MANIFEST.md` as the ordered migration source of truth.
- Record any future live proof with exact dates, commit SHAs, commands, and pass/fail results.
