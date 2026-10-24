#!/usr/bin/env node
// Writes 0600 runtime env files for running the production image LOCALLY (build.sh smoke test,
// local-docker-test.sh). Values come from apps/api/.env (local Postgres) and optionally apps/api/.env.neon.
// Nothing here is baked into the image, and no value is printed.
//
//   node prepare-local-env.mjs --app-env <out> [--neon-env <out>] [--secrets <out>]
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { parseEnvFile } from "../lib/lightsail-config.mjs";

const API_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../apps/api");
const { values: args } = parseArgs({
  options: { "app-env": { type: "string" }, "neon-env": { type: "string" }, secrets: { type: "string" } },
});
if (!args["app-env"]) {
  console.error("Usage: node prepare-local-env.mjs --app-env <out> [--neon-env <out>] [--secrets <out>]");
  process.exit(2);
}

const readEnv = (name) => {
  const file = path.join(API_DIR, name);
  return fs.existsSync(file) ? parseEnvFile(fs.readFileSync(file, "utf8")) : null;
};
const env = readEnv(".env");
if (!env) {
  console.error(`FAIL ${path.join(API_DIR, ".env")} not found (local development env)`);
  process.exit(1);
}
const neon = readEnv(".env.neon") ?? {};
// Production values: only used to scan images and logs for leaks, never written to the local env files.
const production = readEnv(".env.lightsail") ?? {};

const toDocker = (url = "") => url.replace(/@(localhost|127\.0\.0\.1)(?=[:/])/, "@host.docker.internal");
const app = {
  ...env,
  NODE_ENV: "production",
  PORT: "8080",
  DATABASE_URL: toDocker(env.DATABASE_URL),
  DATABASE_URL_UNPOOLED: toDocker(env.DATABASE_URL_UNPOOLED || env.DATABASE_URL),
  HAIKU_GENERATION_API: "dev",
  // Local plain-HTTP only: production keeps Secure cookies and its own domain.
  COOKIE_SECURE: "false",
  COOKIE_DOMAIN: "",
  CLIENT_URL: "http://localhost:3000",
  // No outbound email from local image runs.
  SMTP_HOST: "",
  MAIL_FROM: "",
};
for (const key of ["POSTGRES_USER", "POSTGRES_PASSWORD", "POSTGRES_DB", "POSTGRES_HOST", "POSTGRES_PORT", "HOST", "CORS_ORIGIN", "NEON_BRANCH"]) {
  delete app[key];
}

const line = ([key, value]) => {
  if (/\n/.test(value)) throw new Error(`multi-line value for ${key}`);
  return `${key}=${value}`;
};
const writeEnv = (file, values) => fs.writeFileSync(file, Object.entries(values).map(line).join("\n") + "\n", { mode: 0o600 });

writeEnv(args["app-env"], app);
if (args["neon-env"] && neon.DATABASE_URL) {
  // Same app env with the Neon URLs: lets the image load its real env + Prisma singleton against Neon.
  writeEnv(args["neon-env"], {
    ...app,
    DATABASE_URL: neon.DATABASE_URL,
    DATABASE_URL_UNPOOLED: neon.DATABASE_URL_UNPOOLED || neon.DATABASE_URL,
  });
}

if (args.secrets) {
  const secretKey = /(SECRET|PASS|PASSWORD|KEY|TOKEN|PEPPER|DATABASE_URL|PRIVATE)/;
  // Short or digit-only values (dev placeholders) also occur in library code and would only produce noise.
  const scannable = (value) => value.length >= 12 && !/^\d+$/.test(value);
  const values = new Set();
  const skipped = new Set();
  for (const source of [env, neon, production]) {
    for (const [key, value] of Object.entries(source)) {
      if (!secretKey.test(key) || !value) continue;
      if (scannable(value)) values.add(value);
      else skipped.add(key);
    }
  }
  // An empty pattern line would make `grep -F -f` match everything.
  fs.writeFileSync(args.secrets, values.size ? [...values].join("\n") + "\n" : "", { mode: 0o600 });
  console.log(`INFO secret values to scan: ${values.size}`);
  if (skipped.size) console.log(`INFO not scanned (short or digit-only placeholder values): ${[...skipped].sort().join(", ")}`);
}
console.log(`INFO app env keys: ${Object.keys(app).length}, neon env: ${Boolean(args["neon-env"] && neon.DATABASE_URL)}`);
