const fs = require("node:fs");
const path = require("node:path");

const indexPath = path.join(__dirname, "..", "dist", "index.html");
const jsDir = path.join(__dirname, "..", "dist", "_expo", "static", "js", "web");

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

const html = fs.readFileSync(indexPath, "utf8");
if (!html.includes('defer></script>')) {
  throw new Error("Expected Expo web bundle script tag was not found");
}
