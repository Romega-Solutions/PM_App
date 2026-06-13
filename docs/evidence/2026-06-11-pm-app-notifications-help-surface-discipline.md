# PM App notifications and help surface discipline pass

Date: 2026-06-11

## Scope

- Profile settings Notifications screen.
- Profile settings Help & Support screen.

## What changed

- Replaced launch/readiness phrasing with client-facing notification and support language.
- Flattened repeated card-style settings, status, support, and help blocks into rows and strips.
- Kept safety boundaries visible: support email is not emergency service, live chat, or instant moderation.
- Removed duplicated warning copy from the support contact section.

## Verification

- Targeted PM_App copy, contract, TypeScript, lint, and diff checks were run after the change.
- Production launch proof still depends on external EAS, Supabase, live-service, and owner-signoff access.
