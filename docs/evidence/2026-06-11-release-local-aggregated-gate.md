# Release Local Aggregated Gate

Date: 2026-06-11
Owner: Codex local QA
Scope: local release command behavior only. This does not prove production readiness, live Supabase, OCR, native QA, Vercel production, or owner signoff.

## Change

`npm run check:release-local` now runs all configured local release checks and reports every failing gate instead of stopping at the first failure.

Configured gates:

- secret hygiene
- dependency audit
- production ownership
- safety operations
- launch evidence
- local quality

## Why

The previous command used a shell `&&` chain. That hid later blockers whenever an earlier gate failed. A release operator needs the full blocker list in one run.

## Release interpretation

This improves blocker visibility only. Blocked rows in `docs\release\LAUNCH_EVIDENCE_PACKET.md` still require real proof or owner-approved risk acceptance.

## Verification

Command:

```powershell
npm run check:release-local
```

Result: fail, as expected for current release state.

The command now runs every configured gate. Passing sections:

- secret hygiene
- dependency audit with `0 vulnerabilities`
- source contracts
- lint
- TypeScript
- Jest: 19 suites, 111 tests
- Expo web export

Failing sections:

- production ownership
- safety operations
- launch evidence
