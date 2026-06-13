# PM App discovery and preferences client copy pass

Date: 2026-06-11

## Scope

- Discover screen empty state and discovery notice.
- Account setup preferences screen.

## What changed

- Removed launch-stage and cohort wording from discovery and preference guidance.
- Removed duplicated empty-state fallback copy.
- Reframed discovery limits around privacy settings, review status, filters, and current availability.
- Preserved safety guidance: review details, pass when unsure, and report concerns.

## Verification

- Targeted PM_App copy, contract, TypeScript, lint, and diff checks were run after the change.
- Production proof still depends on external EAS, Supabase, live-service, Vercel, and owner-signoff access.
