import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const envExamplePath = join(rootDir, ".env.example");
const failures = [];

if (!existsSync(envExamplePath)) {
  failures.push(".env.example is missing");
} else {
  const content = readFileSync(envExamplePath, "utf8");

  const requiredMarkers = [
    "EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key",
    "EXPO_PUBLIC_OCR_ENDPOINT=",
    "Authorization: Bearer <Supabase access token>",
  ];

  for (const marker of requiredMarkers) {
    if (!content.includes(marker)) {
      failures.push(`.env.example missing marker: ${marker}`);
    }
  }

  const forbiddenSecretLikeValues = [
    /EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ/i,
    /OCR_SPACE_API_KEY=/i,
    /SUPABASE_SERVICE_ROLE/i,
    /DATABASE_URL=/i,
  ];

  for (const pattern of forbiddenSecretLikeValues) {
    if (pattern.test(content)) {
      failures.push(
        ".env.example must not contain real anon JWTs, OCR provider keys, service-role keys, or database URLs",
      );
      break;
    }
  }
}

if (failures.length > 0) {
  console.error("FAIL env template contract");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log("PASS env template contract");
console.log("Checked public Supabase/OCR env template markers and secret-like value exclusions.");
