# PM_App Safety Operations Release Gate Evidence

Status: Blocked (scripted owners/evidence contract failed because required owner rows still contain placeholders)

## Required ownership, escalation, and evidence handling evidence

Gate contract used by `check:safety-operations-contract` and launch ownership evidence.

| Function | Primary owner | Backup owner | SLA / first response | Escalation path | Evidence handling rules |
| -------- | ------------- | ------------ | -------------------- | --------------- | ---------------------- |
| Safety owner | Romega | Romega Backup | Same business day | support@romegasolutions.com | Redact PII |
| Support owner | Romega | Romega Backup | 1 business day | support@romegasolutions.com | Redact PII |
| Legal owner | Romega | Romega Backup | 1 business day | legal@romegasolutions.com | Redact PII |
| Release owner | Romega | Romega Backup | 1 business day | release@romegasolutions.com | Redact PII |

## Completion criteria

- All owners and backups are real names, phone numbers, or account handles (not placeholders).
- Escalation paths must be reachable and documented (primary + backup).
- Evidence handling rules must explicitly ban sharing private IDs/messages/docs in public logs, tickets, or release notes.

## Current verification

`npm run check:safety-operations-contract` was run on 2026-06-11 and failed because the Safety owner, Support owner, Legal owner, and Release owner rows still use placeholders in this file and `docs\operations\SAFETY_MODERATION_RUNBOOK.md`.
