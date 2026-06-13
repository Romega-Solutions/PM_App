import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const launchEvidencePath = "docs/LAUNCH_EVIDENCE_PACKET.md";
const launchEvidence = readFile(launchEvidencePath);

const requiredLaunchEvidenceMarkers = [
  {
    label: "launch-state matrix source of truth",
    marker: "docs/PINAYMATE_LAUNCH_STATE_MATRIX.md",
  },
  {
    label: "launch-state matrix evidence note",
    marker: "docs/evidence/2026-06-11-pinaymate-launch-state-matrix.md",
  },
  {
    label: "PM_App signoff/design/safety matrix alignment evidence",
    marker:
      "docs/evidence/2026-06-11-pm-app-launch-state-signoff-alignment.md",
  },
  {
    label: "PM_Web launch-state matrix alignment evidence",
    marker:
      "docs/evidence/2026-06-11-pm-web-launch-state-matrix-alignment.md",
  },
  {
    label: "PM_Web mailto encoding guard evidence",
    marker: "docs/evidence/2026-06-11-pm-web-mailto-encoding-guard.md",
  },
  {
    label: "PM_Web email helper currency gate",
    marker: "PM_Web email helper patch currency",
  },
  {
    label: "PM_App client-facing copy guard hardening evidence",
    marker:
      "docs/evidence/2026-06-11-pm-app-client-facing-copy-guard-hardening.md",
  },
  {
    label: "PM_App account setup client copy polish evidence",
    marker:
      "docs/evidence/2026-06-11-account-setup-client-copy-polish.md",
  },
  {
    label: "PM_App match card native accessibility prop evidence",
    marker:
      "docs/evidence/2026-06-11-match-card-native-accessibility-prop.md",
  },
  {
    label: "PM_App match card accessibility regression guard evidence",
    marker:
      "docs/evidence/2026-06-11-match-card-accessibility-regression-guard.md",
  },
  {
    label: "PM_App root shell first-impression design contract evidence",
    marker:
      "docs/evidence/2026-06-11-root-shell-first-impression-design-contract.md",
  },
  {
    label: "PM_App waitlist Edge JSON content-type boundary evidence",
    marker:
      "docs/evidence/2026-06-11-waitlist-edge-json-content-type-boundary.md",
  },
  {
    label: "PM_App waitlist Edge RPC response value guard evidence",
    marker:
      "docs/evidence/2026-06-11-waitlist-edge-rpc-response-value-guard.md",
  },
  {
    label: "PM_App waitlist Edge single-row RPC response guard evidence",
    marker:
      "docs/evidence/2026-06-11-waitlist-edge-single-row-rpc-response-guard.md",
  },
  {
    label: "PM_App waitlist Edge public response contract doc evidence",
    marker:
      "docs/evidence/2026-06-11-waitlist-edge-public-response-contract-doc.md",
  },
  {
    label: "PM_App pass profile release contract coverage evidence",
    marker:
      "docs/evidence/2026-06-11-pass-profile-release-contract-coverage.md",
  },
  {
    label: "PM_Web editorial layout contract guard evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-pm-web-editorial-layout-contract-guards.md",
  },
  {
    label: "PM_Web client-facing copy guard hardening evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-pm-web-client-facing-copy-guard-hardening.md",
  },
  {
    label: "PM_Web download store link copy polish evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-download-store-link-copy-polish.md",
  },
  {
    label: "PM_Web launch claims contract refresh evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-launch-claims-contract-refresh.md",
  },
  {
    label: "PM_Web source contract command wiring evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-pm-web-source-contract-command-wiring.md",
  },
  {
    label: "PM_Web top-level app copy guard evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-pm-web-top-level-app-copy-guard.md",
  },
  {
    label: "PM_Web client-copy guard contract coverage evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-pm-web-client-copy-guard-contract-coverage.md",
  },
  {
    label: "PM_Web waitlist JSON handoff contract evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-waitlist-json-handoff-contract.md",
  },
  {
    label: "PM_Web waitlist JSON body serialization contract evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-waitlist-json-body-serialization-contract.md",
  },
  {
    label: "PM_Web waitlist JSON response content-type guard evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-waitlist-json-response-content-type-guard.md",
  },
  {
    label: "PM_Web waitlist JSON response shape guard evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-waitlist-json-response-shape-guard.md",
  },
  {
    label: "PM_Web waitlist public response value guard evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-waitlist-public-response-value-guard.md",
  },
  {
    label: "PM_Web waitlist response email match guard evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-waitlist-response-email-match-guard.md",
  },
  {
    label: "PM_Web waitlist single-row response guard evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-waitlist-single-row-response-guard.md",
  },
  {
    label: "PM_Web waitlist web source marker lock evidence",
    marker:
      "../PM_Web/docs/evidence/2026-06-11-waitlist-web-source-marker-lock.md",
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
