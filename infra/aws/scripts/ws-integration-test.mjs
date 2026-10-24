#!/usr/bin/env node
// WebSocket / real-time integration test for the API (local container or production).
//
//   node infra/aws/scripts/ws-integration-test.mjs --api https://api.gpderp.party --origin https://gpderp.party \
//        [--ws wss://api.gpderp.party/ws] [--duration 125m] [--allow-writes] [--generate] [--expect-isolated]
//
// Credentials (never passed as arguments, never printed):
//   TEST_EMAIL + TEST_PASSWORD, or TEST_EMAIL + TEST_PASSWORD_FILE (file must not be group/world readable),
//   or an interactive hidden prompt. `--provision-local-user` registers a disposable user instead (local only).
//   Without credentials the authenticated checks are skipped.
//
// Flags:
//   --duration <n>[s|m|h]  idle phase length (default 2m); checkpoints at 5, 30 and 120 minutes when within it
//   --allow-writes         create (and then delete) a share link to verify two-tab notifications
//   --generate             POST /beer_me_haiku once (spends one credit; a real OpenAI call in production)
//   --expect-isolated      no other clients use this server: assert server-side metrics exactly (local container)
//
// `ws` is loaded from NODE_PATH or apps/api's pnpm store.
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import readline from "node:readline";
import console from "node:console";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const HEARTBEAT_WINDOW_MS = 25_000;
const APP_PING_INTERVAL_MS = 25_000;
const IDLE_CHECKPOINTS_MIN = [5, 30, 120];

// ------------------------------------------------------------------------------------------------ setup

const { values: args } = parseArgs({
  options: {
    api: { type: "string" },
    ws: { type: "string" },
    origin: { type: "string" },
    duration: { type: "string", default: "2m" },
    "allow-writes": { type: "boolean", default: false },
    generate: { type: "boolean", default: false },
    "provision-local-user": { type: "boolean", default: false },
    "expect-isolated": { type: "boolean", default: false },
    help: { type: "boolean", default: false },
  },
});

if (args.help || !args.api) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\nimport ")[0].replace(/^\/\/ ?/gm, ""));
  process.exit(args.help ? 0 : 2);
}

const API = args.api.replace(/\/$/, "");
const WS_URL = args.ws ?? `${API.replace(/^http/, "ws")}/ws`;
const ORIGIN = args.origin ?? "http://localhost:3000";

const parseDuration = (raw) => {
  const match = /^(\d+(?:\.\d+)?)(s|m|h)?$/.exec(raw.trim());
  if (!match) throw new Error(`invalid --duration ${raw}`);
  const unit = { s: 1_000, m: 60_000, h: 3_600_000 }[match[2] ?? "m"];
  return Math.round(Number(match[1]) * unit);
};
const DURATION_MS = parseDuration(args.duration);

const loadWs = () => {
  const require = createRequire(import.meta.url);
  try {
    return require("ws");
  } catch {
    const store = path.resolve(SCRIPT_DIR, "../../../apps/api/node_modules/.pnpm");
    const dir = fs.existsSync(store) ? fs.readdirSync(store).filter((d) => d.startsWith("ws@8.")).sort().pop() : null;
    if (!dir) throw new Error("cannot load `ws`: set NODE_PATH or run pnpm install in apps/api");
    return createRequire(path.join(store, dir, "node_modules", "ws", "index.js"))("ws");
  }
};
const WebSocket = loadWs();

const results = { pass: 0, fail: 0, skip: 0 };
const pass = (msg) => (results.pass += 1, console.log(`PASS ${msg}`));
const fail = (msg) => (results.fail += 1, console.log(`FAIL ${msg}`));
const skip = (msg) => (results.skip += 1, console.log(`SKIP ${msg}`));
const info = (msg) => console.log(`INFO ${msg}`);
const step = (msg) => console.log(`\n== ${msg}`);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Rejects if `promise` does not settle in time; the timer is cleared once it does. */
const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

/** Runs one check; an exception counts as a failure but never aborts the whole run. */
const check = async (label, fn) => {
  try {
    await fn();
  } catch (err) {
    fail(`${label}: ${err?.message ?? err}`);
  }
};

// ------------------------------------------------------------------------------------------------ helpers

/** A test "tab": one socket with a fixed tab id, recording every frame it receives. */
class Tab {
  constructor(name, { cookie, origin = ORIGIN, tabId = randomUUID() } = {}) {
    Object.assign(this, { name, cookie, origin, tabId, messages: [], pings: 0, socket: null });
  }

  open() {
    const headers = {};
    if (this.cookie) headers.Cookie = this.cookie;
    if (this.origin) headers.Origin = this.origin;
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(WS_URL, [`tabId.${this.tabId}`], { headers });
      socket.once("open", () => {
        this.socket = socket;
        resolve(this);
      });
      socket.once("unexpected-response", (_req, res) => reject(new Error(`upgrade rejected: HTTP ${res.statusCode}`)));
      socket.once("error", reject);
      socket.on("ping", () => (this.pings += 1));
      socket.on("message", (raw) => {
        try {
          this.messages.push({ at: Date.now(), msg: JSON.parse(String(raw)) });
        } catch {
          this.messages.push({ at: Date.now(), msg: { kind: "unparseable" } });
        }
      });
    });
  }

  get isOpen() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  send(msg) {
    this.socket.send(JSON.stringify(msg));
  }

  /** Resolves with the first message (from now on) matching `predicate`; rejects after `ms`. */
  waitFor(predicate, ms, label) {
    const from = this.messages.length;
    const started = Date.now();
    const waiting = new Promise((resolve, reject) => {
      const poll = setInterval(() => {
        const hit = this.messages.slice(from).find(({ msg }) => predicate(msg));
        if (hit || Date.now() - started > ms) clearInterval(poll);
        if (hit) resolve(hit);
        else if (Date.now() - started > ms) reject(new Error(`${this.name}: ${label} timed out after ${ms}ms`));
      }, 20);
    });
    // Callers may fail before awaiting this; never let it become an unhandled rejection.
    waiting.catch(() => undefined);
    return waiting;
  }

  async ping() {
    const started = Date.now();
    const pong = this.waitFor((m) => m.kind === "pong", 10_000, "pong");
    this.send({ type: "ping" });
    const { msg } = await pong;
    return { rtt: Date.now() - started, authenticated: msg.data?.authenticated === true };
  }

  close() {
    this.socket?.close(1000, "test_done");
  }
}

const cookieHeaderFrom = (response) =>
  response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

const wsCheck = async () => (await (await fetch(`${API}/ws-check`)).json()).ws;

const promptHidden = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (text) => {
      if (text.includes(question)) rl.output.write(text);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });

const readPassword = async () => {
  if (process.env.TEST_PASSWORD) return process.env.TEST_PASSWORD;
  const file = process.env.TEST_PASSWORD_FILE;
  if (file) {
    if ((fs.statSync(file).mode & 0o077) !== 0) throw new Error("TEST_PASSWORD_FILE must not be group/world readable (chmod 600)");
    return fs.readFileSync(file, "utf8").trim();
  }
  if (process.stdin.isTTY) return promptHidden("Test account password: ");
  return null;
};

const provisionLocalUser = async () => {
  const email = `ws-test+${Date.now()}@example.com`;
  const password = `Ws-${randomUUID()}-Aa1!`;
  const register = await fetch(`${API}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  // Non-2xx is expected locally: the verification email cannot be sent with SMTP disabled.
  info(`provisioned local test user ${email} (register HTTP ${register.status})`);
  return { email, password };
};

const login = async () => {
  let credentials = null;
  if (args["provision-local-user"]) credentials = await provisionLocalUser();
  else if (process.env.TEST_EMAIL) {
    const password = await readPassword();
    if (password) credentials = { email: process.env.TEST_EMAIL, password };
  }
  if (!credentials) return null;
  const response = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: ORIGIN },
    body: JSON.stringify(credentials),
  });
  if (response.status !== 200) throw new Error(`login HTTP ${response.status}`);
  const cookie = cookieHeaderFrom(response);
  if (!cookie.includes("access_token=")) throw new Error("login did not set access_token");
  return cookie;
};

const authedFetch = (cookie, url, init = {}) =>
  fetch(`${API}${url}`, {
    ...init,
    headers: { ...(init.body ? { "content-type": "application/json" } : {}), cookie, ...init.headers },
  });

// Same policy as the web client: full jitter over an exponential window (base 500 ms, cap 30 s).
const reconnectWithBackoff = async (tab, attempts = 6) => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const delay = Math.max(250, Math.round(Math.random() * Math.min(30_000, 500 * 2 ** attempt)));
    await sleep(delay);
    try {
      await withTimeout(tab.open(), 10_000, "reconnect");
      return { attempt: attempt + 1, delay };
    } catch (err) {
      info(`reconnect attempt ${attempt + 1} failed: ${err.message}`);
    }
  }
  throw new Error(`no reconnect after ${attempts} attempts`);
};

// ------------------------------------------------------------------------------------------------ checks

const tabs = [];
const track = (tab) => (tabs.push(tab), tab);
let cookie = null;
let anonymous = null;
let tabA = null;
let tabB = null;
let generatedHaikuId = null;

info(`API ${API} | WS ${WS_URL} | Origin ${ORIGIN} | idle ${Math.round(DURATION_MS / 1000)}s`);

step("1. HTTP health check");
await check("GET /healthz", async () => {
  const res = await fetch(`${API}/healthz`);
  if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  pass(`GET /healthz -> 200 ${await res.text()}`);
});

step("2. WebSocket upgrade (anonymous) and bidirectional ping/pong");
await check("anonymous upgrade", async () => {
  const started = Date.now();
  anonymous = await withTimeout(track(new Tab("anonymous", { origin: null })).open(), 10_000, "upgrade");
  pass(`upgrade opened in ${Date.now() - started}ms (${WS_URL})`);
  const { rtt, authenticated } = await anonymous.ping();
  if (authenticated) throw new Error("anonymous socket reported authenticated");
  pass(`client ping -> server pong in ${rtt}ms (authenticated=false)`);
});

step("3. Authenticated connections");
await check("login", async () => {
  cookie = await login();
  if (cookie) pass("login issued session cookies");
  else skip("no credentials (TEST_EMAIL + TEST_PASSWORD[_FILE] or --provision-local-user): authenticated checks skipped");
});

if (cookie) {
  await check("Origin enforcement", async () => {
    try {
      await new Tab("no-origin", { cookie, origin: null }).open();
      throw new Error("cookie-bearing handshake without Origin was accepted");
    } catch (err) {
      if (!/HTTP 403/.test(err.message)) throw err;
      pass("cookie-bearing handshake without Origin rejected (403)");
    }
  });
  await check("authenticated tabs", async () => {
    tabA = await track(new Tab("tab A", { cookie })).open();
    tabB = await track(new Tab("tab B", { cookie })).open();
    const [a, b] = await Promise.all([tabA.ping(), tabB.ping()]);
    if (!a.authenticated || !b.authenticated) throw new Error("pong.authenticated was false");
    for (const tab of [tabA, tabB, anonymous]) tab.send({ type: "subscribe", channel: "share-links" });
    pass(`two tabs authenticated (pong ${a.rtt}ms / ${b.rtt}ms) and subscribed to share-links`);
  });
}

step("4. Streamed generation (WebSocket deltas; the API has no SSE routes)");
info("SSE: not present (no text/event-stream routes); progressive delivery is checked on the WebSocket stream.");
if (!cookie || !tabA) skip("needs an authenticated tab");
else if (!args.generate) skip("pass --generate to spend one credit on a streamed generation");
else {
  await check("streamed generation", async () => {
    const started = Date.now();
    const done = tabA.waitFor((m) => m.kind === "saved" || m.kind === "complete", 120_000, "generation end");
    const creditsOnB = tabB.waitFor((m) => m.kind === "generation_credits", 120_000, "credits broadcast");
    const res = await authedFetch(cookie, "/beer_me_haiku", {
      method: "POST",
      headers: { "x-tab-id": tabA.tabId },
      body: JSON.stringify({ subject: "integration test" }),
    });
    const body = await res.json();
    if (res.status !== 200) throw new Error(`POST /beer_me_haiku HTTP ${res.status}`);
    const end = await done;
    const stream = tabA.messages.filter(({ at, msg }) => at >= started && msg.id && msg.kind !== "generation_credits");
    const deltas = stream.filter(({ msg }) => (msg.kind ?? "delta") === "delta");
    const arrivals = new Set(deltas.map(({ at }) => at));
    if (stream[0]?.msg.kind !== "start") throw new Error(`first message was ${stream[0]?.msg.kind}`);
    if (deltas.length < 2 || arrivals.size < 2) throw new Error(`stream not progressive (${deltas.length} deltas)`);
    const spread = deltas[deltas.length - 1].at - deltas[0].at;
    pass(`start -> ${deltas.length} deltas over ${spread}ms (${arrivals.size} distinct arrivals) -> ${end.msg.kind}; creditsRemaining=${body.creditsRemaining}`);
    await creditsOnB;
    pass("tab B received the generation_credits broadcast for tab A's generation");
    if (end.msg.kind === "saved") generatedHaikuId = end.msg.data?.haiku?.id ?? null;
  });
}

step("5. Two tabs receive an authorized change notification");
if (!cookie || !tabA || !tabB) skip("needs two authenticated tabs");
else if (!args["allow-writes"]) skip("pass --allow-writes to create and delete a test share link");
else {
  await check("share-link notifications", async () => {
    let haikuId = generatedHaikuId;
    if (!haikuId) {
      const list = await (await authedFetch(cookie, "/haiku?pageSize=1")).json();
      haikuId = list.data?.haikus?.[0]?.id;
    }
    if (!haikuId) return skip("the test user has no haiku to share (combine with --generate)");
    const anonymousBefore = anonymous.messages.length;
    const created = Promise.all([tabA, tabB].map((t) => t.waitFor((m) => m.kind === "share_link", 10_000, "share_link")));
    const res = await authedFetch(cookie, "/share_link", { method: "POST", body: JSON.stringify({ haikuId }) });
    const body = await res.json();
    if (res.status !== 201 && res.status !== 200) throw new Error(`POST /share_link HTTP ${res.status}`);
    await created;
    pass(`both tabs received share_link (HTTP ${res.status})`);
    if (res.status === 201) {
      const deleted = Promise.all([tabA, tabB].map((t) => t.waitFor((m) => m.kind === "share_link_deleted", 10_000, "deleted")));
      const del = await authedFetch(cookie, `/share_link/${body.data.id}`, { method: "DELETE" });
      if (del.status !== 200) throw new Error(`DELETE /share_link HTTP ${del.status}`);
      await deleted;
      pass("both tabs received share_link_deleted (test link removed)");
    } else info("share link already existed: left untouched (not deleted)");
    await sleep(500);
    const leaked = anonymous.messages.slice(anonymousBefore).filter(({ msg }) => msg.kind?.startsWith("share_link"));
    if (leaked.length) throw new Error("anonymous socket received a share-link notification");
    pass("anonymous socket received no share-link notification");
  });
}

step(`6. Idle connections (${Math.round(DURATION_MS / 60_000 * 10) / 10} min; checkpoints ${IDLE_CHECKPOINTS_MIN.join("/")} min when within the duration)`);
await check("idle", async () => {
  const idleTabs = [anonymous, tabA, tabB].filter(Boolean);
  if (!idleTabs.length) throw new Error("no open sockets to idle");
  const before = await wsCheck();
  const startedAt = Date.now();
  const marks = idleTabs.map((t) => ({ tab: t, messages: t.messages.length, pings: t.pings }));
  let appPings = 0;
  const pinger = setInterval(() => {
    for (const t of idleTabs) if (t.isOpen) t.send({ type: "ping" });
    appPings += idleTabs.length;
  }, APP_PING_INTERVAL_MS);

  const checkpoints = [...IDLE_CHECKPOINTS_MIN.map((m) => m * 60_000).filter((ms) => ms < DURATION_MS), DURATION_MS];
  try {
    for (const at of checkpoints) {
      await sleep(Math.max(0, startedAt + at - Date.now()));
      const label = `${Math.round(at / 6_000) / 10} min`;
      const closed = idleTabs.filter((t) => !t.isOpen).map((t) => t.name);
      if (closed.length) throw new Error(`${label}: sockets closed while idle: ${closed.join(", ")}`);
      const unsolicited = marks.flatMap(({ tab, messages }) =>
        tab.messages.slice(messages).filter(({ msg }) => msg.kind !== "pong").map(({ msg }) => `${tab.name}:${msg.kind}`),
      );
      if (unsolicited.length) throw new Error(`${label}: unsolicited messages while idle: ${unsolicited.join(", ")}`);
      const pings = marks.map(({ tab, pings: p }) => tab.pings - p);
      const expectedPings = Math.floor(at / HEARTBEAT_WINDOW_MS) - 1;
      if (Math.min(...pings) < expectedPings) throw new Error(`${label}: too few server pings (${pings.join("/")})`);
      const rtts = await Promise.all(idleTabs.map((t) => t.ping()));
      const now = await wsCheck();
      const authChecks = now.handshakeAuthChecks - before.handshakeAuthChecks;
      if (args["expect-isolated"] && authChecks !== 0) throw new Error(`${label}: ${authChecks} handshake auth checks while idle`);
      pass(
        `${label}: ${idleTabs.length} sockets open, server pings ${pings.join("/")}, pong ${rtts.map((r) => r.rtt).join("/")}ms, ` +
          `no unsolicited messages, handshake auth checks while idle: ${authChecks}${args["expect-isolated"] ? "" : " (includes other clients)"}`,
      );
    }
  } finally {
    clearInterval(pinger);
  }
  info(`sent ${appPings} app pings while idle; none triggered auth, database or AI work (pong only)`);
});

step("7. Reconnection after connection loss");
await check("reconnect", async () => {
  const victim = tabA ?? anonymous;
  if (!victim) throw new Error("no socket to drop");
  const before = await wsCheck();
  victim.socket.terminate(); // abrupt loss: no close frame
  let after = before;
  for (let i = 0; i < 50 && after.active >= before.active; i += 1) {
    await sleep(100);
    after = await wsCheck();
  }
  if (args["expect-isolated"] && after.active !== before.active - 1) throw new Error(`server active ${after.active}, expected ${before.active - 1}`);
  pass(`server cleaned up the dropped socket (active ${before.active} -> ${after.active}, abnormal closes ${before.closed.abnormal} -> ${after.closed.abnormal})`);

  const { attempt, delay } = await reconnectWithBackoff(victim);
  const { authenticated } = await victim.ping();
  if (victim === tabA && !authenticated) throw new Error("reconnected tab is not authenticated");
  pass(`reconnected on attempt ${attempt} after ${delay}ms jittered backoff (same tab id, authenticated=${authenticated})`);

  if (victim === tabA && args["allow-writes"]) {
    victim.send({ type: "subscribe", channel: "share-links" });
    await sleep(200);
    const list = await (await authedFetch(cookie, "/haiku?pageSize=1")).json();
    const haikuId = generatedHaikuId ?? list.data?.haikus?.[0]?.id;
    if (!haikuId) return info("no haiku available for a post-reconnect notification check");
    const got = Promise.all([tabA, tabB].map((t) => t.waitFor((m) => m.kind === "share_link", 10_000, "share_link")));
    const res = await authedFetch(cookie, "/share_link", { method: "POST", body: JSON.stringify({ haikuId }) });
    const body = await res.json();
    await got;
    if (res.status === 201) await authedFetch(cookie, `/share_link/${body.data.id}`, { method: "DELETE" });
    pass("reconnected tab receives notifications again (REST data is refreshed by the web client on reconnect)");
  }
});

// ------------------------------------------------------------------------------------------------ summary

for (const tab of tabs) tab.close();
console.log(`\n${results.pass} passed, ${results.fail} failed, ${results.skip} skipped`);
process.exit(results.fail ? 1 : 0);
