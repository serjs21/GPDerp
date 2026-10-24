// node --test infra/aws/lib/lightsail-config.test.mjs
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  diffEnvironments,
  environmentFromCurrent,
  environmentFromEnvFile,
  loadManifest,
  missingRequired,
  parseEnvFile,
} from "./lightsail-config.mjs";

const TOOL = fileURLToPath(new URL("./lightsail-config.mjs", import.meta.url));
const manifest = loadManifest();
const SECRET = "s3cr3t-value-that-must-never-print";

const completeEnv = () =>
  Object.fromEntries(manifest.variables.filter((v) => v.required).map((v) => [v.name, `${SECRET}-${v.name}`]));

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "ls-config-"));

const run = (args) => spawnSync("node", [TOOL, ...args], { encoding: "utf8" });

test("parseEnvFile handles quotes, comments and export", () => {
  const env = parseEnvFile('A=1\n# c\nexport B="two words"\nC=\'x#y\'\nD=plain # trailing\nEMPTY=\n');
  assert.deepEqual(env, { A: "1", B: "two words", C: "x#y", D: "plain", EMPTY: "" });
});

test("first deployment: required values must be present and non-empty; unknown keys ignored", () => {
  const fileEnv = { ...completeEnv(), POSTGRES_PASSWORD: "local-only" };
  const { environment, ignored } = environmentFromEnvFile(manifest, fileEnv);
  assert.deepEqual(missingRequired(manifest, environment), []);
  assert.equal(environment.NODE_ENV, "production");
  assert.equal(environment.PORT, "8080");
  assert.deepEqual(ignored, ["POSTGRES_PASSWORD"]);
  assert.ok(!("POSTGRES_PASSWORD" in environment));

  const incomplete = environmentFromEnvFile(manifest, { ...completeEnv(), DATABASE_URL: "" }).environment;
  assert.deepEqual(missingRequired(manifest, incomplete), ["DATABASE_URL"]);
});

test("later deployments keep current values and never overwrite them with empty overrides", () => {
  const current = { ...completeEnv(), TRUST_PROXY_HOPS: "2" };
  const { environment, overridden } = environmentFromCurrent(manifest, current, {
    DATABASE_URL: "",
    OPENAI_API_KEY: "rotated",
    UNKNOWN: "x",
  });
  assert.equal(environment.DATABASE_URL, current.DATABASE_URL);
  assert.equal(environment.OPENAI_API_KEY, "rotated");
  assert.equal(environment.TRUST_PROXY_HOPS, "2", "current value wins over the default");
  assert.deepEqual(overridden, ["OPENAI_API_KEY"]);
  assert.ok(!("UNKNOWN" in environment));
});

test("diff reports names only", () => {
  const diff = diffEnvironments({ A: "1", B: "2", C: "3" }, { A: "1", B: "x", D: "4" });
  assert.deepEqual(diff, { added: ["D"], removed: ["C"], changed: ["B"], unchanged: ["A"] });
});

test("CLI writes 0600 files and never prints values", () => {
  const dir = tmp();
  const envFile = path.join(dir, ".env.lightsail");
  fs.writeFileSync(envFile, Object.entries(completeEnv()).map(([k, v]) => `${k}=${v}`).join("\n"));
  const out = path.join(dir, "containers.json");

  const built = run(["from-env-file", "--env-file", envFile, "--image", ":container-service-1.api.1", "--out", out]);
  assert.equal(built.status, 0, built.stderr);
  assert.equal(fs.statSync(out).mode & 0o777, 0o600);
  const containers = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.equal(containers.api.image, ":container-service-1.api.1");
  assert.deepEqual(containers.api.ports, { 8080: "HTTP" });

  const deployment = path.join(dir, "current.json");
  fs.writeFileSync(deployment, JSON.stringify({ version: 1, containers, publicEndpoint: { containerName: "api", containerPort: 8080, healthCheck: { path: "/healthz" } } }));
  const next = path.join(dir, "next.json");
  const kept = run(["from-current", "--current", deployment, "--image", ":container-service-1.api.2", "--out", next]);
  assert.equal(kept.status, 0, kept.stderr);
  assert.equal(JSON.parse(fs.readFileSync(next, "utf8")).api.environment.DATABASE_URL, containers.api.environment.DATABASE_URL);

  const summary = run(["summary", "--containers", next, "--against", deployment]);
  assert.equal(summary.status, 0, summary.stderr);
  assert.match(summary.stdout, /image: +:container-service-1\.api\.2/);
  assert.match(summary.stdout, /changed: +none/);

  const endpoint = path.join(dir, "endpoint.json");
  const rollback = run(["from-deployment", "--deployment", deployment, "--out", path.join(dir, "rb.json"), "--endpoint-out", endpoint]);
  assert.equal(rollback.status, 0, rollback.stderr);
  assert.equal(JSON.parse(fs.readFileSync(endpoint, "utf8")).healthCheck.path, "/healthz");

  for (const result of [built, kept, summary, rollback]) {
    assert.ok(!`${result.stdout}${result.stderr}`.includes(SECRET), "a value leaked to the terminal");
  }
});

test("CLI fails safely when required config is missing", () => {
  const dir = tmp();
  const envFile = path.join(dir, ".env.lightsail");
  fs.writeFileSync(envFile, `DATABASE_URL=${SECRET}\n`);
  const result = run(["from-env-file", "--env-file", envFile, "--image", ":x", "--out", path.join(dir, "out.json")]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /required variables missing or empty: DATABASE_URL_UNPOOLED/);
  assert.ok(!result.stderr.includes(SECRET));
  assert.ok(!fs.existsSync(path.join(dir, "out.json")));

  const noDeployment = path.join(dir, "null.json");
  fs.writeFileSync(noDeployment, "null");
  const current = run(["from-current", "--current", noDeployment, "--image", ":x", "--out", path.join(dir, "o.json")]);
  assert.equal(current.status, 1);
  assert.match(current.stderr, /no deployment/);
  execFileSync("rm", ["-rf", dir]);
});
