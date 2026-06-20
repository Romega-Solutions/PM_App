# Dependency Audit Decision Control

## Status

Source/documentation update completed. No dependency audit, install, package update, lockfile update, tests, native QA, or release gates were run in this turn.

## Changed

`docs\operations\DEPENDENCY_AUDIT_REMEDIATION.md`

- Added actions not allowed on the release branch.
- Added evidence requirements for three decision paths:
  - remediated
  - deferred with accepted risk
  - hold release
- Added owner/signoff templates for dependency risk review.

## Why it matters

The PM_App dependency advisory is a launch blocker unless it is fixed or formally accepted. This update makes the decision auditable without encouraging risky forced dependency changes on the release branch.

## Evidence still needed

- Fresh `npm run check:dependency-audit` output.
- Either a remediation branch with full validation or signed accepted-risk evidence.
- Native QA rerun if dependency versions change.
