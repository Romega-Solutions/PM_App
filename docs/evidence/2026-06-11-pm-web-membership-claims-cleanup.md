# PM_Web Membership Claims Cleanup

Date: 2026-06-11
Scope: PM_Web membership section and launch-claims guard.

## What changed

- Replaced paid-tier wording that could sound like guaranteed ranking or status benefits.
- Changed "Expanded profile visibility direction" to "Profile presentation options."
- Changed "Profile boost interest" to "Profile quality review interest."
- Changed "VIP badge direction after policy review" to "Badge policy direction after review."
- Extended the PM_Web launch-claims guard to block future profile boost or paid visibility claims.

## Why it matters

PinayMate membership copy should describe launch-stage interest and product direction without implying paid ranking, guaranteed exposure, or verified status before checkout, policy, and safety review gates are live.

## Not verified in this pass

- `npm run check:release-local` was not executed.
- PM_Web lint/build and browser checks were not rerun.
- Live checkout, app-store, mailbox, and production domain behavior remain separate launch gates.
