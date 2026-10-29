const fs = require("node:fs");
const path = require("node:path");

const indexPath = path.join(__dirname, "..", "dist", "index.html");
const jsDir = path.join(__dirname, "..", "dist", "_expo", "static", "js", "web");
const localEnvPath = path.join(__dirname, "..", ".env.local");
const publicEnvKeys = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
  "EXPO_PUBLIC_BETA_DEMO_MODE",
  "EXPO_PUBLIC_OCR_ENDPOINT",
];

function parseEnvValue(rawValue) {
  const value = rawValue.trim();
  const quote = value[0];

  if ((quote === "\"" || quote === "'") && value.endsWith(quote)) {
    return value.slice(1, -1);
  }

  const commentIndex = value.indexOf(" #");
  return commentIndex === -1 ? value : value.slice(0, commentIndex).trim();
}

function loadLocalPublicEnv() {
  if (!fs.existsSync(localEnvPath)) return {};

  const entries = {};
  const envFile = fs.readFileSync(localEnvPath, "utf8");

  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = /^(?:export\s+)?([^=\s]+)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (!publicEnvKeys.includes(key)) continue;

    entries[key] = parseEnvValue(rawValue);
  }

  return entries;
}

const localPublicEnv = loadLocalPublicEnv();

for (const filename of fs.readdirSync(jsDir)) {
  if (!filename.endsWith(".js")) continue;

  const bundlePath = path.join(jsDir, filename);
  let js = fs.readFileSync(bundlePath, "utf8");

  js = js.replaceAll("import.meta.env?import.meta.env.MODE:void 0", '"production"');

  if (js.includes("import.meta")) {
    throw new Error(`Unsupported import.meta reference remains in ${filename}`);
  }

  fs.writeFileSync(bundlePath, js);
}

let html = fs.readFileSync(indexPath, "utf8");
if (!html.includes('defer></script>')) {
  throw new Error("Expected Expo web bundle script tag was not found");
}

const publicEnv = Object.fromEntries(
  publicEnvKeys
    .map((key) => [key, process.env[key] || localPublicEnv[key]])
    .filter(([, value]) => typeof value === "string" && value.length > 0),
);

for (const key of [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_ANON_KEY",
]) {
  if (!publicEnv[key]) {
    throw new Error(`${key} is required for web export`);
  }
}

const runtimeEnvScript = [
  "<script>",
  "globalThis.process=globalThis.process||{};",
  `globalThis.process.env=Object.assign({},globalThis.process.env||{},${JSON.stringify(publicEnv)});`,
  "</script>",
].join("");

if (!html.includes("globalThis.process.env=Object.assign")) {
  html = html.replace("</head>", `${runtimeEnvScript}</head>`);
  fs.writeFileSync(indexPath, html);
}
