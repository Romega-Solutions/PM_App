# Env Template Contract

## Status

Source update completed. The env template contract was not run in this turn.

## Added

`scripts/check-env-template-contract.mjs`

## What it checks

- `.env.example` exists.
- Public Supabase URL placeholder is present.
- Public Supabase anon-key placeholder is present.
- Optional OCR endpoint key is present.
- OCR custom-backend guidance requires `Authorization: Bearer <Supabase access token>`.
- `.env.example` does not contain obvious real anon JWTs, OCR provider keys, service-role keys, or database URLs.

## Why it matters

The real `.env` file is blocked from release until cleanup approval. The safe template still needs to remain complete enough for setup, QA, and deployment without leaking secrets.

## Evidence still needed

- Run `node scripts/check-env-template-contract.mjs`.
- Keep `.env.example` updated if public env requirements change.
