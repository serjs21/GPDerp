#!/usr/bin/env node
// Pre-deploy guard for the production web build's Paddle settings (no values printed).
// Effective values follow Next.js production precedence: .env.production.local > .env.local > .env.production > .env.
// - PADDLE_ENV, the client token prefix (test_/live_) and the price (sandbox vs live, per infra/paddle/live-id-map.json)
//   must all belong to the same environment.
// - A live (production) deploy additionally requires PADDLE_LIVE_DEPLOY_APPROVED=yes, so live checkout is never
//   shipped by accident before Paddle verification and website approval are complete.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { fileURLToPath } from "node:url";

const WEB_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ID_MAP = path.resolve(WEB_DIR, "../../infra/paddle/live-id-map.json");
const FILES = [".env.production.local", ".env.local", ".env.production", ".env"];

const parse = (file) => {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (m && !(m[1] in out)) out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return out;
};

const effective = {};
for (const file of FILES) {
  const values = parse(path.join(WEB_DIR, file));
  for (const [k, v] of Object.entries(values)) if (!(k in effective)) effective[k] = v;
}
for (const k of ["PADDLE_ENV", "PADDLE_CLIENT_TOKEN", "PADDLE_PRICE_ID_100_HAIKUS"]) {
  if (process.env[k] !== undefined) effective[k] = process.env[k];
}

const env = effective.PADDLE_ENV || "sandbox";
const token = effective.PADDLE_CLIENT_TOKEN || "";
const price = effective.PADDLE_PRICE_ID_100_HAIKUS || "";
const map = fs.existsSync(ID_MAP) ? JSON.parse(fs.readFileSync(ID_MAP, "utf8")) : { prices: {} };
const livePrices = new Set(Object.values(map.prices ?? {}));
const sandboxPrices = new Set(Object.keys(map.prices ?? {}));

const problems = [];
if (env !== "sandbox" && env !== "production") problems.push(`PADDLE_ENV must be sandbox or production (got ${env})`);
if (env === "production") {
  if (!token.startsWith("live_")) problems.push("production needs a live_ client token");
  if (!livePrices.has(price)) problems.push("production needs the live price ID (infra/paddle/live-id-map.json)");
} else {
  if (!token.startsWith("test_")) problems.push("sandbox needs a test_ client token");
  if (livePrices.has(price)) problems.push("sandbox build is using a LIVE price ID");
  if (sandboxPrices.size && !sandboxPrices.has(price)) problems.push("sandbox build price is not a known sandbox price");
}

if (problems.length) {
  console.error(`FAIL Paddle web config (${env}): ${problems.join("; ")}`);
  process.exit(1);
}
if (env === "production" && process.env.PADDLE_LIVE_DEPLOY_APPROVED !== "yes") {
  console.error("FAIL refusing to deploy LIVE Paddle checkout: set PADDLE_LIVE_DEPLOY_APPROVED=yes once Paddle verification and website approval are complete");
  process.exit(1);
}
console.log(`OK Paddle web config: ${env} (token ${token.slice(0, 5)}…, price ${price})`);
