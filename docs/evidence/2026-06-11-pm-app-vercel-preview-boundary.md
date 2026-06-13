# PM_App Vercel Preview Boundary

Date: 2026-06-11
Scope: PM_App web preview deploy under the Romega Vercel project.

## What was attempted

- Confirmed the local project is linked to `romega-solutions/pm-app`.
- Confirmed the existing production URL `https://pm-app-omega.vercel.app` remains reachable.
- Attempted normal preview deploy with the Romega Vercel profile.
- Attempted a longer preview deploy with build logs enabled.
- Pulled preview project settings with `vercel pull --yes --environment=preview`.
- Attempted local `vercel build --yes`.
- Packaged the existing Expo web export into Vercel Build Output API format and attempted `vercel deploy --prebuilt --target preview --yes`.

## Results

- Production URL remained HTTP 200 during the checks.
- Normal preview deploys created these preview records but did not resolve to `Ready`:
  - `https://pm-9tadhny56-romega-solutions.vercel.app`
  - `https://pm-fi6k4hbek-romega-solutions.vercel.app`
- The prebuilt preview attempt created this preview record but also did not resolve to `Ready`:
  - `https://pm-ev88c3vwg-romega-solutions.vercel.app`
- Vercel inspect reported `target: preview` and `status: UNKNOWN` for the new preview records.
- Direct preview access returned HTTP 401, consistent with deployment protection.

## Local build evidence already available

- `npm run check:source-contracts` passed.
- `npm run lint` passed.
- `npx tsc --noEmit --pretty false` passed as part of local quality.
- Jest passed 121 tests as part of local release quality.
- `npm run build:web` completed and exported `dist`.

## Blocker

PM_App preview deployment is blocked by Vercel preview records staying in `UNKNOWN` state from the CLI. The app has valid local web export evidence, but no clean `Ready` PM_App preview URL was produced in this session.

## Not changed

- No production promotion was run.
- No production alias was changed.
- No `pinaymate.com` rollback or alias change was attempted from this PM_App deploy flow.
