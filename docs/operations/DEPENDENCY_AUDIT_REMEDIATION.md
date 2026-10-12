# Dependency Audit Remediation Plan

Last updated: 2026-10-09

## Current status

`npm run check:dependency-audit` is the blocking gate. It fails on critical advisories in the production dependency tree (`npm audit --omit=dev --audit-level=critical`) unless the advisory is listed in `docs/operations/dependency-audit-exceptions.json` with a reason and a review date. The accepted critical list is empty as of 2026-10-09.

PM_App CI also runs a separate `npm audit` step with `continue-on-error: true`. That step prints the full tree, including dev and build-tool findings, and does not decide whether the job passes.

On 2026-07-02 this gate was `npm audit --audit-level=moderate` and it passed with 0 vulnerabilities. By 2026-10-09 newly published advisories made that same command fail with about 80 vulnerabilities (3 critical, 65 high, 12 moderate) without a corresponding application change. Non-breaking overrides and lockfile updates cleared every critical advisory. The remaining findings are the five packages in the exceptions file. Their advertised fixes are Jest 30, expo-router 58, an expo-updates downgrade, image-size 2 (which Metro's path-based call cannot use), or an expo-atlas downgrade.

`npm audit fix --force` is not approved. On 2026-10-09 it proposed those breaking upgrades, including downgrades of Expo packages. An unbounded `npm audit fix` also floated Expo SDK 54 patch dependencies into nested SDK 58 copies and was reverted. Targeted overrides were applied instead. Expo stayed at 54.0.35, React Native at 0.81.5, and expo-router at 6.0.24.

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
- Do not hide the advisory by deleting the audit step or discarding its log. The 2026-10-09 gate change is the written decision: block on production critical advisories, keep the full report visible, and record each unfixed package in `docs/operations/dependency-audit-exceptions.json`. Review that file by 2026-11-09.

## Evidence that clears this blocker

Attach one of these outcomes to `docs\release\LAUNCH_EVIDENCE_PACKET.md`.

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

- current `npm audit` output with secret-free logs, plus `npm run check:dependency-audit`
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
