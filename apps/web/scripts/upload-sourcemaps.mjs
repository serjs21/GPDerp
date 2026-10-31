#!/usr/bin/env node
// Runs after `opennextjs-cloudflare build`, before deploy/upload.
// 1. With SENTRY_AUTH_TOKEN (+ SENTRY_ORG, SENTRY_PROJECT, SENTRY_URL from Better Stack), injects
//    debug ids and uploads the browser source maps to Better Stack Errors.
// 2. Always deletes every *.map from the deployable assets, so source maps are never served.
// An upload failure is reported but does not stop the deploy; the deletion step always runs.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const WEB_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS_DIR = path.join(WEB_DIR, ".open-next/assets");
const STATIC_DIR = path.join(ASSETS_DIR, "_next/static");
const SENTRY_CLI = path.join(WEB_DIR, "node_modules/.bin/sentry-cli");
const UPLOAD_ENV = ["SENTRY_AUTH_TOKEN", "SENTRY_ORG", "SENTRY_PROJECT", "SENTRY_URL"];

const release = () => {
  if (process.env.NEXT_PUBLIC_APP_RELEASE) return process.env.NEXT_PUBLIC_APP_RELEASE;
  try {
    return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { cwd: WEB_DIR }).toString().trim();
  } catch {
    return "dev";
  }
};

const listMaps = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMaps(full);
    return entry.name.endsWith(".map") ? [full] : [];
  });

if (!fs.existsSync(STATIC_DIR)) {
  console.error(`upload-sourcemaps: ${path.relative(WEB_DIR, STATIC_DIR)} not found; run opennextjs-cloudflare build first`);
  process.exit(1);
}

if (process.env.SENTRY_AUTH_TOKEN) {
  const missing = UPLOAD_ENV.filter((name) => !process.env[name]);
  if (missing.length) {
    console.warn(`upload-sourcemaps: skipping upload, missing ${missing.join(", ")}`);
  } else {
    try {
      execFileSync(SENTRY_CLI, ["sourcemaps", "inject", STATIC_DIR], { stdio: "inherit" });
      execFileSync(SENTRY_CLI, ["sourcemaps", "upload", "--release", release(), STATIC_DIR], { stdio: "inherit" });
      console.log(`upload-sourcemaps: uploaded source maps for release ${release()}`);
    } catch (err) {
      console.warn(`upload-sourcemaps: upload failed (${err instanceof Error ? err.message : err}); deploying without symbolication`);
    }
  }
} else {
  console.log("upload-sourcemaps: SENTRY_AUTH_TOKEN not set, skipping upload");
}

const maps = listMaps(ASSETS_DIR);
for (const file of maps) fs.rmSync(file);
const left = listMaps(ASSETS_DIR).length;
if (left > 0) {
  console.error(`upload-sourcemaps: ${left} source map(s) still present in ${path.relative(WEB_DIR, ASSETS_DIR)}`);
  process.exit(1);
}
console.log(`upload-sourcemaps: removed ${maps.length} source map(s) from deployable assets`);
