# Evidence Retention

This folder keeps only evidence that is useful for current release decisions.

## Keep

- `release-2026-06-11-manager-readiness-pmapp-pmweb.md` - manager-facing release posture summary.
- `2026-06-11-current-local-quality-release-blockers.md` - current local quality and release blocker snapshot.
- `2026-06-11-release-blockers-only.md` - operator blocker checklist.
- `2026-07-01-beta-live-proof.md` - current beta web, Vercel, CI, and linked Supabase smoke proof.
- `backend-2026-06-11-supabase-static-contract.md` - backend static-contract proof snapshot.
- `TEMPLATE-native-qa-proof.md` - native QA proof template.
- `TEMPLATE-supabase-live-proof.md` - Supabase live proof template.

## Trimmed

Historical one-off source-proof notes and old screenshot artifacts were removed from this folder. Those notes were useful while source hardening was being built, but they made the evidence folder hard to review and should not be treated as launch proof.

For launch review, use `docs/LAUNCH_EVIDENCE_PACKET.md` plus the retained summary/proof files above. New evidence should be added only when it proves a current release gate, live environment check, signed QA result, or owner decision.
