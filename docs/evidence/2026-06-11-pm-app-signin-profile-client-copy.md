# PM App sign-in and profile client copy pass

Date: 2026-06-11

## Scope

- Sign-in screen.
- Profile screen.
- Edit profile header.
- Profile edit form.

## What changed

- Removed launch-stage wording from sign-in, profile unavailable, profile status, save-profile, and first-name accessibility copy.
- Replaced the profile status card with a lighter account/profile access strip.
- Replaced the profile edit safety card with a lighter privacy strip.
- Kept privacy, review status, account visibility, and safety guidance visible.

## Verification

- Targeted PM_App copy, contract, TypeScript, lint, and diff checks were run after the change.
- Production proof still depends on external EAS, Supabase, live-service, Vercel, and owner-signoff access.
