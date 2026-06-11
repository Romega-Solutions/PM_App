# OCR log privacy guard

Date: 2026-06-11
Owner: Codex

## What changed

- Removed OCR response-body preview logging from the Edge Function error paths.
- Kept generic status-only OCR failure logs for operational debugging.
- Expanded the privacy log audit scope to include Supabase Edge Functions.

## Why it matters

- OCR provider responses can include sensitive text or document-derived data.
- Edge Functions must follow the same no-raw-payload logging rule as the app runtime.

## Verification status

- Code was patched locally.
- The privacy log audit was not rerun after this note.
- Live OCR behavior is not proven until the deployed function is checked with the target project and secrets.
