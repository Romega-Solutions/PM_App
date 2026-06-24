# Secret Hygiene Remediation

Last updated: 2026-06-11

## Current blocker

`npm run check:release-local` must stay blocked while a real `.env` file is tracked by git.

This document defines the approval and evidence required before cleanup. Do not paste secret values into chat, docs, issues, PRs, screenshots, or release evidence.

## What needs approval

The release/security owner must approve:

- removing `.env` from git tracking
- keeping `.env.example` or other non-secret templates
- deciding whether exposed values need rotation
- deciding whether commit history needs deeper cleanup
- deciding who owns the provider-side rotation and redeploy

## Safe working-tree cleanup

Use only after explicit approval.

```powershell
cd PM_App

# Stop tracking the local env file while keeping the local file on disk.
git rm --cached -- .env

# Confirm .env remains ignored and no secret value is staged.
npm run check:secret-hygiene
```

Expected result:

- `.env` is no longer tracked.
- `.env.example` remains available for non-secret setup guidance.
- no raw secret values are printed or copied into evidence.

## Rotation decision

Use this decision template before launch.

```text
Secret hygiene decision:
Tracked env file removed from git index: yes/no
Repository shared outside trusted owner group: yes/no/unknown
Values require rotation: yes/no/unknown
Provider rotation owner:
Rotation completed: yes/no/not required
Reason if not required:
Date:
Evidence path:
```

## History cleanup decision

Removing `.env` from the current index does not erase it from old commits. Decide whether that matters for this repository’s sharing history.

Use this template:

```text
History cleanup decision:
Repository exposure scope:
Secret type:
Rotation completed before history cleanup: yes/no/not required
History rewrite required: yes/no
Reason:
Approver:
Date:
```

Do not rewrite git history unless the release/security owner explicitly approves the plan and downstream impact.

## Evidence that clears the blocker

Attach all required evidence to `docs\release\LAUNCH_EVIDENCE_PACKET.md`:

- approval note for `.env` index cleanup
- `npm run check:secret-hygiene` pass output after cleanup
- rotation decision note
- provider rotation proof or accepted no-rotation rationale
- history cleanup decision note if old commits contained sensitive values

## Release rule

Do not mark PM_App production-ready until secret hygiene has either:

- passed after approved cleanup and rotation review, or
- been explicitly deferred with written release/security and product risk acceptance.
