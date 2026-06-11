# OCR Edge Function Hardening

Date: 2026-06-11
Owner: Codex

## Status

Code updated. Validation and deployment were not run by instruction.

## Files changed

- `supabase/functions/ocr/index.ts`
- `docs/evidence/2026-06-11-ocr-edge-function-hardening.md`

## What changed

- Preserved the existing authenticated OCR request flow, multipart document contract, document size limit, quota claim, and OCR provider call.
- Kept existing `HttpError` responses for expected user-facing cases:
  - missing or invalid auth returns the existing safe sign-in message
  - missing Supabase or OCR provider configuration returns the existing temporary-unavailable message
  - quota exhaustion returns the existing rate-limit message with HTTP 429
  - unreadable OCR output returns the existing clearer-photo message with HTTP 422
- Hardened the final unexpected-error boundary so raw runtime, fetch, JSON parse, provider, or backend exception messages are logged server-side but no longer returned to clients.

## Security rationale

The Edge Function was already aligned on required auth, rate-limit behavior, server-side provider key handling, and generic provider failure copy for known error paths. The remaining launch-safety gap was that unexpected exceptions could be serialized back to users through `error.message`. Returning a generic retry message for unknown failures avoids leaking backend internals while preserving the existing `{ "error": string }` response contract.

## Validation status

- Static inspection of `supabase/functions/ocr/index.ts` and `supabase/functions/ocr/README.md` completed.
- Tests, build, lint, typecheck, local function serving, Supabase deployment, and live OCR validation were not run by instruction.

## Launch follow-up

- Before production release, validate the deployed function for authenticated success, unauthenticated failure, quota-limit failure, unreadable-document failure, and provider outage behavior against the target Supabase project.
