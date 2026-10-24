// Real-time checks against a running API container (see local-docker-test.sh).
//
//   node stream-check.mjs ws <baseUrl>
//     WebSocket upgrade on /ws (tabId subprotocol) opens, and the server heartbeat ping arrives.
//
//   node stream-check.mjs generate <baseUrl>
//     Logs in (TEST_EMAIL / TEST_PASSWORD, or provisions a disposable local user), opens /ws with the
//     session cookie, POSTs /beer_me_haiku and asserts the streamed WS sequence start -> delta+ -> saved|complete.
//
// `ws` is resolved through NODE_PATH (apps/api's pnpm store); Node >= 20 provides fetch.
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import process from "node:process";
import console from "node:console";
const require = createRequire(import.meta.url);
const WebSocket = require("ws");

const [mode, baseUrl] = process.argv.slice(2);
if (!mode || !baseUrl) {
  console.error("Usage: node stream-check.mjs <ws|generate> <baseUrl>");
  process.exit(2);
}
const wsUrl = `${baseUrl.replace(/^http/, "ws")}/ws`;

const fail = (message) => {
  console.error(`FAIL ${message}`);
  process.exit(1);
};

/** Fails the check if `promise` does not settle in time; the timer is cleared once it does. */
const withTimeout = (promise, ms, label) => {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
};

const openSocket = (headers = {}) =>
  new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl, [`tabId.${randomUUID()}`], { headers });
    socket.once("open", () => resolve(socket));
    socket.once("unexpected-response", (_req, res) => reject(new Error(`upgrade rejected: HTTP ${res.statusCode}`)));
    socket.once("error", reject);
  });

async function checkWs() {
  const started = Date.now();
  const socket = await withTimeout(openSocket(), 10_000, "WS upgrade");
  console.log(`PASS WS upgrade opened in ${Date.now() - started}ms (${wsUrl})`);
  await withTimeout(new Promise((resolve) => socket.once("ping", resolve)), 35_000, "WS server ping");
  console.log(`PASS WS server heartbeat ping received after ${Date.now() - started}ms`);
  socket.close();
}

const cookieHeaderFrom = (response) =>
  response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");

async function login() {
  let email = process.env.TEST_EMAIL;
  let password = process.env.TEST_PASSWORD;
  if (!email || !password) {
    // Disposable user in the LOCAL database. The test container has SMTP disabled, so registration's
    // verification email fails (no mail is sent) after the user is created; login does not need it.
    email = `docker-smoke+${Date.now()}@example.com`;
    password = `Smoke-${randomUUID()}-Aa1!`;
    const register = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    // Non-2xx is expected here: the verification email cannot be sent with SMTP disabled.
    console.log(`INFO provisioned local test user ${email} (register HTTP ${register.status}, email sending disabled)`);
  }
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (response.status !== 200) fail(`login HTTP ${response.status}`);
  const cookie = cookieHeaderFrom(response);
  if (!cookie.includes("access_token=")) fail("login did not set access_token");
  console.log("PASS login issued session cookies");
  return cookie;
}

async function checkGenerate() {
  const cookie = await login();
  const tabId = randomUUID();
  const socket = await new Promise((resolve, reject) => {
    const s = new WebSocket(wsUrl, [`tabId.${tabId}`], { headers: { Cookie: cookie } });
    s.once("open", () => resolve(s));
    s.once("error", reject);
  });

  const started = Date.now();
  const kinds = [];
  let firstDeltaMs = null;
  let streamedChars = 0;
  const finished = new Promise((resolve) => {
    socket.on("message", (raw) => {
      const msg = JSON.parse(String(raw));
      const kind = msg.kind ?? "delta";
      if (kind === "generation_credits") return;
      kinds.push(kind);
      if (kind === "delta") {
        if (firstDeltaMs === null) firstDeltaMs = Date.now() - started;
        streamedChars += msg.data?.delta?.length ?? 0;
      }
      if (kind === "saved" || kind === "complete") resolve();
    });
  });

  const response = await fetch(`${baseUrl}/beer_me_haiku`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie, "x-tab-id": tabId },
    body: JSON.stringify({ subject: "docker smoke test" }),
  });
  const body = await response.json();
  await withTimeout(finished, 30_000, "streamed generation");
  socket.close();

  if (response.status !== 200 || typeof body.creditsRemaining !== "number") {
    fail(`POST /beer_me_haiku HTTP ${response.status} ${JSON.stringify(body)}`);
  }
  const deltas = kinds.filter((k) => k === "delta").length;
  if (kinds[0] !== "start") fail(`first WS message was ${kinds[0]}, expected start`);
  if (deltas < 1) fail("no delta messages streamed");
  const last = kinds[kinds.length - 1];
  console.log(
    `PASS streamed generation: start -> ${deltas} deltas (${streamedChars} chars, first after ${firstDeltaMs}ms) -> ${last}; HTTP 200 creditsRemaining=${body.creditsRemaining}`,
  );
}

try {
  if (mode === "ws") await checkWs();
  else if (mode === "generate") await checkGenerate();
  else fail(`unknown mode ${mode}`);
  process.exit(0);
} catch (err) {
  fail(err?.message ?? String(err));
}
