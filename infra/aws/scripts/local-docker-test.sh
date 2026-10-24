#!/usr/bin/env bash
# Local production-image smoke test for apps/api (AWS Lightsail Containers target: linux/amd64, port 8080).
#
#   infra/aws/scripts/local-docker-test.sh
#
# Env (optional):
#   IMAGE=gpderp-api:local     image tag to build/test
#   HOST_PORT=18080            host port mapped to the container's 8080
#   SKIP_BUILD=1               reuse an existing $IMAGE
#   TEST_EMAIL / TEST_PASSWORD local-DB user for the streamed-generation check
#                              (unset: a disposable docker-smoke+<ts>@example.com user is created locally)
#
# Requires: docker, node, curl; local Postgres (apps/api docker-compose) on localhost:5433;
#           apps/api/.env (dev) and apps/api/.env.neon (Neon, read-only check). Secrets are never printed.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
API_DIR="$ROOT/apps/api"
SCRIPTS_DIR="$ROOT/infra/aws/scripts"
IMAGE="${IMAGE:-gpderp-api:local}"
HOST_PORT="${HOST_PORT:-18080}"
BASE_URL="http://localhost:$HOST_PORT"
CONTAINER="gpderp-api-smoke-$$"

TMP_DIR="$(mktemp -d)"
chmod 700 "$TMP_DIR"
APP_ENV_FILE="$TMP_DIR/app.env"
NEON_ENV_FILE="$TMP_DIR/neon.env"
SECRETS_FILE="$TMP_DIR/secrets.txt"

FAILURES=0
pass() { echo "PASS $*"; }
fail() { echo "FAIL $*"; FAILURES=$((FAILURES + 1)); }
info() { echo "INFO $*"; }
step() { echo; echo "== $*"; }

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  [ -n "${EXPORT_CID:-}" ] && docker rm -f "$EXPORT_CID" >/dev/null 2>&1 || true
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

expect_status() { # expect_status <expected> <method> <path> [curl args...]
  local expected="$1" method="$2" path="$3"
  shift 3
  local status
  status="$(curl -s -o "$TMP_DIR/body" -w '%{http_code}' -X "$method" "$@" "$BASE_URL$path" || true)"
  if [ "$status" = "$expected" ]; then
    pass "$method $path -> $status $(head -c 120 "$TMP_DIR/body")"
  else
    fail "$method $path -> $status (expected $expected) $(head -c 200 "$TMP_DIR/body")"
  fi
}

# ---------------------------------------------------------------------------------------------
step "1. Build image for linux/amd64"
if [ "${SKIP_BUILD:-}" != "1" ]; then
  echo "\$ docker build --platform linux/amd64 -t $IMAGE $API_DIR"
  docker build --platform linux/amd64 -t "$IMAGE" "$API_DIR"
fi
ARCH="$(docker image inspect -f '{{.Architecture}}/{{.Os}}' "$IMAGE")"
USER_NAME="$(docker image inspect -f '{{.Config.User}}' "$IMAGE")"
SIZE="$(docker image ls "$IMAGE" --format '{{.Size}}')"
[ "$ARCH" = "amd64/linux" ] && pass "image platform $ARCH ($SIZE)" || fail "image platform $ARCH (expected amd64/linux)"
[ "$USER_NAME" = "node" ] && pass "runtime user $USER_NAME (non-root)" || fail "runtime user '$USER_NAME' (expected node)"

# ---------------------------------------------------------------------------------------------
step "2. Prepare run-time env (from apps/api/.env; local Postgres; never baked into the image)"
(
  cd "$API_DIR"
  APP_ENV_FILE="$APP_ENV_FILE" NEON_ENV_FILE="$NEON_ENV_FILE" SECRETS_FILE="$SECRETS_FILE" node -e '
    const fs = require("fs");
    const dotenv = require("dotenv");
    const env = dotenv.parse(fs.readFileSync(".env"));
    const neon = fs.existsSync(".env.neon") ? dotenv.parse(fs.readFileSync(".env.neon")) : {};
    const toDocker = (url) => url.replace(/@(localhost|127\.0\.0\.1)(?=[:/])/, "@host.docker.internal");
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
      // No outbound email from smoke tests.
      SMTP_HOST: "",
      MAIL_FROM: "",
    };
    for (const k of ["POSTGRES_USER","POSTGRES_PASSWORD","POSTGRES_DB","POSTGRES_HOST","POSTGRES_PORT","HOST","CORS_ORIGIN","NEON_BRANCH"]) delete app[k];
    const line = ([k, v]) => { if (/\n/.test(v)) throw new Error("multi-line value for " + k); return k + "=" + v; };
    fs.writeFileSync(process.env.APP_ENV_FILE, Object.entries(app).map(line).join("\n") + "\n", { mode: 0o600 });
    if (neon.DATABASE_URL) {
      // Same app env, Neon URLs: lets the image load its real env + Prisma singleton against Neon.
      const neonApp = { ...app, DATABASE_URL: neon.DATABASE_URL, DATABASE_URL_UNPOOLED: neon.DATABASE_URL_UNPOOLED || neon.DATABASE_URL };
      fs.writeFileSync(process.env.NEON_ENV_FILE, Object.entries(neonApp).map(line).join("\n") + "\n", { mode: 0o600 });
    }
    const secretKey = /(SECRET|PASS|PASSWORD|KEY|TOKEN|PEPPER|DATABASE_URL|PRIVATE)/;
    // Short or digit-only values (dev placeholders) also occur in library code and would only produce noise.
    const scannable = (v) => v.length >= 12 && !/^\d+$/.test(v);
    const values = new Set();
    const skipped = new Set();
    for (const src of [env, neon]) for (const [k, v] of Object.entries(src)) {
      if (!secretKey.test(k) || !v) continue;
      if (scannable(v)) values.add(v); else skipped.add(k);
    }
    fs.writeFileSync(process.env.SECRETS_FILE, [...values].join("\n") + "\n", { mode: 0o600 });
    console.log("INFO app env keys: " + Object.keys(app).length + ", secret values to scan: " + values.size + ", neon check: " + Boolean(neon.DATABASE_URL));
    if (skipped.size) console.log("INFO not scanned (short or digit-only placeholder values): " + [...skipped].sort().join(", "));
  '
)

# ---------------------------------------------------------------------------------------------
step "3. Start container (1 GB, port 8080 -> $HOST_PORT)"
echo "\$ docker run -d --name $CONTAINER --platform linux/amd64 --memory 1g --env-file <tmp> -p $HOST_PORT:8080 $IMAGE"
docker run -d --name "$CONTAINER" --platform linux/amd64 --memory 1g --env-file "$APP_ENV_FILE" -p "$HOST_PORT:8080" "$IMAGE" >/dev/null
READY=""
for _ in $(seq 1 90); do
  if curl -fsS "$BASE_URL/healthz" >/dev/null 2>&1; then READY=1; break; fi
  if [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER")" != "true" ]; then break; fi
  sleep 1
done
if [ -n "$READY" ]; then
  pass "Fastify started: $(docker logs "$CONTAINER" 2>&1 | grep -m1 -o 'Server ready on [^"]*' || echo 'listening')"
else
  fail "container did not become healthy"; docker logs "$CONTAINER" 2>&1 | tail -30; exit 1
fi

# ---------------------------------------------------------------------------------------------
step "4. Health and REST"
expect_status 200 GET /healthz
expect_status 200 GET /readyz
expect_status 200 GET /health
expect_status 200 GET "/auth/check-username?username=docker_smoke_check"
expect_status 401 POST /auth/login -H 'content-type: application/json' -d '{"email":"nobody-docker-smoke@example.com","password":"wrong-password"}'
expect_status 401 GET /auth/me
expect_status 404 GET /dev/postcard_back.png

# ---------------------------------------------------------------------------------------------
step "5. WebSocket upgrade + heartbeat, and streamed generation over the same server"
WS_NODE_PATH="$(ls -d "$API_DIR"/node_modules/.pnpm/ws@8*/node_modules 2>/dev/null | tail -1)"
if [ -z "$WS_NODE_PATH" ]; then
  fail "ws package not found under apps/api/node_modules (run pnpm install in apps/api)"
else
  NODE_PATH="$WS_NODE_PATH" node "$SCRIPTS_DIR/stream-check.mjs" ws "$BASE_URL" || FAILURES=$((FAILURES + 1))
  NODE_PATH="$WS_NODE_PATH" node "$SCRIPTS_DIR/stream-check.mjs" generate "$BASE_URL" || FAILURES=$((FAILURES + 1))
fi
info "SSE: the API has no SSE routes (no text/event-stream); haiku streaming uses WebSocket deltas (checked above)."

# ---------------------------------------------------------------------------------------------
step "5b. Reconnect after dropped database connections (simulates Neon suspend / restart)"
curl -fsS "$BASE_URL/readyz" >/dev/null 2>&1 || true
TERMINATED="$(docker exec -e NODE_NO_WARNINGS=1 "$CONTAINER" node -e '
  const { Client } = require("pg");
  (async () => {
    const c = new Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
    await c.connect();
    const { rows } = await c.query(
      "SELECT count(pg_terminate_backend(pid))::int AS n FROM pg_stat_activity WHERE application_name IN ($1, $2) AND pid <> pg_backend_pid()",
      ["gpderp-api", "pgboss"]);
    await c.end();
    process.stdout.write(String(rows[0].n));
  })().catch((e) => { console.error(e.code || e.message); process.exit(1); });
' || echo "error")"
if [ "$TERMINATED" = "error" ] || [ -z "$TERMINATED" ]; then
  fail "could not terminate the app's database sessions"
else
  info "terminated $TERMINATED app/pg-boss database session(s)"
  RECOVERED=""
  for attempt in $(seq 1 15); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/readyz")" = "200" ]; then RECOVERED="$attempt"; break; fi
    sleep 1
  done
  sleep 3
  RUNNING="$(docker inspect -f '{{.State.Running}}' "$CONTAINER")"
  if [ -n "$RECOVERED" ] && [ "$RUNNING" = "true" ]; then
    pass "/readyz 200 again on attempt $RECOVERED; process still running (pool evicted dead sockets and reconnected)"
  else
    fail "no recovery after dropped connections (readyz attempt: ${RECOVERED:-none}, running: $RUNNING)"
  fi
  expect_status 200 GET "/auth/check-username?username=docker_smoke_reconnect"
fi

# ---------------------------------------------------------------------------------------------
step "6. Neon through the app's Prisma singleton + TLS (read-only, from inside the image)"
if [ -s "$NEON_ENV_FILE" ]; then
  if docker run --rm --platform linux/amd64 --env-file "$NEON_ENV_FILE" -e NODE_NO_WARNINGS=1 "$IMAGE" node -e '
    const { Client } = require("pg");
    const { env } = require("./dist/env");
    const { prismaClient } = require("./dist/lib/prisma");
    const { describeDatabaseUrl, withVerifiedTls } = require("./dist/utils/databaseUrl");
    (async () => {
      const started = Date.now();
      const [{ ok }] = await prismaClient.$queryRaw`SELECT 1::int AS ok`;
      const users = await prismaClient.user.count();
      const haikus = await prismaClient.haiku.count();
      console.log("PASS Neon via app Prisma singleton (" + describeDatabaseUrl(env.DATABASE_URL) + "): SELECT 1=" + ok +
        ", users=" + users + ", haikus=" + haikus + " in " + (Date.now() - started) + "ms");
      await prismaClient.$disconnect();
      for (const [label, url] of [["pooled", env.DATABASE_URL], ["direct", env.DATABASE_URL_UNPOOLED]]) {
        const client = new Client({ connectionString: withVerifiedTls(url), connectionTimeoutMillis: 15000 });
        await client.connect();
        const socket = client.connection.stream;
        const tls = { encrypted: socket.encrypted, authorized: socket.authorized, protocol: socket.getProtocol?.(), cipher: socket.getCipher?.()?.name };
        await client.query("SELECT 1");
        await client.end();
        // Neon terminates TLS at its proxy, so server-side pg_stat_ssl reports false; the client socket is what counts.
        if (!tls.encrypted || !tls.authorized) throw new Error(label + " connection is not TLS-verified");
        console.log("PASS Neon " + label + " TLS (" + describeDatabaseUrl(url) + "): " + tls.protocol + " " +
          tls.cipher + ", certificate + hostname verified");
      }
    })().catch((e) => { console.error("FAIL Neon check: " + (e.code || "") + " " + e.message.replace(/postgres(ql)?:\/\/\S+/g, "<redacted>")); process.exit(1); });
  '; then :; else FAILURES=$((FAILURES + 1)); fi
else
  info "SKIP Neon check: apps/api/.env.neon not found"
fi

# ---------------------------------------------------------------------------------------------
step "7. No secrets in the image"
ENV_NAMES="$(docker image inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$IMAGE" | cut -d= -f1 | grep -v '^$' | sort | tr '\n' ' ')"
UNEXPECTED="$(echo "$ENV_NAMES" | tr ' ' '\n' | grep -v '^$' | grep -vE '^(NODE_ENV|PORT|NODE_OPTIONS|PATH|NODE_VERSION|YARN_VERSION)$' || true)"
[ -z "$UNEXPECTED" ] && pass "image Config.Env names: $ENV_NAMES" || fail "unexpected image env vars: $UNEXPECTED"

HISTORY_HITS="$(docker history --no-trunc --format '{{.CreatedBy}}' "$IMAGE" | grep -c -F -f "$SECRETS_FILE" || true)"
[ "$HISTORY_HITS" = "0" ] && pass "image history contains no secret values" || fail "image history matched $HISTORY_HITS secret value line(s)"

EXPORT_CID="$(docker create --platform linux/amd64 "$IMAGE")"
docker export "$EXPORT_CID" > "$TMP_DIR/rootfs.tar"
FS_HITS="$(grep -a -c -F -f "$SECRETS_FILE" "$TMP_DIR/rootfs.tar" || true)"
[ "$FS_HITS" = "0" ] && pass "image filesystem contains no secret values" || fail "image filesystem matched $FS_HITS secret value line(s)"
ENV_FILES="$(tar -tf "$TMP_DIR/rootfs.tar" | grep -E '(^|/)(\.env(\..*)?|\.neon)$' || true)"
[ -z "$ENV_FILES" ] && pass "no .env* / .neon files in the image" || fail "credential files in image: $ENV_FILES"
APP_FILES="$(tar -tf "$TMP_DIR/rootfs.tar" | grep -E '^app/(src|prisma|scripts|deploy|node_modules/(typescript|jest|eslint|tsx|prisma)/)' | head -5 || true)"
[ -z "$APP_FILES" ] && pass "no sources, tests or dev tooling under /app" || fail "unexpected files under /app: $APP_FILES"
docker rm "$EXPORT_CID" >/dev/null && EXPORT_CID=""

# ---------------------------------------------------------------------------------------------
step "8. Graceful shutdown (SIGTERM)"
STOP_STARTED="$(date +%s)"
docker stop -t 30 "$CONTAINER" >/dev/null
EXIT_CODE="$(docker inspect -f '{{.State.ExitCode}}' "$CONTAINER")"
STOP_SECONDS="$(( $(date +%s) - STOP_STARTED ))"
if [ "$EXIT_CODE" = "0" ] && docker logs "$CONTAINER" 2>&1 | grep -q "SIGTERM received"; then
  pass "SIGTERM handled: exit code 0 after ${STOP_SECONDS}s"
else
  fail "shutdown exit code $EXIT_CODE after ${STOP_SECONDS}s"; docker logs "$CONTAINER" 2>&1 | tail -10
fi

# ---------------------------------------------------------------------------------------------
step "9. Container logs contain no database URLs or secret values"
docker logs "$CONTAINER" > "$TMP_DIR/container.log" 2>&1
URL_HITS="$(grep -c -E 'postgres(ql)?://' "$TMP_DIR/container.log" || true)"
SECRET_HITS="$(grep -c -F -f "$SECRETS_FILE" "$TMP_DIR/container.log" || true)"
DB_ERROR_LINES="$(grep -c -E '\[prisma\] (pool|connection) error' "$TMP_DIR/container.log" || true)"
[ "$URL_HITS" = "0" ] && pass "no postgres:// URLs in $(wc -l < "$TMP_DIR/container.log" | tr -d ' ') log lines" || fail "logs contain $URL_HITS line(s) with a postgres:// URL"
[ "$SECRET_HITS" = "0" ] && pass "no secret values in logs" || fail "logs matched $SECRET_HITS secret value line(s)"
info "sanitized database pool/connection error lines logged during the reconnect check: $DB_ERROR_LINES"

echo
if [ "$FAILURES" -eq 0 ]; then
  echo "ALL CHECKS PASSED"
else
  echo "$FAILURES CHECK(S) FAILED"
  exit 1
fi
