# PinayMate Local Release Proof

Date: 2026-06-11
Scope: PM_Web and PM_App local source, build, and browser-smoke evidence only.

This note records what is currently proven locally and what remains blocked by external project access. It does not claim production readiness, deployed behavior, live Supabase state, app-store availability, mailbox delivery, or native-device QA.

## Locally Verified

### PM_Web public website

- Client-facing copy guard passed.
- Product design contract passed.
- Launch claims audit passed.
- Local CTA and mailto link audit passed.
- Dependency audit passed with `0` vulnerabilities at moderate threshold.
- Release-local report command passed after the final PM_Web copy/audit wording cleanup.
- ESLint passed.
- TypeScript app typecheck passed.
- Production build passed.
- Local Vite preview loaded at `http://127.0.0.1:4173`.
- Browser snapshot confirmed the cleaned public copy removed duplicate disclaimers and no longer showed the patched `being built`, `sign-off`, or readiness-style wording in the checked sections.

Commands verified:

```powershell
npm run check:client-copy
npm run check:product-design-contract
npm run check:launch-claims
npm run check:local-links
npm run check:release-local:report
npm run lint
npx tsc -p tsconfig.app.json --noEmit --pretty false
npm run build
```

Evidence reports written:

- `PM_Web/docs/evidence/2026-06-11-pm-web-launch-claims-audit.txt`
- `PM_Web/docs/evidence/2026-06-11-pm-web-local-cta-audit.txt`

Latest PM_Web release report refresh:

- `npm run check:release-local:report` passed on 2026-06-11 after the final audit-label cleanup.
- Dependency audit still reports `0` vulnerabilities at moderate threshold.
- Launch-claims report now uses the cleaned labels `store links stay unavailable until published` and `app-store access is not guaranteed before availability proof`.

Final PM_Web combined local verification:

- The final combined local verification set passed on 2026-06-11.
- Covered `check:client-copy`, `check:product-design-contract`, `check:launch-claims`, `check:local-links`, `lint`, `tsconfig.app.json` typecheck, production build, and `check:release-local:report`.
- Build output completed with Vite and generated the production `dist` bundle.

Browser evidence captured:

- PM_Web local preview page title: `PinayMate | Filipino Dating Built Around Trust`
- PM_Web screenshot artifact: `pm-web-local-preview-client-copy-clean-2026-06-11.png`
- PM_Web final product-copy screenshot artifact: `pm-web-local-preview-final-product-copy-2026-06-11.png`
- PM_Web mobile viewport smoke screenshot artifact: `pm-web-mobile-390x844-smoke-2026-06-11.png`
- PM_Web mobile viewport checked at `390x844`; snapshot showed mobile menu, stacked CTAs, and content constrained within the viewport.

### PM_App mobile app source and web export

- Supabase static contract passed with a written report.
- PM_App source contracts passed.
- PM_App lint passed.
- PM_App TypeScript typecheck passed.
- PM_App Jest suite passed with 19 test suites and 111 tests.
- PM_App combined local-quality wrapper passed.
- Expo web export passed.
- Exported web bundle loaded locally at `http://127.0.0.1:8082`.
- Browser snapshot confirmed the welcome screen rendered client-facing profile setup, safety cues, review cues, and mutual-intent copy.

Commands verified:

```powershell
npm run check:supabase-static-contract:report
npm run check:source-contracts
npm run check:local-quality
npm run lint
npx tsc --noEmit --pretty false
npm test -- --runInBand --no-cache
npm run build:web
```

Latest wrapper proof:

- `npm run check:local-quality` passed on 2026-06-11.
- The wrapper covered source contracts, lint, TypeScript, 19 Jest suites / 111 tests, and Expo web export.

Browser evidence captured:

- PM_App local exported route: `http://127.0.0.1:8082/welcome`
- PM_App page title: `Pinaymate`
- PM_App screenshot artifact: `pm-app-web-export-smoke-2026-06-11.png`
- PM_App mobile viewport screenshot artifact: `pm-app-web-mobile-390x844-welcome-2026-06-11.png`
- PM_App mobile viewport checked at `390x844`; snapshot showed logo, headline, trust signals, primary/secondary buttons, and legal links fitting the viewport.

### PM_App release-local gate attempt

`npm run check:release-local` was run on 2026-06-11. It passed the first local release checks, then stopped at the production ownership gate.

Passed before the stop:

- `npm run check:secret-hygiene`
- `npm run check:dependency-audit`
- Dependency audit result: `0` vulnerabilities at moderate threshold.

Blocked gate:

- `npm run check:production-ownership-contract`
- Result: fail.
- Reason: `app.json` still declares `expo.owner: canthought`; the contract requires proof this owner is Romega-controlled or a transfer to a Romega-owned account/team.

Additional release-gate checks run individually:

- `npm run check:safety-operations-contract`: fail because safety, support, legal, and release owners/backups/escalation/evidence-handling fields are still placeholder-like in the runbook and evidence doc.
- `npm run check:launch-evidence-contract`: fail because live Supabase, OCR, native QA, PM_Web production, product design QA, safety/moderation, and final launch decision rows do not yet have pass/deferred status, owner, date, and evidence.

## Blocked External Proof

### Vercel deploy and production rollback

- PM_Web is not linked to a Vercel project locally.
- Current Vercel login is `iron-mark`.
- Current Vercel team/project list does not show `pinaymate.com`.
- Current Vercel project list does not show a PinayMate project.
- Do not run deploy, production promote, or rollback from this session until the real PinayMate Vercel project is linked.

Required next proof:

```powershell
npx vercel link
npx vercel deploy
npx vercel rollback
```

Only run those after the account/team that owns `pinaymate.com` is active.

### Supabase live database proof

- `npx supabase migration list --linked` is blocked because the Supabase project is not linked.
- Local static contracts prove source intent only.
- They do not prove migrations are applied to staging or production.

Required next proof:

```powershell
npx supabase link --project-ref <pinaymate-project-ref>
npx supabase migration list --linked
```

Then run the SQL release audits against the linked target:

```sql
supabase/tests/05_release_preflight_audit.sql
supabase/tests/04_safety_smoke_test.sql
```

### EAS and native release proof

- EAS is not logged in from this machine session.
- Native iOS/Android builds, device QA, and store-readiness are not proven.

Required next proof:

```powershell
npx eas-cli login
npx eas-cli whoami
```

Then run the native build/QA path for the intended owner account.

## Current Release Position

- Local web and app source quality is in a stronger state.
- PM_Web public copy is cleaner and more client-facing.
- PM_App local source and web export compile successfully.
- Supabase backend design has source-level guard coverage.
- Production readiness is still not proven until Vercel, Supabase, EAS, native QA, and owner signoff are completed.
