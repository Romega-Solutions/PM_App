# PinayMate OCR Edge Function

Supabase Edge Function endpoint for ID-document OCR.

## Purpose

- Keeps the OCR provider key server-side.
- Requires an authenticated Supabase session before provider calls.
- Accepts `multipart/form-data` with a `document` file field.
- Returns normalized JSON used by `src/services/ocrService.ts`.
- Fails closed when `OCR_SPACE_API_KEY` or Supabase auth environment values are missing.
- Returns generic client-safe provider errors while logging provider details server-side.

## Auth

`supabase/config.toml` sets:

```toml
[functions.ocr]
verify_jwt = true
```

The function also validates the bearer token against Supabase Auth before parsing the uploaded document.

## Required secret

```bash
npx supabase secrets set OCR_SPACE_API_KEY=your-provider-key
```

Optional:

```bash
npx supabase secrets set OCR_PROVIDER_URL=https://api.ocr.space/parse/image
npx supabase secrets set OCR_LANGUAGE=eng
```

## Deploy

```bash
npx supabase functions deploy ocr
```

Do not deploy with `--no-verify-jwt`.

## Live proof

After deploying to beta or production, prove the live path with a disposable signed-in account:

```powershell
$env:OCR_PROOF_EMAIL = "<existing-disposable-proof-user>"
$env:OCR_PROOF_PASSWORD = "<proof-user-password>"
npm run proof:ocr:live
```

The proof command generates synthetic document images locally under ignored `codex-tmp/`, confirms `OCR_SPACE_API_KEY` exists by name in Supabase secrets, checks unauthenticated `401`, checks authenticated valid-document extraction, and checks invalid-document safe failure. It never prints tokens, provider keys, raw OCR text, or document images.

Use the optional rate-limit proof only when provider-call spend is acceptable:

```powershell
npm run proof:ocr:live -- --include-rate-limit
```

Set the mobile app endpoint explicitly:

```env
EXPO_PUBLIC_OCR_ENDPOINT=https://your-project-ref.functions.supabase.co/ocr
```

If `EXPO_PUBLIC_OCR_ENDPOINT` is omitted, the mobile app derives the same endpoint from `EXPO_PUBLIC_SUPABASE_URL`.

If `EXPO_PUBLIC_OCR_ENDPOINT` is set to a custom backend, that backend must validate the `Authorization: Bearer <Supabase access token>` header before processing uploaded ID images. The client now requires a signed-in session for every OCR request, including custom endpoints.

## Response shape

```json
{
  "result": {
    "firstName": "Maria",
    "lastName": "Santos",
    "birthDate": "1998-04-03",
    "fullText": "..."
  }
}
```
