#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const rootDir = process.cwd();

const forbiddenPhrases = [
  {
    label: "backend implementation wording",
    pattern:
      /\b(?:backend capture|backend proof|backend path|backend process|backend verification|backend migration|protected backend|source-backed|backend-backed|current backend proof)\b/i,
  },
  {
    label: "Supabase implementation wording",
    pattern: /\bSupabase migration\b/i,
  },
  {
    label: "internal QA wording",
    pattern: /\b(?:production QA|release QA|readiness evidence|readiness checks)\b/i,
  },
  {
    label: "proof/readiness wording",
    pattern:
      /\b(?:release proof|launch proof|does not prove|not proven|production readiness|launch readiness)\b/i,
  },
  {
    label: "gated launch jargon",
    pattern: /\blaunch-gated\b/i,
  },
  {
    label: "internal signoff wording",
    pattern:
      /\b(?:release sign-off|support routing sign-off|provider setup|mailbox routing)\b/i,
  },
  {
    label: "explicit internal/technical note",
    pattern:
      /\b(?:internal|technical)\s+(?:note|copy|details|readiness|proof|implementation|status)\b/i,
  },
  {
    label: "developer or deployment status wording",
    pattern:
      /\b(?:dev branch|developer note|deployment status|deployed status|staging status|debug note|debugging note|QA gate|QA status|release gate)\b/i,
  },
  {
    label: "infrastructure implementation wording",
    pattern:
      /\b(?:Edge Function|RPC|database schema|schema migration|API key|environment variable|env var|feature flag|service role|handoff contract|route blocker|RLS policy)\b/i,
  },
  {
    label: "unfinished availability wording",
    pattern:
      /\b(?:online signup is unavailable|form unavailable|being finalized|instant signup is not available|instant waitlist signup|coming soon for iOS|coming soon for Android|email fallback|available as fallback)\b/i,
  },
  {
    label: "system-state wording in user guidance",
    pattern:
      /\b(?:continue disabled until|permission is disabled|button disabled until)\b/i,
  },
];

const scanDirs = ["app", "src/components", "src/features"];
const rawScanFiles = ["src/features/account/hooks/useLocationSearch.ts"];
const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const skippedSegments = new Set([
  "__tests__",
  "api",
  "hooks",
  "types",
  "stores",
  "services",
]);

function shouldSkipPath(pathName) {
  const normalized = pathName.replaceAll("\\", "/");
  return normalized
    .split("/")
    .some((segment) => skippedSegments.has(segment));
}

function walk(dir) {
  if (!existsSync(dir)) return [];

  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (!shouldSkipPath(relativePath)) {
        files.push(...walk(fullPath));
      }
    } else if (
      allowedExtensions.has(extname(entry.name)) &&
      !shouldSkipPath(relativePath)
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

const scanTargets = scanDirs.flatMap((dir) => walk(join(rootDir, dir)));
for (const rawScanFile of rawScanFiles) {
  const absolutePath = join(rootDir, rawScanFile);
  if (existsSync(absolutePath)) {
    scanTargets.push(absolutePath);
  }
}
const failures = [];

for (const file of scanTargets) {
  const content = readFileSync(file, "utf8");

  for (const forbidden of forbiddenPhrases) {
    if (forbidden.pattern.test(content)) {
      failures.push(
        `${relative(rootDir, file)} contains client-visible ${forbidden.label}`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("FAIL client-facing copy guard");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS client-facing copy guard");
console.log(
  `Checked ${scanTargets.length} PM_App frontend copy surfaces for internal readiness jargon.`,
);
