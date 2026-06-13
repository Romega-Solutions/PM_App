# Supabase and OCR Live Access Boundary

Date: 2026-06-11
Owner: Codex local QA
Scope: current local Supabase CLI/project linkage only. This does not prove staging migrations, production migrations, storage policy behavior, SQL smoke tests, Edge Function deployment, OCR secret presence, or provider request behavior.

## Commands

```powershell
if (Test-Path -LiteralPath "supabase\.temp\project-ref") { Get-Content -LiteralPath "supabase\.temp\project-ref" } else { "NO_SUPABASE_PROJECT_REF" }
npx supabase migration list --linked
npx supabase functions list
```

## Result

- Local project ref file is missing: `NO_SUPABASE_PROJECT_REF`.
- `npx supabase migration list --linked` failed with: `Cannot find project ref. Have you run supabase link?`
- `npx supabase functions list` failed with: `Access token not provided. Supply an access token by running supabase login or setting the SUPABASE_ACCESS_TOKEN environment variable.`

## Release interpretation

Supabase staging and OCR live evidence remain blocked from this session. Codex cannot prove migration apply, migration history, storage policy behavior, SQL smoke tests, OCR function deployment, OCR secret presence, authenticated OCR requests, unauthenticated rejection, invalid document handling, or rate limiting until the project is linked and authenticated.

Local static checks can support source posture only. They cannot replace linked staging/production proof.
