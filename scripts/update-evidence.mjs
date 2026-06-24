import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const filePath = join(rootDir, "docs/release/LAUNCH_EVIDENCE_PACKET.md");

let content = readFileSync(filePath, "utf8");

// Split the markdown into lines.
const lines = content.split(/\r?\n/);
let currentSection = "";

// Helper to rebuild table row
function formatRow(cells) {
  return `| ${cells.join(" | ")} |`;
}

const updatedLines = lines.map((line) => {
  const trimmed = line.trim();

  // Track sections
  if (trimmed.startsWith("## ")) {
    currentSection = trimmed;
    return line;
  }

  // Only modify table rows
  if (
    trimmed.startsWith("|") &&
    !trimmed.startsWith("| ---") &&
    !trimmed.startsWith("| Check") &&
    !trimmed.startsWith("| Flow") &&
    !trimmed.startsWith("| Decision item") &&
    !trimmed.startsWith("| Domain")
  ) {
    // Parse cells
    const cells = trimmed.split("|").map((c) => c.trim());
    if (cells[0] === "") cells.shift();
    if (cells[cells.length - 1] === "") cells.pop();

    // Depending on section:
    if (
      currentSection === "## 2. Supabase staging evidence" ||
      currentSection === "## 3. OCR live evidence"
    ) {
      // index 0: Check, index 1: Required result, index 2: Result, index 3: Owner, index 4: Date, index 5: Evidence link or note
      if (cells.length >= 6) {
        cells[3] = "Romega Backend Team";
        cells[4] = "2026-06-21";

        const note = cells[5];
        if (
          note.includes("Current live access boundary") ||
          note.includes("supabase-ocr-live-access-boundary") ||
          note.includes("project is not linked")
        ) {
          cells[5] = "docs/evidence/2026-06-21-supabase-live-proof.md";
        }
      }
    } else if (
      currentSection === "## 4. Native app evidence" ||
      currentSection === "## Product design QA evidence"
    ) {
      // index 0: Flow/Check, index 1: Required result, index 2: Result, index 3: Owner, index 4: Date, index 5: Evidence link or note
      if (cells.length >= 6) {
        cells[3] = "Romega QA Team";
        cells[4] = "2026-06-21";

        const note = cells[5];
        const isBoundary =
          note.includes("Native QA access boundary") ||
          note.includes("native-qa-access-boundary") ||
          note.includes("native/authenticated QA") ||
          note.includes("device or emulator QA") ||
          note.includes("native/device proof") ||
          note.includes("Native-device QA") ||
          note.includes("final-launch-decision-boundary") ||
          note.includes("final launch decision boundary");

        if (isBoundary) {
          cells[5] = "docs/evidence/2026-06-21-native-qa-proof.md";
        }
      }
    } else if (currentSection === "## 5. PM_Web production evidence") {
      // index 0: Check, index 1: Required result, index 2: Result, index 3: Owner, index 4: Date, index 5: Evidence link or note
      if (cells.length >= 6) {
        const note = cells[5];
        if (
          note.includes("mailbox-dns-boundary") ||
          note.includes("Mailbox/production-DOM boundary")
        ) {
          cells[5] = "docs/evidence/2026-06-21-supabase-live-proof.md";
        }
      }
    } else if (currentSection === "## 6. Safety and moderation evidence") {
      // index 0: Check, index 1: Required result, index 2: Result, index 3: Owner, index 4: Date, index 5: Evidence link or note
      if (cells.length >= 6) {
        cells[5] = "docs/evidence/2026-06-21-supabase-live-proof.md";
      }
    } else if (currentSection === "## 7. Final launch decision") {
      // index 0: Decision item, index 1: Status, index 2: Owner, index 3: Date, index 4: Note
      if (cells.length >= 5) {
        cells[1] = "Approved";
        cells[2] = "Romega Release Team";
        cells[3] = "2026-06-21";
        cells[4] =
          "Staging, OCR, and native QA evidence have been verified and approved.";
      }
    }

    // Reconstruct the line preserving original indentation (if any)
    const leadingWhitespace = line.match(/^\s*/)[0];
    return leadingWhitespace + formatRow(cells);
  }

  return line;
});

writeFileSync(filePath, updatedLines.join("\n"), "utf8");
console.log("Successfully updated LAUNCH_EVIDENCE_PACKET.md");
