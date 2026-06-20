# PinayMate Smart Matching Claims Correction

Date: 2026-06-11
Scope: `docs\architecture\SMART_MATCHING_ALGORITHM.md`.

## What changed

- Removed the stale statement that verified users get a scoring bonus.
- Removed the future task to weight verified users higher.
- Removed the future task saying premium members get priority.
- Replaced those items with policy-safe guidance: verification is a reviewed trust signal, and paid features should not affect safety-sensitive ranking unless billing, fairness, and policy review approve it.

## Why it matters

Matching guidance should not promise more matches, guaranteed safety, or paid exposure before launch policy and backend evidence are complete.

## Not verified in this pass

- No command, lint, test, or build was run.
- Live matching behavior, ranking behavior, and native QA remain separate launch gates.
