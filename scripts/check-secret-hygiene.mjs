#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();

const allowedEnvFiles = new Set([
  ".env.example",
  ".env.sample",
  ".env.template",
]);

function normalize(filePath) {
  return filePath.replaceAll("\\", "/");
}

function isEnvFile(filePath) {
  const baseName = path.posix.basename(normalize(filePath));
  if (allowedEnvFiles.has(baseName)) return false;

  return (
    baseName === ".env" ||
    baseName.startsWith(".env.") ||
    baseName.endsWith(".env")
  );
}

let trackedFiles;

try {
  trackedFiles = execFileSync("git", ["ls-files"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split(/\r?\n/)
    .map((file) => normalize(file.trim()))
    .filter(Boolean);
} catch {
  console.error("Secret hygiene audit: FAIL");
  console.error("Unable to inspect tracked files with git ls-files.");
  process.exit(1);
}

const trackedEnvFiles = trackedFiles.filter(isEnvFile);

if (trackedEnvFiles.length > 0) {
  console.error("Secret hygiene audit: FAIL");
  console.error(
    "Tracked env files must be removed from git history/index before launch review:",
  );
  for (const file of trackedEnvFiles) {
    console.error(`- ${file}`);
  }
  console.error("");
  console.error("Safe remediation after explicit approval:");
  for (const file of trackedEnvFiles) {
    console.error(`- git rm --cached -- ${file}`);
  }
  console.error("- Keep the local env file on disk for development.");
  console.error("- Commit the index cleanup only after review.");
  console.error(
    "- Record whether previously tracked public/anon/provider values need rotation.",
  );
  console.error("Do not paste env values into evidence.");
  process.exit(1);
}

console.log("Secret hygiene audit: PASS");
