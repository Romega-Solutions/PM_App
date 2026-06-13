import { spawnSync } from "node:child_process";

const npmCommand = "npm";

const gates = [
  {
    label: "Secret hygiene",
    args: ["run", "check:secret-hygiene"],
  },
  {
    label: "Dependency audit",
    args: ["run", "check:dependency-audit"],
  },
  {
    label: "Production ownership",
    args: ["run", "check:production-ownership-contract"],
  },
  {
    label: "Safety operations",
    args: ["run", "check:safety-operations-contract"],
  },
  {
    label: "Launch evidence",
    args: ["run", "check:launch-evidence-contract"],
  },
  {
    label: "Local quality",
    args: ["run", "check:local-quality"],
  },
];

const failures = [];

console.log("PinayMate local release gate");
console.log("Runs all configured checks and reports every blocker.");

for (const gate of gates) {
  console.log("");
  console.log(`== ${gate.label} ==`);

  const result = spawnSync(npmCommand, gate.args, {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });

  if (result.error) {
    failures.push(`${gate.label}: ${result.error.message}`);
    continue;
  }

  if (result.signal) {
    failures.push(`${gate.label}: terminated by ${result.signal}`);
    continue;
  }

  if (result.status !== 0) {
    failures.push(`${gate.label}: exited with status ${result.status}`);
  }
}

console.log("");

if (failures.length > 0) {
  console.error("FAIL local release gate");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS local release gate");
console.log("All configured release checks completed successfully.");
