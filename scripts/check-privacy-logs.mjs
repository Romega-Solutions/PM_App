#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIRS = ["app", "src", "supabase/functions"];
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const SKIP_DIRS = new Set([
  ".expo",
  ".git",
  "__mocks__",
  "__tests__",
  "coverage",
  "dist",
  "node_modules",
]);
const SKIP_FILE_PATTERNS = [/\.(test|spec)\.[jt]sx?$/i];

const findings = [];
const USER_FACING_ERROR_CONTRACTS = [
  {
    file: "src/features/safety/api/safetyApi.ts",
    requiredMarkers: ["return fallback;"],
    forbiddenMarkers: ["return message;"],
  },
  {
    file: "src/features/account/api/privacySettingsApi.ts",
    requiredMarkers: [
      "Privacy settings were not saved. Check your connection and try again.",
    ],
    forbiddenMarkers: ["return message;"],
  },
  {
    file: "src/services/ocrService.ts",
    requiredMarkers: ["function getFriendlyOcrError(status: number): string"],
    forbiddenMarkers: [
      "parseErrorMessage(",
      "OCR service failed with status",
      "throw new Error(message",
    ],
  },
];

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;

  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;

    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (SOURCE_EXTENSIONS.has(path.extname(entry))) {
      if (SKIP_FILE_PATTERNS.some((pattern) => pattern.test(entry))) {
        continue;
      }

      files.push(fullPath);
    }
  }

  return files;
}

function getLineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function getCallExpression(text, startIndex) {
  const openIndex = text.indexOf("(", startIndex);
  if (openIndex === -1) return null;

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = openIndex; i < text.length; i += 1) {
    const char = text[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(") depth += 1;
    if (char === ")") {
      depth -= 1;
      if (depth === 0) {
        return text.slice(openIndex + 1, i);
      }
    }
  }

  return null;
}

function hasTopLevelComma(args) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = 0; i < args.length; i += 1) {
    const char = args[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(" || char === "[" || char === "{") depth += 1;
    if (char === ")" || char === "]" || char === "}") depth -= 1;
    if (char === "," && depth === 0) return true;
  }

  return false;
}

function addFinding(file, line, rule, message) {
  findings.push({
    file: path.relative(ROOT, file).replaceAll("\\", "/"),
    line,
    rule,
    message,
  });
}

for (const sourceDir of SOURCE_DIRS) {
  const absoluteSourceDir = path.join(ROOT, sourceDir);

  for (const file of walk(absoluteSourceDir)) {
    const text = readFileSync(file, "utf8");

    for (const match of text.matchAll(/\bconsole\.(log|debug|info)\s*\(/g)) {
      addFinding(
        file,
        getLineNumber(text, match.index),
        "no-success-console",
        "Do not ship console.log/debug/info in app runtime code.",
      );
    }

    for (const match of text.matchAll(/\bconsole\.(error|warn)\s*\(/g)) {
      const args = getCallExpression(text, match.index);
      if (args && hasTopLevelComma(args)) {
        addFinding(
          file,
          getLineNumber(text, match.index),
          "no-raw-console-payload",
          "Do not pass raw error/data objects into console.error/warn.",
        );
      }
    }
  }
}

for (const contract of USER_FACING_ERROR_CONTRACTS) {
  const file = path.join(ROOT, contract.file);

  if (!existsSync(file)) {
    findings.push({
      file: contract.file,
      line: 1,
      rule: "missing-error-contract-file",
      message: "Expected user-facing error contract file is missing.",
    });
    continue;
  }

  const text = readFileSync(file, "utf8");

  for (const marker of contract.requiredMarkers) {
    if (!text.includes(marker)) {
      findings.push({
        file: contract.file,
        line: 1,
        rule: "missing-safe-user-error-marker",
        message: `Missing safe user-facing error marker: ${marker}`,
      });
    }
  }

  for (const marker of contract.forbiddenMarkers) {
    const index = text.indexOf(marker);
    if (index !== -1) {
      findings.push({
        file: contract.file,
        line: getLineNumber(text, index),
        rule: "no-raw-user-facing-error",
        message: `Do not surface raw backend/provider error text to users: ${marker}`,
      });
    }
  }
}

if (findings.length > 0) {
  console.error("Privacy log audit: FAIL");
  for (const finding of findings) {
    console.error(
      `${finding.file}:${finding.line} [${finding.rule}] ${finding.message}`,
    );
  }
  process.exit(1);
}

console.log("Privacy log audit: PASS");
