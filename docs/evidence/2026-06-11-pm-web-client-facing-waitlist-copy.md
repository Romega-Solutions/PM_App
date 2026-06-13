# PM Web client-facing waitlist copy pass

Date: 2026-06-11

## Scope

- PM_Web waitlist form.
- PM_Web legal modal.
- PM_Web About, Download, and Features sections.
- PM_Web launch/client-copy guard wording.

## What changed

- Replaced launch-stage/readiness wording with client-facing waitlist, access, and product-path language.
- Reframed waitlist behavior around safe email capture, platform preference, access planning, and support coverage.
- Updated legal copy to separate website waitlist/support information from app account information without using internal release-stage wording.
- Updated guard scripts so they protect the new public-facing wording instead of forcing old launch-stage phrases back into the site.

## Verification

- Targeted PM_Web source scans and release checks were run after the change.
- Production deployment and rollback still depend on access to the Vercel project that owns pinaymate.com.
