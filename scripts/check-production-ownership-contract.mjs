import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const expected = {
  appName: "Pinaymate",
  slug: "Pinaymate",
  scheme: "pinaymate",
  iosBundleIdentifier: "com.romegasolutions.Pinaymate",
  androidPackage: "com.romegasolutions.Pinaymate",
};

const personalOrUnverifiedOwners = new Set(["canthought"]);

function readJson(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`${relativePath} is missing`);
  }

  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

const failures = [];

let appConfig;
let easConfig;

try {
  appConfig = readJson("app.json");
} catch (error) {
  failures.push(error instanceof Error ? error.message : "app.json is invalid");
}

try {
  easConfig = readJson("eas.json");
} catch (error) {
  failures.push(error instanceof Error ? error.message : "eas.json is invalid");
}

if (appConfig?.expo) {
  const expo = appConfig.expo;

  if (expo.name !== expected.appName) {
    failures.push(`expo.name must be ${expected.appName}`);
  }

  if (expo.slug !== expected.slug) {
    failures.push(`expo.slug must be ${expected.slug}`);
  }

  if (expo.scheme !== expected.scheme) {
    failures.push(`expo.scheme must be ${expected.scheme}`);
  }

  if (expo.ios?.bundleIdentifier !== expected.iosBundleIdentifier) {
    failures.push(
      `ios.bundleIdentifier must be ${expected.iosBundleIdentifier}`,
    );
  }

  if (expo.android?.package !== expected.androidPackage) {
    failures.push(`android.package must be ${expected.androidPackage}`);
  }

  if (!expo.extra?.eas?.projectId) {
    failures.push("expo.extra.eas.projectId is required for EAS ownership proof");
  }

  if (!expo.owner) {
    failures.push("expo.owner is required and must be Romega-controlled");
  } else if (personalOrUnverifiedOwners.has(expo.owner)) {
    failures.push(
      `expo.owner is ${expo.owner}; attach proof this is Romega-controlled or transfer to a Romega-owned account/team`,
    );
  }
}

if (easConfig) {
  if (!easConfig.cli?.version) {
    failures.push("eas.json cli.version is required");
  }

  if (!easConfig.build?.production) {
    failures.push("eas.json build.production profile is required");
  }

  if (!easConfig.submit?.production) {
    failures.push("eas.json submit.production profile is required");
  }
}

if (failures.length > 0) {
  console.error("FAIL production ownership contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS production ownership contract");
console.log("Checked app identifiers, EAS project metadata, and production profiles.");
