import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const launchEvidencePath = "docs/release/LAUNCH_EVIDENCE_PACKET.md";
const launchEvidence = readFile(launchEvidencePath);

const requiredLaunchEvidenceMarkers = [
  {
    label: "launch-state matrix source of truth",
    marker: "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md",
  },
  {
    label: "trimmed evidence retention index",
    marker: "docs/evidence/README.md",
  },
  {
    label: "PM_Web email helper currency gate",
    marker: "PM_Web email helper patch currency",
  },
  {
    label: "retained PM_App local quality evidence",
    marker:
      "docs/evidence/2026-06-11-current-local-quality-release-blockers.md",
  },
  {
    label: "retained PM_App release blocker evidence",
    marker:
      "docs/evidence/2026-06-11-release-blockers-only.md",
  },
  {
    label: "retained backend static contract evidence",
    marker:
      "docs/evidence/backend-2026-06-11-supabase-static-contract.md",
  },
  {
    label: "retained PM_Web evidence index",
    marker: "../PM_Web/docs/evidence/README.md",
  },
  {
    label: "current evidence staleness warning",
    marker:
      "any `Pass` in this packet that predates a source or script change should be treated as historical",
  },
  {
    label: "Supabase live proof template",
    marker: "docs/evidence/TEMPLATE-supabase-live-proof.md",
  },
  {
    label: "native QA proof template",
    marker: "docs/evidence/TEMPLATE-native-qa-proof.md",
  },
];

const evidenceSections = [
  "## 2. Supabase staging evidence",
  "## 3. OCR live evidence",
  "## 4. Native app evidence",
  "## Product design QA evidence",
  "## 5. PM_Web production evidence",
  "## 6. Safety and moderation evidence",
];

const finalDecisionSection = "## 7. Final launch decision";
const allowedPassingResults = new Set(["pass", "deferred with risk acceptance"]);
const allowedFinalStatuses = new Set([
  "approved",
  "pass",
  "deferred with risk acceptance",
]);
const placeholderPatterns = [
  /^$/,
  /^-+$/,
  /\btodo\b/i,
  /\btbd\b/i,
  /\bn\/a\b/i,
  /\bpending\b/i,
  /\bblocked\b/i,
  /\bfail(?:ed)?\b/i,
  /not run/i,
  /not verified/i,
];

const failures = [];

function readFile(relativePath) {
  const absolutePath = join(rootDir, relativePath);

  if (!existsSync(absolutePath)) {
    return null;
  }

  return readFileSync(absolutePath, "utf8");
}

function getSection(content, heading) {
  if (!content) return null;

  const start = content.indexOf(heading);
  if (start === -1) return null;

  const nextSection = content.indexOf("\n## ", start + heading.length);
  return content.slice(start, nextSection === -1 ? content.length : nextSection);
}

function parseTableRow(line) {
  const parts = line.split("|").map((part) => part.trim());
  if (parts[0] === "") parts.shift();
  if (parts[parts.length - 1] === "") parts.pop();
  return parts;
}

function isSeparatorRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function extractFirstTable(section) {
  const rows = section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"))
    .map(parseTableRow);

  if (rows.length < 2) {
    return null;
  }

  const [header, separator, ...body] = rows;

  if (!isSeparatorRow(separator)) {
    return null;
  }

  return {
    header,
    body,
  };
}

function findColumn(header, expectedName) {
  const normalizedExpected = expectedName.toLowerCase();
  return header.findIndex((cell) => cell.toLowerCase() === normalizedExpected);
}

function isPlaceholder(value) {
  const normalized = String(value ?? "").trim();
  return placeholderPatterns.some((pattern) => pattern.test(normalized));
}

function validateEvidenceSection(heading) {
  const section = getSection(launchEvidence, heading);

  if (!section) {
    failures.push(`${heading}: section is missing`);
    return;
  }

  const table = extractFirstTable(section);

  if (!table) {
    failures.push(`${heading}: required evidence table is missing or malformed`);
    return;
  }

  const resultIndex = findColumn(table.header, "Result");
  const ownerIndex = findColumn(table.header, "Owner");
  const dateIndex = findColumn(table.header, "Date");
  const evidenceIndex = table.header.findIndex((cell) =>
    cell.toLowerCase().includes("evidence"),
  );

  if (resultIndex === -1) {
    failures.push(`${heading}: table must include a Result column`);
  }

  if (ownerIndex === -1) {
    failures.push(`${heading}: table must include an Owner column`);
  }

  if (dateIndex === -1) {
    failures.push(`${heading}: table must include a Date column`);
  }

  if (evidenceIndex === -1) {
    failures.push(`${heading}: table must include an Evidence column`);
  }

  if ([resultIndex, ownerIndex, dateIndex, evidenceIndex].some((index) => index === -1)) {
    return;
  }

  table.body.forEach((row, index) => {
    const label = row[0] || `row ${index + 1}`;
    const result = row[resultIndex] || "";
    const owner = row[ownerIndex] || "";
    const date = row[dateIndex] || "";
    const evidence = row[evidenceIndex] || "";
    const normalizedResult = result.trim().toLowerCase();

    if (!allowedPassingResults.has(normalizedResult)) {
      failures.push(
        `${heading}: "${label}" result must be Pass or Deferred with risk acceptance`,
      );
    }

    if (isPlaceholder(owner)) {
      failures.push(`${heading}: "${label}" owner is missing or placeholder-like`);
    }

    if (isPlaceholder(date)) {
      failures.push(`${heading}: "${label}" date is missing or placeholder-like`);
    }

    if (isPlaceholder(evidence)) {
      failures.push(`${heading}: "${label}" evidence is missing or placeholder-like`);
    }
  });
}

function validateFinalDecisionSection() {
  const section = getSection(launchEvidence, finalDecisionSection);

  if (!section) {
    failures.push(`${finalDecisionSection}: section is missing`);
    return;
  }

  const table = extractFirstTable(section);

  if (!table) {
    failures.push(`${finalDecisionSection}: required decision table is missing or malformed`);
    return;
  }

  const statusIndex = findColumn(table.header, "Status");
  const ownerIndex = findColumn(table.header, "Owner");
  const dateIndex = findColumn(table.header, "Date");
  const noteIndex = findColumn(table.header, "Note");

  for (const [columnName, index] of [
    ["Status", statusIndex],
    ["Owner", ownerIndex],
    ["Date", dateIndex],
    ["Note", noteIndex],
  ]) {
    if (index === -1) {
      failures.push(`${finalDecisionSection}: table must include a ${columnName} column`);
    }
  }

  if ([statusIndex, ownerIndex, dateIndex, noteIndex].some((index) => index === -1)) {
    return;
  }

  table.body.forEach((row, index) => {
    const label = row[0] || `row ${index + 1}`;
    const status = row[statusIndex] || "";
    const owner = row[ownerIndex] || "";
    const date = row[dateIndex] || "";
    const note = row[noteIndex] || "";
    const normalizedStatus = status.trim().toLowerCase();

    if (!allowedFinalStatuses.has(normalizedStatus)) {
      failures.push(
        `${finalDecisionSection}: "${label}" status must be Approved, Pass, or Deferred with risk acceptance`,
      );
    }

    if (isPlaceholder(owner)) {
      failures.push(`${finalDecisionSection}: "${label}" owner is missing or placeholder-like`);
    }

    if (isPlaceholder(date)) {
      failures.push(`${finalDecisionSection}: "${label}" date is missing or placeholder-like`);
    }

    if (isPlaceholder(note)) {
      failures.push(`${finalDecisionSection}: "${label}" note is missing or placeholder-like`);
    }
  });
}

if (!launchEvidence) {
  failures.push(`Missing required doc: ${launchEvidencePath}`);
} else {
  for (const requiredMarker of requiredLaunchEvidenceMarkers) {
    if (!launchEvidence.includes(requiredMarker.marker)) {
      failures.push(
        `${launchEvidencePath}: missing required launch evidence marker for ${requiredMarker.label}: ${requiredMarker.marker}`,
      );
    }
  }

  evidenceSections.forEach(validateEvidenceSection);
  validateFinalDecisionSection();
}

if (failures.length > 0) {
  console.error("FAIL launch evidence contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS launch evidence contract");
console.log(
  "Checked staging, OCR, native, product-design, web, safety, and final launch decision evidence.",
);
