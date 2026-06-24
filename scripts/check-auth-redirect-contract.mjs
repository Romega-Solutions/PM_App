import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));

const failures = [];

function readText(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) return null;
  return readFileSync(absolutePath, "utf8");
}

function readJson(relativePath) {
  const text = readText(relativePath);
  if (text === null) return null;
  return JSON.parse(text);
}

const supabaseConfig = readText("src/config/supabase.ts");
const appConfig = readJson("app.json");

if (supabaseConfig === null) {
  failures.push("src/config/supabase.ts is missing");
} else {
  const requiredMarkers = [
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    'Linking.createURL("/(auth)/verification-success")',
    'Linking.createURL("/(auth)/reset-password")',
    "detectSessionInUrl: true",
    'flowType: "pkce"',
    "persistSession: true",
    "getRedirectUrl",
    "getPasswordResetRedirectUrl",
  ];

  for (const marker of requiredMarkers) {
    if (!supabaseConfig.includes(marker)) {
      failures.push(`src/config/supabase.ts missing marker: ${marker}`);
    }
  }
}

if (appConfig === null) {
  failures.push("app.json is missing or invalid");
} else {
  const expo = appConfig.expo;

  if (expo?.scheme !== "pinaymate") {
    failures.push("app.json expo.scheme must be pinaymate");
  }

  if (expo?.ios?.bundleIdentifier !== "com.romegasolutions.Pinaymate") {
    failures.push(
      "app.json ios.bundleIdentifier must be com.romegasolutions.Pinaymate",
    );
  }

  if (expo?.android?.package !== "com.romegasolutions.Pinaymate") {
    failures.push(
      "app.json android.package must be com.romegasolutions.Pinaymate",
    );
  }

  const androidIntentFilters = expo?.android?.intentFilters ?? [];
  const hasSupabaseVerifyIntent = androidIntentFilters.some((filter) =>
    JSON.stringify(filter).includes("/auth/v1/verify"),
  );

  if (!hasSupabaseVerifyIntent) {
    failures.push("app.json android intent filter must include /auth/v1/verify");
  }
}

const requiredRoutes = [
  "app/(auth)/verification-success.tsx",
  "app/(auth)/reset-password.tsx",
];

for (const route of requiredRoutes) {
  if (!existsSync(join(rootDir, route))) {
    failures.push(`${route} is missing`);
  }
}

if (failures.length > 0) {
  console.error("FAIL auth redirect contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS auth redirect contract");
console.log("Checked Supabase env names, Expo scheme, auth redirect helpers, and auth target routes.");
