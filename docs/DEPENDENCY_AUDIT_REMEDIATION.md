# Dependency Audit Remediation Plan

Last updated: 2026-06-11

## Current status

PM_App release-local now includes:

```bash
npm run check:dependency-audit
```

The command runs:

```bash
npm audit --audit-level=moderate
```

QA observed moderate advisories through the Expo dependency chain. The reported chain was:

```text
uuid -> xcode -> @expo/config-plugins -> expo
```

`npm audit fix --force` is not approved for the release branch because it can downgrade or otherwise change Expo runtime dependencies in a way that breaks the Expo SDK 54 app.

## Remediation path

1. Create a dedicated dependency-upgrade branch.
2. Keep Expo SDK 54 compatibility unless there is a deliberate SDK upgrade decision.
3. Prefer Expo-supported package upgrades:

```bash
npx expo install --check
npx expo install expo@latest
```

4. If Expo SDK upgrade is required, run the official Expo upgrade flow and review native config changes.
5. Re-run the local release checks after dependency changes:

```bash
npm run check:dependency-audit
npm run check:privacy-logs
npm run lint
npx tsc --noEmit --pretty false
npm test -- --runInBand --no-cache
npm run build:web
```

6. Re-run native emulator/device QA because Expo/runtime dependency changes can affect permissions, routing, storage, image picker, and push/session behavior.

## Do not do on the release branch

- Do not run `npm audit fix --force` directly on the release branch.
- Do not downgrade Expo, React Native, React, navigation, image-picker, file-system, or Supabase dependencies just to silence audit output.
- Do not mark a dependency advisory as resolved using lockfile-only changes unless the audit output proves the advisory is gone.
- Do not ship a runtime dependency change without rerunning native QA on the target build path.
- Do not hide the advisory by lowering the audit level without written release/security approval.

## Evidence that clears this blocker

Attach one of these outcomes to `docs/LAUNCH_EVIDENCE_PACKET.md`.

### Option A: Remediated

Required evidence:

- branch or PR containing dependency changes
- `npm run check:dependency-audit` pass output
- `npm run check:local-quality` pass output on current head
- native QA rerun evidence for auth, onboarding, photo picker, location, verification, discovery, chat, and report/block
- reviewer note confirming Expo SDK compatibility and no forced downgrade

Decision:

```text
Dependency advisory status: remediated
Engineering owner:
Reviewer:
Date:
Evidence:
Residual risk:
```

### Option B: Deferred with accepted risk

Use only when remediation would create larger launch risk than the advisory itself.

Required evidence:

- current `npm audit --audit-level=moderate` output with secret-free logs
- advisory scope summary
- affected dependency chain
- reason immediate remediation is deferred
- target remediation branch/date
- product/security owner signoff

Decision:

```text
Dependency advisory status: deferred with accepted risk
Advisory chain:
Runtime exposure summary:
Why not fixed before launch:
Target remediation date:
Security/release owner:
Product owner:
Date:
Evidence:
```

### Option C: Hold release

Use when the advisory is exploitable in the launch path, ownership cannot assess the risk, or dependency changes cannot be safely validated before launch.

Decision:

```text
Dependency advisory status: hold release
Reason:
Owner:
Next investigation step:
Date:
Evidence:
```

## Release rule

Do not mark PM_App launch-ready while `npm run check:dependency-audit` fails, unless product/security leadership explicitly accepts the advisory risk in writing and the exception is attached to the launch evidence packet.
