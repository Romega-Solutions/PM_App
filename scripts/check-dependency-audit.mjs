#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXCEPTIONS_PATH = path.join(
  ROOT,
  "docs",
  "operations",
  "dependency-audit-exceptions.json",
);

const npmCommand = process.platform === "win32" ? "cmd.exe" : "npm";

function npmArgs(args) {
  if (process.platform !== "win32") return args;
  return ["/d", "/s", "/c", ["npm", ...args].join(" ")];
}

function runNpm(args) {
  const result = spawnSync(npmCommand, npmArgs(args), {
    cwd: ROOT,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 32 * 1024 * 1024,
  });

  if (result.error) {
    console.error(`npm ${args.join(" ")} failed to start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.signal) {
    console.error(`npm ${args.join(" ")} terminated by ${result.signal}`);
    process.exit(1);
  }

  return result;
}

function readAuditJson(args) {
  const result = runNpm(args);
  const stdout = (result.stdout || "").trim();
  if (!stdout) {
    process.stderr.write(result.stderr || "");
    console.error(`npm ${args.join(" ")} returned no JSON.`);
    process.exit(1);
  }

  try {
    return { data: JSON.parse(stdout), status: result.status ?? 1, stderr: result.stderr || "" };
  } catch (error) {
    process.stderr.write(result.stderr || "");
    console.error(`npm ${args.join(" ")} did not return JSON: ${error.message}`);
    process.exit(1);
  }
}

function advisoryRecords(data) {
  const records = [];
  for (const [packageName, vulnerability] of Object.entries(data.vulnerabilities || {})) {
    for (const via of vulnerability.via || []) {
      if (!via || typeof via !== "object" || !via.url) continue;
      const ghsa = via.url.split("/").filter(Boolean).pop();
      records.push({
        packageName,
        severity: via.severity || vulnerability.severity,
        ghsa,
        title: via.title || packageName,
        url: via.url,
      });
    }
  }
  return records;
}

function requireString(entry, field, label) {
  if (typeof entry[field] !== "string" || entry[field].trim() === "") {
    console.error(`${label} is missing a non-empty ${field}.`);
    process.exit(1);
  }
}

const exceptions = JSON.parse(fs.readFileSync(EXCEPTIONS_PATH, "utf8"));
if (!Array.isArray(exceptions.acceptedCriticalExceptions)) {
  console.error("acceptedCriticalExceptions must be an array.");
  process.exit(1);
}
if (!Array.isArray(exceptions.residualAdvisories)) {
  console.error("residualAdvisories must be an array.");
  process.exit(1);
}
requireString(exceptions, "reviewedOn", "dependency-audit-exceptions.json");

for (const entry of exceptions.acceptedCriticalExceptions) {
  requireString(entry, "package", "accepted critical exception");
  requireString(entry, "reason", "accepted critical exception");
  requireString(entry, "reviewedOn", "accepted critical exception");
  if (!Array.isArray(entry.ghsa) || entry.ghsa.length === 0 || entry.ghsa.some((id) => typeof id !== "string" || !id.startsWith("GHSA-"))) {
    console.error(`accepted critical exception for ${entry.package || "(unknown)"} needs GHSA ids.`);
    process.exit(1);
  }
}

console.log("Dependency audit gate");
console.log("Blocking rule: critical advisories in the production dependency tree (npm audit --omit=dev --audit-level=critical).");
console.log("Full npm audit, including dev and build-tool findings, is printed by the non-blocking CI report step and does not decide this command.");
console.log(`Exceptions: ${path.relative(ROOT, EXCEPTIONS_PATH)} (reviewed ${exceptions.reviewedOn}).`);
console.log("");

const full = readAuditJson(["audit", "--json"]);
const production = readAuditJson(["audit", "--omit=dev", "--json"]);
const fullMeta = full.data.metadata?.vulnerabilities || {};
const productionMeta = production.data.metadata?.vulnerabilities || {};
const fullAdvisories = advisoryRecords(full.data);
const productionAdvisories = advisoryRecords(production.data);
const productionIds = new Set(productionAdvisories.map((record) => record.ghsa));
const productionCritical = productionAdvisories.filter((record) => record.severity === "critical");
const allowedIds = new Set(exceptions.acceptedCriticalExceptions.flatMap((entry) => entry.ghsa));

console.log(
  `Full tree: ${fullMeta.total || 0} vulnerabilities (${fullMeta.critical || 0} critical, ${fullMeta.high || 0} high, ${fullMeta.moderate || 0} moderate).`,
);
console.log(
  `Production tree: ${productionMeta.total || 0} vulnerabilities (${productionMeta.critical || 0} critical, ${productionMeta.high || 0} high, ${productionMeta.moderate || 0} moderate).`,
);
console.log("");
console.log("Direct advisories still reported:");

const directNames = [...new Set(fullAdvisories.map((record) => record.packageName))].sort();
if (directNames.length === 0) {
  console.log("  none");
} else {
  for (const packageName of directNames) {
    const records = fullAdvisories.filter((record) => record.packageName === packageName);
    const severity = records.some((record) => record.severity === "critical")
      ? "critical"
      : records.some((record) => record.severity === "high")
        ? "high"
        : records[0].severity;
    const ids = [...new Set(records.map((record) => record.ghsa))].join(", ");
    const documented = exceptions.residualAdvisories.some((entry) => entry.package === packageName);
    console.log(`  - ${packageName} (${severity}) ${ids}${documented ? "" : " [not in the dated exceptions file]"}`);
  }
}

console.log("");

const stale = [...allowedIds].filter((id) => !productionIds.has(id));
if (stale.length > 0) {
  console.error("FAIL dependency audit");
  console.error("These accepted critical exceptions are no longer present in the production audit. Remove them from the exceptions file:");
  for (const id of stale) console.error(`  - ${id}`);
  process.exit(1);
}

const blocking = productionCritical.filter((record) => !allowedIds.has(record.ghsa));
if ((productionMeta.critical || 0) > 0 && productionCritical.length === 0) {
  console.error("FAIL dependency audit");
  console.error("npm reported production critical vulnerabilities, but their advisory ids could not be read.");
  process.exit(1);
}

if (blocking.length > 0) {
  console.error("FAIL dependency audit");
  console.error("Production dependencies have critical advisories that are not in the dated exceptions file:");
  for (const record of blocking) {
    console.error(`  - ${record.packageName} ${record.ghsa} ${record.title}`);
    console.error(`    ${record.url}`);
  }
  process.exit(1);
}

if (productionCritical.length > 0) {
  console.log("Accepted production critical exceptions:");
  for (const record of productionCritical) {
    console.log(`  - ${record.packageName} ${record.ghsa}`);
  }
  console.log("");
}

console.log("PASS dependency audit");
console.log("No unaccepted critical advisories in production dependencies.");
console.log("Remaining high and moderate advisories stay visible in the full npm audit report and in docs/operations/dependency-audit-exceptions.json.");
