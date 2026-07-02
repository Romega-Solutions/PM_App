# PM_App Branch And Deployment Policy

Status: active source policy for GitHub and Vercel.

## Branch lanes

| Branch | Purpose | Vercel project | Public URL |
| --- | --- | --- | --- |
| `main` | Production release branch | `pm-app` | `https://app.pinaymate.com` |
| `dev` | Beta/demo validation branch | `pm-app-beta` | `https://beta.pinaymate.com` |

Do not point both branches at the same Vercel project or domain. The workspace deploy helper keeps the mapping explicit in `scripts/romega-vercel.ps1`.

## Vercel ignored-build guard

`vercel.json` runs `node scripts/vercel-ignore-build.mjs` as the Ignored Build Step. Vercel skips a deployment when that command exits `0` and builds when it exits non-zero.

Expected behavior:

- `main` builds only the `pm-app` project for `app.pinaymate.com`.
- `dev` builds only the `pm-app-beta` project for `beta.pinaymate.com`.
- `dev` deployments on `pm-app` are skipped to prevent production-preview churn and avoid duplicate build consumption.
- `main` deployments on `pm-app-beta` and stray feature branches on either known project are skipped.
- Unknown Vercel projects fail open and build, so a missing or changed project identity does not silently suppress a real deployment.

Both Vercel projects must have system environment variables exposed so `VERCEL_GIT_COMMIT_REF`, `VERCEL_PROJECT_PRODUCTION_URL`, and `VERCEL_PROJECT_ID` are available to the ignored-build command. The source contract `npm run check:vercel-branch-policy` proves the branch/project decision table locally and is included in `npm run check:source-contracts`.

## GitHub protection target

- `main` should require pull requests, CODEOWNERS review, resolved conversations, linear history, no force pushes, no deletions, and the `PM_App CI` status check.
- `dev` should allow faster beta iteration but still require linear history, no force pushes, no deletions, and the `PM_App CI` status check.
- Live Supabase migration proof is manual and gated. It must not block ordinary PRs unless `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` are configured for a reviewed release proof run.

## Supabase migration proof

Normal CI proves local source contracts and buildability. Live Supabase state is proven separately through the `Supabase live proof` workflow dispatch job or the operator checklist in `docs/operations/SUPABASE_RELEASE_OPERATOR_CHECKLIST.md`.

If `npx supabase link --project-ref <ref>` fails with account privilege errors, do not run `db push` from CI. Escalate account access and capture redacted evidence after a Romega-owned operator can list remote migrations.
