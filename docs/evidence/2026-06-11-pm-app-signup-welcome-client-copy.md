# PM App signup and welcome client copy pass

Date: 2026-06-11

## Scope

- Welcome screen.
- Signup screen.

## What changed

- Replaced early-access and launch-stage wording with client-facing profile setup language.
- Changed signup CTA from "Create early-access profile" to "Create profile."
- Reframed email signup as the current account path without exposing internal launch state.
- Converted signup expectation and email notices from card-like blocks into lighter strips.

## Verification

- Targeted PM_App copy, contract, TypeScript, lint, and diff checks were run after the change.
- Production proof still depends on external EAS, Supabase, live-service, Vercel, and owner-signoff access.
