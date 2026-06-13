# PM App empty matches client copy pass

Date: 2026-06-11

## Scope

- Empty matches state.

## What changed

- Removed launch-stage chat/access wording from the no-matches copy.
- Kept the explanation focused on mutual matching: matches appear after both people choose each other.
- Preserved safety guidance around pacing, private details, and reporting concerns.

## Verification

- Targeted PM_App copy, contract, TypeScript, lint, and diff checks were run after the change.
- Production proof still depends on external EAS, Supabase, live-service, Vercel, and owner-signoff access.
