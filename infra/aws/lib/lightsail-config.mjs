#!/usr/bin/env node
// Builds and inspects Lightsail container configs without ever printing environment VALUES.
// Output files are written with mode 0600; only variable names, counts and images reach stdout.
//
//   from-env-file --env-file <file> --image <img> --out <containers.json>
//       First deployment / explicit config: required variables must be present and non-empty.
//   from-current --current <deployment.json> --image <img> [--overrides <env file>] --out <containers.json>
//       Later deployments: keep the current environment, swap the image, apply only NON-EMPTY overrides.
//   from-deployment --deployment <deployment.json> --out <containers.json> --endpoint-out <endpoint.json>
//       Rollback: reuse a previous deployment's containers and public endpoint unchanged.
//   summary --containers <containers.json> [--against <deployment.json>]
//       Image and variable names (set / missing / invalid / added / removed / changed), never values.
//   redact --containers <containers.json|deployment.json>  (stdin -> stdout)
//       Replaces every secret / long value of that config in arbitrary text (AWS errors, logs).
// Every builder refuses (exit 1, names only) when a required variable is missing or empty, a locked
// default (NODE_ENV, PORT, COOKIE_SECURE) is changed, or a value breaks a rule in runtime-env.json.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import console from "node:console";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const MANIFEST_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../config/runtime-env.json");
const CONTAINER_NAME = process.env.CONTAINER_NAME ?? "api";
const CONTAINER_PORT = String(process.env.CONTAINER_PORT ?? "8080");

const fail = (message) => {
  console.error(`FAIL ${message}`);
  process.exit(1);
};

export const loadManifest = (file = MANIFEST_PATH) => JSON.parse(fs.readFileSync(file, "utf8"));

/** Minimal dotenv parser (KEY=value, optional quotes, # comments); avoids a dependency. */
export const parseEnvFile = (text) => {
  const env = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    let value = match[2];
    const quoted = /^(['"])(.*)\1$/.exec(value);
    if (quoted) value = quoted[1] === '"' ? quoted[2].replace(/\\n/g, "\n") : quoted[2];
    else value = value.replace(/\s+#.*$/, "");
    env[match[1]] = value;
  }
  return env;
};

const allowedNames = (manifest) => new Set([...Object.keys(manifest.defaults), ...manifest.variables.map((v) => v.name)]);

export const missingRequired = (manifest, environment) =>
  manifest.variables.filter((v) => v.required && !(environment[v.name] ?? "").trim()).map((v) => v.name);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "host.docker.internal", "::1"]);
const TLS_SSL_MODES = new Set(["require", "verify-ca", "verify-full"]);

const parseUrl = (value) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const checkPostgres = (value, pooled) => {
  const url = parseUrl(value);
  if (!url || !["postgres:", "postgresql:"].includes(url.protocol)) return "not a postgres:// URL";
  if (LOCAL_HOSTS.has(url.hostname)) return "points at a local database";
  const isPooler = url.hostname.includes("-pooler");
  if (pooled && !isPooler) return "must be the Neon pooled host (-pooler)";
  if (!pooled && isPooler) return "must be the Neon direct host (no -pooler)";
  if (!TLS_SSL_MODES.has(url.searchParams.get("sslmode") ?? "")) return "sslmode must be require or verify-full";
  return null;
};

const checkHttps = (value) => {
  const url = parseUrl(value.trim());
  if (!url || url.protocol !== "https:") return "must be an https:// URL";
  if (LOCAL_HOSTS.has(url.hostname)) return "points at localhost";
  return null;
};

const RULES = {
  "postgres-pooled": (v) => checkPostgres(v, true),
  "postgres-direct": (v) => checkPostgres(v, false),
  "https-url": checkHttps,
  "https-url-list": (v) => {
    const parts = v.split(",").map((s) => s.trim()).filter(Boolean);
    return parts.length ? (parts.map(checkHttps).find(Boolean) ?? null) : "empty list";
  },
  "positive-int": (v) => (/^[1-9]\d*$/.test(v) ? null : "must be a positive integer"),
  "non-negative-int": (v) => (/^\d+$/.test(v) ? null : "must be a non-negative integer"),
};

const applyRule = (rule, value) => {
  const [name, arg] = rule.split(":");
  if (name === "min-length") return value.length >= Number(arg) ? null : `must be at least ${arg} characters`;
  if (name === "one-of") return arg.split(",").includes(value) ? null : `must be one of ${arg}`;
  const check = RULES[name];
  if (!check) throw new Error(`unknown rule ${rule}`);
  return check(value);
};

/** "NAME: reason" problems for locked defaults and rule violations. Never includes values. */
export const invalidValues = (manifest, environment) => {
  const problems = [];
  for (const name of manifest.locked ?? []) {
    if (name in environment && environment[name] !== manifest.defaults[name]) {
      problems.push(`${name}: locked to its default (${manifest.defaults[name]})`);
    }
  }
  for (const [name, rule] of Object.entries(manifest.rules ?? {})) {
    const value = environment[name];
    if (value === undefined || value === "") continue;
    const problem = applyRule(rule, value);
    if (problem) problems.push(`${name}: ${problem}`);
  }
  return problems;
};

/** Values worth hiding in any text shown on a terminal: secrets, database URLs and long values. */
export const sensitiveValues = (manifest, environment) => {
  const secret = new Set(manifest.variables.filter((v) => v.secret).map((v) => v.name));
  return Object.entries(environment)
    .filter(([name, value]) => value && (secret.has(name) ? value.length >= 4 : value.length >= 16))
    .map(([, value]) => value)
    .sort((a, b) => b.length - a.length);
};

export const redactValues = (text, values) => values.reduce((out, value) => out.split(value).join("<redacted>"), text);

/** First deployment: manifest names only (other keys in the file are ignored), defaults filled in. */
export const environmentFromEnvFile = (manifest, fileEnv) => {
  const allowed = allowedNames(manifest);
  const environment = { ...manifest.defaults };
  const ignored = [];
  for (const [name, value] of Object.entries(fileEnv)) {
    if (!allowed.has(name)) ignored.push(name);
    else if (value !== "") environment[name] = value;
  }
  return { environment, ignored };
};

/** Later deployments: current values win; overrides apply only when non-empty; defaults fill gaps. */
export const environmentFromCurrent = (manifest, currentEnv, overrides = {}) => {
  const allowed = allowedNames(manifest);
  const environment = { ...manifest.defaults, ...currentEnv };
  const overridden = [];
  const ignored = [];
  for (const [name, value] of Object.entries(overrides)) {
    if (!allowed.has(name)) ignored.push(name);
    else if (value !== "" && environment[name] !== value) {
      environment[name] = value;
      overridden.push(name);
    }
  }
  return { environment, overridden, ignored };
};

export const containersFor = (image, environment) => ({
  [CONTAINER_NAME]: { image, environment, ports: { [CONTAINER_PORT]: "HTTP" } },
});

/** Names-only comparison of two environments. */
export const diffEnvironments = (before = {}, after = {}) => {
  const names = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
  const diff = { added: [], removed: [], changed: [], unchanged: [] };
  for (const name of names) {
    if (!(name in before)) diff.added.push(name);
    else if (!(name in after)) diff.removed.push(name);
    else if (before[name] !== after[name]) diff.changed.push(name);
    else diff.unchanged.push(name);
  }
  return diff;
};

const writePrivate = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", { mode: 0o600 });
  fs.chmodSync(file, 0o600);
};

const readJson = (file, label) => {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    if (parsed === null) fail(`${label} is empty (no deployment)`);
    return parsed;
  } catch (err) {
    return fail(`cannot read ${label}: ${err.code ?? err.message}`);
  }
};

const containerOf = (deployment) => deployment?.containers?.[CONTAINER_NAME] ?? null;

/** Refuses the deployment when anything required is missing or a value breaks a rule (names only). */
const requireValid = (manifest, environment) => {
  const missing = missingRequired(manifest, environment);
  if (missing.length) fail(`required variables missing or empty: ${missing.join(", ")}`);
  const invalid = invalidValues(manifest, environment);
  if (invalid.length) fail(`invalid configuration (values hidden):\n  ${invalid.join("\n  ")}`);
};

const commands = {
  "from-env-file"({ "env-file": envFile, image, out }) {
    if (!envFile || !image || !out) fail("usage: from-env-file --env-file <file> --image <img> --out <file>");
    if (!fs.existsSync(envFile)) fail(`env file not found: ${envFile}`);
    const manifest = loadManifest();
    const { environment, ignored } = environmentFromEnvFile(manifest, parseEnvFile(fs.readFileSync(envFile, "utf8")));
    requireValid(manifest, environment);
    writePrivate(out, containersFor(image, environment));
    console.log(`config: ${Object.keys(environment).length} variables from ${path.basename(envFile)} + defaults`);
    if (ignored.length) console.log(`ignored (not in runtime-env.json): ${ignored.sort().join(", ")}`);
  },

  "from-current"({ current, image, overrides, out }) {
    if (!current || !image || !out) fail("usage: from-current --current <deployment.json> --image <img> [--overrides <file>] --out <file>");
    const manifest = loadManifest();
    const container = containerOf(readJson(current, "current deployment"));
    if (!container) fail(`current deployment has no "${CONTAINER_NAME}" container`);
    const overrideEnv = overrides ? parseEnvFile(fs.readFileSync(overrides, "utf8")) : {};
    const result = environmentFromCurrent(manifest, container.environment ?? {}, overrideEnv);
    requireValid(manifest, result.environment);
    writePrivate(out, containersFor(image, result.environment));
    console.log(`config: current environment kept (${Object.keys(result.environment).length} variables)`);
    if (result.overridden.length) console.log(`overridden from ${path.basename(overrides)}: ${result.overridden.join(", ")}`);
    if (result.ignored.length) console.log(`ignored (not in runtime-env.json): ${result.ignored.sort().join(", ")}`);
  },

  "from-deployment"({ deployment, out, "endpoint-out": endpointOut }) {
    if (!deployment || !out || !endpointOut) fail("usage: from-deployment --deployment <file> --out <file> --endpoint-out <file>");
    const source = readJson(deployment, "deployment");
    if (!containerOf(source)) fail(`deployment has no "${CONTAINER_NAME}" container`);
    if (!source.publicEndpoint) fail("deployment has no public endpoint");
    const containers = Object.fromEntries(
      Object.entries(source.containers).map(([name, c]) => [
        name,
        { image: c.image, ...(c.command?.length ? { command: c.command } : {}), environment: c.environment ?? {}, ports: c.ports ?? {} },
      ]),
    );
    requireValid(loadManifest(), containerOf(source).environment ?? {});
    const { containerName, containerPort, healthCheck } = source.publicEndpoint;
    writePrivate(out, containers);
    writePrivate(endpointOut, { containerName, containerPort, healthCheck });
    console.log(`config: deployment ${source.version ?? "?"} image ${containerOf(source).image}`);
  },

  summary({ containers, against }) {
    if (!containers) fail("usage: summary --containers <file> [--against <deployment.json>]");
    const manifest = loadManifest();
    const container = readJson(containers, "containers")[CONTAINER_NAME];
    if (!container) fail(`no "${CONTAINER_NAME}" container in ${containers}`);
    const environment = container.environment ?? {};
    const secrets = new Set(manifest.variables.filter((v) => v.secret).map((v) => v.name));
    const names = Object.keys(environment).sort();
    console.log(`image:      ${container.image}`);
    console.log(`ports:      ${Object.entries(container.ports ?? {}).map(([p, proto]) => `${p}/${proto}`).join(", ")}`);
    console.log(`variables:  ${names.length} set (${names.filter((n) => secrets.has(n)).length} secret; values hidden)`);
    console.log(`            ${names.join(" ")}`);
    const missing = missingRequired(manifest, environment);
    const invalid = invalidValues(manifest, environment);
    console.log(`missing:    ${missing.length ? missing.join(", ") : "none"}`);
    console.log(`invalid:    ${invalid.length ? invalid.join("; ") : "none"}`);
    if (against && fs.existsSync(against)) {
      const previous = JSON.parse(fs.readFileSync(against, "utf8"));
      const before = containerOf(previous);
      if (before) {
        const diff = diffEnvironments(before.environment, environment);
        console.log(`previous:   ${before.image} (deployment ${previous.version ?? "?"})`);
        console.log(`added:      ${diff.added.join(", ") || "none"}`);
        console.log(`removed:    ${diff.removed.join(", ") || "none"}`);
        console.log(`changed:    ${diff.changed.join(", ") || "none"}`);
        console.log(`unchanged:  ${diff.unchanged.length} variables`);
      }
    }
    if (missing.length || invalid.length) process.exit(1);
  },

  /** stdin -> stdout with every sensitive value of the given config replaced by <redacted>. */
  redact({ containers }) {
    if (!containers) fail("usage: redact --containers <file> < text");
    const manifest = loadManifest();
    const parsed = fs.existsSync(containers) ? JSON.parse(fs.readFileSync(containers, "utf8")) : null;
    const container = parsed?.[CONTAINER_NAME] ?? parsed?.containers?.[CONTAINER_NAME];
    const values = sensitiveValues(manifest, container?.environment ?? {});
    process.stdout.write(redactValues(fs.readFileSync(0, "utf8"), values));
  },
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [command, ...rest] = process.argv.slice(2);
  if (!commands[command]) fail(`unknown command ${command ?? ""}; see the header of ${path.basename(fileURLToPath(import.meta.url))}`);
  const { values } = parseArgs({
    args: rest,
    options: Object.fromEntries(
      ["env-file", "image", "out", "current", "overrides", "deployment", "endpoint-out", "containers", "against"].map((n) => [n, { type: "string" }]),
    ),
  });
  commands[command](values);
}
