import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const safetyRunbookPath = "docs/SAFETY_MODERATION_RUNBOOK.md";
const safetyEvidencePath =
  "docs/evidence/2026-06-11-safety-operations-release-gate.md";
const launchEvidencePath = "docs/LAUNCH_EVIDENCE_PACKET.md";
const packageJsonPath = "package.json";
const releaseAggregatorPath = "scripts/check-release-local.mjs";
const requiredGate = "check:safety-operations-contract";
const requiredGateCommand = "node scripts/check-safety-operations-contract.mjs";
const requiredReleaseCommand = `npm run ${requiredGate}`;
const requiredReleaseAggregatorCommand = "node scripts/check-release-local.mjs";

const requiredOwners = ["Safety owner", "Support owner", "Legal owner", "Release owner"];

const placeholderPatterns = [
  /\btodo\b/i,
  /\btbd\b/i,
  /\bna\b/i,
  /\bn\/a\b/i,
  /not assigned/i,
  /not set/i,
  /to be filled/i,
  /to be assigned/i,
  /pending/i,
  /unassigned/i,
  /\[.*\]/,
  /^-+$/,
];

function readText(relativePath) {
  const absolutePath = join(rootDir, relativePath);

  if (!existsSync(absolutePath)) {
    return null;
  }

  return readFileSync(absolutePath, "utf8");
}

function parseTableRow(line) {
  const parts = line.split("|").map((part) => part.trim());
  if (parts[0] === "") parts.shift();
  if (parts[parts.length - 1] === "") parts.pop();
  return parts;
}

function isPlaceholder(value) {
  const normalized = value.trim().toLowerCase();

  if (!normalized || normalized === "-" || normalized === "--") {
    return true;
  }

  return placeholderPatterns.some((pattern) => pattern.test(normalized));
}

function findTableRow(content, functionName) {
  const normalizedName = functionName.toLowerCase();
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .map(parseTableRow)
    .find((cells) => (cells[0] || "").toLowerCase() === normalizedName);
}

function validateRoleRows(content, fileLabel, requiredFunctions, failures) {
  for (const functionName of requiredFunctions) {
    const row = findTableRow(content, functionName);

    if (!row) {
      failures.push(
        `${fileLabel}: missing required row for "${functionName}" in function table`,
      );
      continue;
    }

    if (row.length < 6) {
      failures.push(
        `${fileLabel}: "${functionName}" row must include 6 columns including evidence handling`,
      );
      continue;
    }

    const [, primaryOwner, backupOwner, sla, escalationPath, evidenceRules] = row;
    if (isPlaceholder(primaryOwner)) {
      failures.push(
        `${fileLabel}: ${functionName} primary owner is missing or placeholder-like`,
      );
    }

    if (isPlaceholder(backupOwner)) {
      failures.push(
        `${fileLabel}: ${functionName} backup owner is missing or placeholder-like`,
      );
    }

    if (isPlaceholder(sla)) {
      failures.push(
        `${fileLabel}: ${functionName} SLA/response target is missing or placeholder-like`,
      );
    }

    if (isPlaceholder(escalationPath)) {
      failures.push(
        `${fileLabel}: ${functionName} escalation path is missing or placeholder-like`,
      );
    }

    if (isPlaceholder(evidenceRules)) {
      failures.push(
        `${fileLabel}: ${functionName} evidence-handling rule is missing or placeholder-like`,
      );
    }
  }
}

const failures = [];

const safetyRunbook = readText(safetyRunbookPath);
const safetyEvidence = readText(safetyEvidencePath);
const launchEvidence = readText(launchEvidencePath);
const packageJson = readText(packageJsonPath);

if (!safetyRunbook) {
  failures.push(`Missing required doc: ${safetyRunbookPath}`);
}

if (!safetyEvidence) {
  failures.push(`Missing required doc: ${safetyEvidencePath}`);
}

if (!launchEvidence) {
  failures.push(`Missing required doc: ${launchEvidencePath}`);
}

if (!packageJson) {
  failures.push(`Missing required file: ${packageJsonPath}`);
}

const releaseAggregator = readText(releaseAggregatorPath);

if (launchEvidence && !launchEvidence.includes("2026-06-11-safety-operations-release-gate.md")) {
  failures.push(
    "LAUNCH_EVIDENCE_PACKET.md must reference 2026-06-11-safety-operations-release-gate.md",
  );
}

if (safetyRunbook && !safetyRunbook.includes("Safety operations release gate")) {
  failures.push(
    "SAFETY_MODERATION_RUNBOOK.md must include a Safety operations release gate ownership table",
  );
}

if (safetyRunbook) {
  validateRoleRows(
    safetyRunbook,
    "SAFETY_MODERATION_RUNBOOK.md",
    requiredOwners,
    failures,
  );
}

if (safetyEvidence) {
  validateRoleRows(
    safetyEvidence,
    "SAFETY_OPERATIONS evidence doc",
    requiredOwners,
    failures,
  );
}

if (packageJson) {
  try {
    const parsedPackage = JSON.parse(packageJson);
    const scripts = parsedPackage.scripts ?? {};

    if (scripts[requiredGate] !== requiredGateCommand) {
      failures.push(
        `package.json scripts.${requiredGate} must equal "${requiredGateCommand}"`,
      );
    }

    const releaseLocalCommand = scripts["check:release-local"];
    const releaseLocalUsesInlineSafetyGate =
      typeof releaseLocalCommand === "string" &&
      releaseLocalCommand.includes(requiredReleaseCommand);
    const releaseLocalUsesAggregatorSafetyGate =
      releaseLocalCommand === requiredReleaseAggregatorCommand &&
      releaseAggregator?.includes(`"run", "${requiredGate}"`);

    if (!releaseLocalUsesInlineSafetyGate && !releaseLocalUsesAggregatorSafetyGate) {
      failures.push(
        `package.json scripts.check:release-local must include "${requiredReleaseCommand}" or use ${requiredReleaseAggregatorCommand} with ${requiredGate}`,
      );
    }
  } catch {
    failures.push("package.json must be valid JSON for safety operations contract check");
  }
}

if (!launchEvidence || !launchEvidence.includes(requiredReleaseCommand)) {
  failures.push(
    `LAUNCH_EVIDENCE_PACKET.md must reference ${requiredReleaseCommand}`,
  );
}

if (failures.length > 0) {
  console.error("FAIL safety operations release gate contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS safety operations release gate contract");
console.log("Checked named safety/support/legal/release owners, SLAs, escalations, and evidence handling rules.");
