// Fills ${VAR} placeholders in a Lightsail JSON template from process.env and prints the result.
// Fails on any unset variable so a deployment never ships an empty secret.
import console from "node:console";
import { readFileSync } from "node:fs";
import process from "node:process";

const [templatePath] = process.argv.slice(2);
if (!templatePath) {
  console.error("Usage: node renderTemplate.mjs <template.json>");
  process.exit(1);
}

const missing = new Set();
const rendered = readFileSync(templatePath, "utf8").replace(/\$\{([A-Z0-9_]+)\}/g, (_match, name) => {
  const value = process.env[name];
  if (value === undefined || value === "") {
    missing.add(name);
    return "";
  }
  // Escape for a JSON string literal (the placeholder already sits inside quotes).
  return JSON.stringify(value).slice(1, -1);
});

if (missing.size > 0) {
  console.error(`Missing environment variables: ${[...missing].join(", ")}`);
  process.exit(1);
}

JSON.parse(rendered);
process.stdout.write(rendered);
