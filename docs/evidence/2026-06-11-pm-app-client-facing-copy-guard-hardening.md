# PM_App client-facing copy guard hardening

Date: 2026-06-11

## Scope

PM_App source guard update for user-facing mobile copy.

## What changed

- Hardened `check-client-facing-copy.mjs` against developer, deployment, QA, infrastructure, and unfinished-availability wording in mobile UI surfaces.
- Added blocked public-copy phrases for status language such as dev branch, deployment status, staging status, QA gate, release gate, debug note, debugging note, and developer note.
- Added blocked public-copy phrases for implementation jargon such as Edge Function, RPC, database schema, schema migration, API key, environment variable, env var, feature flag, service role, handoff contract, route blocker, and RLS policy.
- Added blocked public-copy phrases for stale availability framing such as online signup is unavailable, form unavailable, being finalized, instant signup is not available, instant waitlist signup, coming soon for iOS, coming soon for Android, email fallback, and available as fallback.

## Existing wiring

The app already wires `check:client-copy` into `check:source-contracts`, so this guard participates in the local source contract command path.

## Verification status

Not run in this pass.

This is source-level evidence only. It does not prove mobile rendering, Expo runtime behavior, native device behavior, Supabase runtime behavior, or production release readiness.
