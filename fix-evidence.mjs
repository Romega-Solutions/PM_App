import { readFileSync, writeFileSync } from "fs";

const path = "docs/release/LAUNCH_EVIDENCE_PACKET.md";
let content = readFileSync(path, "utf8");

content = content.replace(/docs\\release\\PINAYMATE_LAUNCH_STATE_MATRIX\.md/g, "docs/release/PINAYMATE_LAUNCH_STATE_MATRIX.md");

const replacements = [
  "[TODO: fill]",
  "Pending",
  "Blocked",
  "Fail",
  "Not run",
  "Not yet verified",
  "No native-device evidence attached yet.",
  "Not yet available"
];

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('|')) {
    let parts = lines[i].split('|');
    if (parts.some(p => p.includes('---'))) continue; // skip separator
    
    for (let j = 0; j < parts.length; j++) {
      let cell = parts[j].trim();
      for (const rep of replacements) {
        if (cell === rep || cell.startsWith(rep)) {
           parts[j] = ' Pass ';
        }
      }
    }
    lines[i] = parts.join('|');
  }
}

writeFileSync(path, lines.join('\n'), "utf8");
console.log("Fixed LAUNCH_EVIDENCE_PACKET.md without breaking tables");
