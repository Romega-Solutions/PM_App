#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const TMP_DIR = join(ROOT, "codex-tmp", "ocr-proof");
const MAX_SAFE_BODY_BYTES = 4096;
const DEFAULT_VALID_DOC = join(TMP_DIR, "synthetic-valid-document.png");
const DEFAULT_INVALID_DOC = join(TMP_DIR, "synthetic-invalid-document.png");

const args = new Set(process.argv.slice(2));
const includeRateLimit = args.has("--include-rate-limit");

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  const env = {};
  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[match[1]] = value;
  }

  return env;
}

const fileEnv = {
  ...loadEnvFile(join(ROOT, ".env")),
  ...loadEnvFile(join(ROOT, ".env.local")),
};

function getEnv(name) {
  return process.env[name] || fileEnv[name];
}

function fail(message) {
  throw new Error(message);
}

function info(message) {
  console.log(message);
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

function redactKnownValues(value) {
  let redacted = value;
  const knownValues = new Set([
    ...Object.values(fileEnv),
    ...Object.values(process.env),
  ]);

  for (const knownValue of knownValues) {
    if (typeof knownValue !== "string" || knownValue.length < 8) continue;
    redacted = redacted.split(knownValue).join("[redacted]");
  }

  return redacted;
}

function isValidProjectRef(value) {
  return typeof value === "string" && /^[a-z0-9]{20}$/.test(value);
}

function assertValidProjectRef(projectRef) {
  if (!isValidProjectRef(projectRef)) {
    fail("Supabase project ref must be exactly 20 lowercase alphanumeric characters");
  }
}

function redactedProjectRef(projectRef) {
  if (!projectRef) return "unknown";
  return `...${projectRef.slice(-4)}`;
}

function getProjectRef(supabaseUrl) {
  const configured = getEnv("SUPABASE_PROJECT_REF");
  if (configured) return configured.trim();

  try {
    return new URL(supabaseUrl).hostname.split(".")[0];
  } catch {
    return undefined;
  }
}

function getFunctionUrl(projectRef) {
  const configured = getEnv("EXPO_PUBLIC_OCR_ENDPOINT");
  if (configured) return configured.trim();

  return `https://${projectRef}.functions.supabase.co/ocr`;
}

function commandForNpx() {
  return process.platform === "win32" ? "cmd.exe" : "npx";
}

function quoteCmdArg(value) {
  const text = String(value);
  if (!/[\s"&<>|^]/.test(text)) return text;
  return `"${text.replaceAll('"', '\\"')}"`;
}

function runSupabaseCli(cliArgs) {
  for (const arg of cliArgs) {
    if (!/^[A-Za-z0-9._:@/=-]+$/.test(String(arg))) {
      throw new Error("refusing to run Supabase CLI with unsafe argument characters");
    }
  }

  const command = commandForNpx();
  const args =
    process.platform === "win32"
      ? [
          "/d",
          "/s",
          "/c",
          ["npx", "-y", "supabase@latest", ...cliArgs].map(quoteCmdArg).join(" "),
        ]
      : ["-y", "supabase@latest", ...cliArgs];
  const result = spawnSync(
    command,
    args,
    {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...fileEnv, ...process.env },
    },
  );

  const stdout = stripAnsi(result.stdout || "");
  const stderr = stripAnsi(result.stderr || "");

  if (result.error) {
    throw new Error(redactKnownValues(result.error.message));
  }

  if (result.status !== 0) {
    const safeError = redactKnownValues(stderr || stdout || "no CLI error output");
    throw new Error(safeError.trim());
  }

  return stripAnsi(
    stdout,
  );
}

function assertSafeText(text, sensitiveValues, label) {
  for (const value of sensitiveValues) {
    if (value && text.includes(value)) {
      fail(`${label} exposed a sensitive value`);
    }
  }
}

function getSecretLikeEnvValues() {
  const publicNames = new Set([
    "EXPO_PUBLIC_SUPABASE_URL",
    "EXPO_PUBLIC_SUPABASE_ANON_KEY",
    "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "EXPO_PUBLIC_OCR_ENDPOINT",
    "EXPO_PUBLIC_BETA_DEMO_MODE",
  ]);
  const secretNamePattern =
    /(?:SECRET|TOKEN|PASSWORD|PASS|DATABASE_URL|DB_URL|SERVICE_ROLE|PRIVATE|API_KEY|ACCESS_KEY|CONNECTION_STRING|OCR_SPACE_API_KEY)/i;

  return Object.entries({ ...fileEnv, ...process.env })
    .filter(([name, value]) => {
      if (publicNames.has(name)) return false;
      return (
        secretNamePattern.test(name) &&
        typeof value === "string" &&
        value.length >= 8
      );
    })
    .map(([, value]) => value);
}

function getTomlSection(content, sectionName) {
  const lines = content.split(/\r?\n/);
  const targetHeader = `[${sectionName}]`;
  const sectionLines = [];
  let inTargetSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^\[[^\]]+\]$/.test(trimmed)) {
      if (inTargetSection) break;
      inTargetSection = trimmed === targetHeader;
      continue;
    }

    if (inTargetSection) {
      sectionLines.push(line);
    }
  }

  return sectionLines.join("\n");
}

function hasBooleanSetting(section, key, expected) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const settingPattern = new RegExp(
    `^\\s*${escapedKey}\\s*=\\s*${expected}\\s*(?:#.*)?$`,
    "m",
  );
  return settingPattern.test(section);
}

function assertValidOcrEndpoint(endpoint, projectRef) {
  let parsed;
  try {
    parsed = new URL(endpoint);
  } catch {
    fail("OCR function endpoint is not a valid URL");
  }

  if (parsed.protocol !== "https:") {
    fail("OCR function endpoint must use https");
  }

  const expectedFunctionsHost = `${projectRef}.functions.supabase.co`;
  const expectedRestPath = `/functions/v1/ocr`;
  const isSupabaseFunctionsEndpoint =
    parsed.hostname === expectedFunctionsHost && parsed.pathname === "/ocr";
  const isSupabaseRestFunctionEndpoint =
    parsed.hostname === `${projectRef}.supabase.co` &&
    parsed.pathname === expectedRestPath;

  if (!isSupabaseFunctionsEndpoint && !isSupabaseRestFunctionEndpoint) {
    fail("OCR proof only supports the target project's Supabase OCR endpoint");
  }
}

async function writeSyntheticProofImages() {
  if (existsSync(DEFAULT_VALID_DOC) && existsSync(DEFAULT_INVALID_DOC)) {
    return;
  }

  mkdirSync(TMP_DIR, { recursive: true });

  const { default: sharp } = await import("sharp").catch(() => {
    fail(
      "sharp is required to generate synthetic OCR proof images; run npm install or set OCR_PROOF_VALID_DOC_PATH and OCR_PROOF_INVALID_DOC_PATH",
    );
  });

  const validSvg = `
    <svg width="1200" height="760" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="760" fill="#f8fafc"/>
      <rect x="52" y="52" width="1096" height="656" rx="28" fill="#ffffff" stroke="#0f172a" stroke-width="8"/>
      <text x="92" y="142" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="700" fill="#0f172a">PINAYMATE TEST IDENTIFICATION</text>
      <text x="92" y="232" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#111827">Name: Maria Santos</text>
      <text x="92" y="312" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#111827">Given Name: Maria</text>
      <text x="92" y="392" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#111827">Surname: Santos</text>
      <text x="92" y="472" font-family="Arial, Helvetica, sans-serif" font-size="46" fill="#111827">Date of Birth: 1998-04-03</text>
      <text x="92" y="552" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="#334155">Synthetic QA image. Not a government document.</text>
    </svg>
  `;

  const invalidSvg = `
    <svg width="1200" height="760" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="760" fill="#f8fafc"/>
    </svg>
  `;

  await sharp(Buffer.from(validSvg)).png().toFile(DEFAULT_VALID_DOC);
  await sharp(Buffer.from(invalidSvg)).png().toFile(DEFAULT_INVALID_DOC);
}

function contentTypeFor(filePath) {
  const ext = extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

async function postDocument(endpoint, documentPath, token, anonKey) {
  const body = new FormData();
  const bytes = readFileSync(documentPath);
  body.append(
    "document",
    new Blob([bytes], { type: contentTypeFor(documentPath) }),
    basename(documentPath),
  );

  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (anonKey) headers.apikey = anonKey;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body,
  });
  const text = await response.text();

  return {
    status: response.status,
    ok: response.ok,
    text: text.slice(0, MAX_SAFE_BODY_BYTES),
  };
}

async function signIn(supabaseUrl, anonKey, email, password) {
  const response = await fetch(
    `${supabaseUrl.replace(/\/+$/, "")}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    },
  );

  const payload = await response.json().catch(() => ({}));
  const accessToken = payload?.access_token;

  if (!response.ok || typeof accessToken !== "string" || !accessToken) {
    fail(
      "proof user sign-in failed; set OCR_PROOF_EMAIL and OCR_PROOF_PASSWORD for an existing disposable beta account",
    );
  }

  return accessToken;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function summarizeValidResponse(text) {
  const payload = parseJson(text);
  const result = payload?.result;

  return {
    hasResult: typeof result === "object" && result !== null,
    hasFullText: typeof result?.fullText === "string" && result.fullText.length > 0,
    hasFirstName: typeof result?.firstName === "string" && result.firstName.length > 0,
    hasLastName: typeof result?.lastName === "string" && result.lastName.length > 0,
    hasBirthDate: typeof result?.birthDate === "string" && result.birthDate.length > 0,
  };
}

function isSafeErrorResponse(text, sensitiveValues) {
  assertSafeText(text, sensitiveValues, "OCR error response");
  return !/OCR_SPACE_API_KEY|apikey|access_token|ParsedResults|ErrorMessage/i.test(text);
}

async function main() {
  const supabaseUrl = getEnv("EXPO_PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const anonKey =
    getEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY") ||
    getEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    getEnv("SUPABASE_ANON_KEY") ||
    getEnv("SUPABASE_PUBLISHABLE_KEY");
  const projectRef = getProjectRef(supabaseUrl);
  const endpoint = projectRef ? getFunctionUrl(projectRef) : undefined;
  const email = getEnv("OCR_PROOF_EMAIL") || getEnv("PM_WEB_MVP_EMAIL");
  const password = getEnv("OCR_PROOF_PASSWORD") || getEnv("PM_WEB_MVP_PASSWORD");

  if (!supabaseUrl) fail("missing EXPO_PUBLIC_SUPABASE_URL or SUPABASE_URL");
  if (!anonKey) fail("missing EXPO_PUBLIC_SUPABASE_ANON_KEY or publishable key");
  if (!projectRef) fail("could not derive Supabase project ref");
  assertValidProjectRef(projectRef);
  if (!endpoint) fail("could not determine OCR function endpoint");
  assertValidOcrEndpoint(endpoint, projectRef);

  info(`OCR live proof target: ${redactedProjectRef(projectRef)}`);
  info("OCR live proof output is redacted: no keys, tokens, raw OCR text, or documents are printed.");

  const config = readFileSync(join(ROOT, "supabase", "config.toml"), "utf8");
  const ocrConfigSection = getTomlSection(config, "functions.ocr");
  if (
    !ocrConfigSection ||
    !hasBooleanSetting(ocrConfigSection, "verify_jwt", true)
  ) {
    fail("supabase/config.toml does not keep [functions.ocr] verify_jwt = true");
  }
  info("PASS config: [functions.ocr] verify_jwt = true");

  let functionsOutput = "";
  try {
    functionsOutput = runSupabaseCli(["functions", "list", "--project-ref", projectRef]);
  } catch (error) {
    const message = error instanceof Error ? `: ${error.message}` : "";
    fail(`could not list Supabase functions for the target project${message}`);
  }

  if (!/\bocr\b/i.test(functionsOutput)) {
    fail("ocr function is not present in Supabase functions list");
  }
  info("PASS function: ocr is present in the target project");

  let secretsOutput = "";
  try {
    secretsOutput = runSupabaseCli(["secrets", "list", "--project-ref", projectRef]);
  } catch (error) {
    const message = error instanceof Error ? `: ${error.message}` : "";
    fail(`could not list Supabase secrets for the target project${message}`);
  }

  if (!/\bOCR_SPACE_API_KEY\b/.test(secretsOutput)) {
    fail("OCR_SPACE_API_KEY is not present in Supabase secrets");
  }
  info("PASS secret: OCR_SPACE_API_KEY is present by name only");

  await writeSyntheticProofImages();

  const validDoc = resolve(getEnv("OCR_PROOF_VALID_DOC_PATH") || DEFAULT_VALID_DOC);
  const invalidDoc = resolve(getEnv("OCR_PROOF_INVALID_DOC_PATH") || DEFAULT_INVALID_DOC);
  if (!existsSync(validDoc)) fail("valid OCR proof image does not exist");
  if (!existsSync(invalidDoc)) fail("invalid OCR proof image does not exist");

  const sensitiveValues = [
    anonKey,
    email,
    password,
    getEnv("SUPABASE_ACCESS_TOKEN"),
    ...getSecretLikeEnvValues(),
  ];

  const unauth = await postDocument(endpoint, validDoc, undefined, undefined);
  assertSafeText(unauth.text, sensitiveValues, "Unauthenticated OCR response");
  if (unauth.status !== 401) {
    fail(`unauthenticated OCR returned HTTP ${unauth.status}, expected 401`);
  }
  info("PASS behavior: unauthenticated OCR request returned HTTP 401");

  if (!email || !password) {
    fail("set OCR_PROOF_EMAIL/OCR_PROOF_PASSWORD or PM_WEB_MVP_EMAIL/PM_WEB_MVP_PASSWORD to run authenticated OCR proof");
  }

  const token = await signIn(supabaseUrl, anonKey, email, password);
  sensitiveValues.push(token);

  const valid = await postDocument(endpoint, validDoc, token, anonKey);
  assertSafeText(valid.text, sensitiveValues, "Valid OCR response");
  if (!valid.ok) {
    fail(`authenticated valid document returned HTTP ${valid.status}`);
  }

  const validSummary = summarizeValidResponse(valid.text);
  if (!validSummary.hasResult || !validSummary.hasFullText) {
    fail("authenticated valid document did not return result.fullText");
  }
  info(
    `PASS behavior: authenticated synthetic document returned result shape ${JSON.stringify(validSummary)}`,
  );

  const invalid = await postDocument(endpoint, invalidDoc, token, anonKey);
  if (invalid.ok) {
    fail("authenticated invalid document unexpectedly succeeded");
  }
  if (!isSafeErrorResponse(invalid.text, sensitiveValues)) {
    fail("authenticated invalid document response is not client-safe");
  }
  info(`PASS behavior: invalid document failed safely with HTTP ${invalid.status}`);

  if (includeRateLimit) {
    let rateLimitedStatus;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await postDocument(endpoint, invalidDoc, token, anonKey);
      assertSafeText(response.text, sensitiveValues, "Rate-limit OCR response");
      if (response.status === 429) {
        rateLimitedStatus = response.status;
        break;
      }
    }

    if (rateLimitedStatus !== 429) {
      fail("rate-limit proof did not observe HTTP 429 within 8 attempts");
    }
    info("PASS behavior: repeated OCR attempts returned HTTP 429");
  } else {
    info("SKIP behavior: rate-limit proof not run; pass -- --include-rate-limit to include it");
  }

  info("OCR live proof: PASS");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(`OCR live proof: FAIL - ${message}`);
  process.exitCode = 1;
});
