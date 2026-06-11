# Supabase Release Operator Checklist

Date: 2026-06-11
Status: Source runbook added - live Supabase not touched

## What changed

- Added `docs/SUPABASE_RELEASE_OPERATOR_CHECKLIST.md`.
- Documented staging/production operator fields, CLI/link proof, migration order proof, migration apply proof, release preflight audit, safety smoke test, OCR deploy proof, OCR behavior proof, and evidence packet update rules.
- Added fail-stop conditions for migration drift, project mismatch, missing RLS/storage/RPC proof, unsafe chat/message behavior, and OCR auth/secret leaks.

## Verification

Not run in this pass. This is an operator checklist only. Live staging/production evidence still requires Supabase project access, credentials, target project selection, and redacted command output.
