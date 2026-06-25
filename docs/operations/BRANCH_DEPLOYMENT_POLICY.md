# PM_App Branch And Deployment Policy

Status: active source policy for GitHub and Vercel.

## Branch lanes

| Branch | Purpose | Vercel project | Public URL |
| --- | --- | --- | --- |
| `main` | Production release branch | `pm-app` | `https://app.pinaymate.com` |
| `dev` | Beta/demo validation branch | `pm-app-beta` | `https://beta.pinaymate.com` |

Do not point both branches at the same Vercel project or domain. The workspace deploy helper keeps the mapping explicit in `scripts/romega-vercel.ps1`.

## GitHub protection target

- `main` should require pull requests, CODEOWNERS review, resolved conversations, linear history, no force pushes, no deletions, and the `PM_App CI` status check.
- `dev` should allow faster beta iteration but still require linear history, no force pushes, no deletions, and the `PM_App CI` status check.
- Live Supabase migration proof is manual and gated. It must not block ordinary PRs unless `SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF` are configured for a reviewed release proof run.

## Supabase migration proof

Normal CI proves local source contracts and buildability. Live Supabase state is proven separately through the `Supabase live proof` workflow dispatch job or the operator checklist in `docs/operations/SUPABASE_RELEASE_OPERATOR_CHECKLIST.md`.

If `npx supabase link --project-ref <ref>` fails with account privilege errors, do not run `db push` from CI. Escalate account access and capture redacted evidence after a Romega-owned operator can list remote migrations.
