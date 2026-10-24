#!/usr/bin/env bash
# Verify the live Lightsail deployment through its public HTTPS endpoint. Read-only by default.
#
#   infra/aws/verify.sh [--idle 2m] [--generate] [--allow-writes] [--since <ISO time>]
#
#   --idle <n>[s|m|h]  idle WebSocket phase (checkpoints at 5/30/120 min when within it; default 2m)
#   --generate         also stream one real haiku (spends a credit, real OpenAI call)
#   --allow-writes     create + delete a test share link to check two-tab notifications
#   --since            container log window start (default: 30 minutes ago)
# Authenticated WebSocket checks use TEST_EMAIL + TEST_PASSWORD / TEST_PASSWORD_FILE or a hidden prompt;
# without them only the anonymous checks run. Tokens and passwords are never printed.
set -euo pipefail
. "$(dirname "$0")/lib/common.sh"

IDLE="2m"
SINCE=""
WS_FLAGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --idle) IDLE="$2"; shift 2 ;;
    --since) SINCE="$2"; shift 2 ;;
    --generate | --allow-writes) WS_FLAGS+=("$1"); shift ;;
    *) die "unknown option $1" ;;
  esac
done
SINCE="${SINCE:-$(date -u -v-30M +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '30 minutes ago' +%Y-%m-%dT%H:%M:%SZ)}"

require_tools aws node curl
FAILURES=0
pass() { echo "PASS $*"; }
fail() { echo "FAIL $*"; FAILURES=$((FAILURES + 1)); }

step "1. Deployment state"
for _ in $(seq 1 40); do
  read -r SVC_STATE DEP_STATE <<<"$(aws_ls get-container-services --service-name "$LIGHTSAIL_SERVICE" \
    --query 'containerServices[0].[state,currentDeployment.state]' --output text)"
  [ "$SVC_STATE" = "RUNNING" ] && [ "$DEP_STATE" = "ACTIVE" ] && break
  info "service $SVC_STATE, current deployment ${DEP_STATE/None/none}; waiting"
  sleep 15
done
preflight
[ "$CURRENT_STATE" = "ACTIVE" ] && pass "deployment $CURRENT_VERSION is ACTIVE (service $SERVICE_STATE)" ||
  fail "current deployment is ${CURRENT_STATE/None/missing}"
BASE="$SERVICE_URL"
# Endpoint, container names and ports only (the query never selects environments).
ENDPOINT_JSON="$(aws_ls get-container-services --service-name "$LIGHTSAIL_SERVICE" --output json \
  --query "containerServices[0].currentDeployment.{name:publicEndpoint.containerName,port:publicEndpoint.containerPort,path:publicEndpoint.healthCheck.path,containers:keys(containers),ports:containers.${CONTAINER_NAME}.ports}")"
ENDPOINT_PROBLEMS="$(node -e '
  const e = JSON.parse(process.argv[1]); const [name, port] = process.argv.slice(2); const p = [];
  if (e.name !== name || String(e.port) !== port) p.push(`public endpoint targets ${e.name}:${e.port}`);
  if (e.path !== "/healthz") p.push(`health check path ${e.path}`);
  if (JSON.stringify(e.containers) !== JSON.stringify([name])) p.push(`containers ${JSON.stringify(e.containers)}`);
  if (JSON.stringify(e.ports) !== JSON.stringify({ [port]: "HTTP" })) p.push(`ports ${JSON.stringify(e.ports)}`);
  process.stdout.write(p.join("; "));' "$ENDPOINT_JSON" "$CONTAINER_NAME" "$CONTAINER_PORT")"
[ -z "$ENDPOINT_PROBLEMS" ] && pass "public endpoint $CONTAINER_NAME:$CONTAINER_PORT, health check /healthz, single container $CONTAINER_NAME ($CONTAINER_PORT/HTTP)" ||
  fail "deployment shape: $ENDPOINT_PROBLEMS"

step "2. REST over HTTPS ($BASE)"
http_check() { # http_check <path> <expected status>
  local body status
  body="$(mktemp)"
  status="$(curl -sS -o "$body" -w '%{http_code}' --max-time 20 "$BASE$1" 2>&1 || true)"
  if [ "$status" = "$2" ]; then pass "GET $1 -> $status $(head -c 120 "$body" | redact)"; else fail "GET $1 -> $status (expected $2) $(head -c 200 "$body" | redact)"; fi
  rm -f "$body"
}
http_check /healthz 200
http_check /readyz 200 # database round trip through the app (SELECT 1), no details exposed
TLS="$(curl -sS -o /dev/null -w '%{http_version} %{ssl_verify_result}' --max-time 20 "$BASE/healthz" || echo "error")"
[ "${TLS#* }" = "0" ] && pass "HTTPS certificate verified (HTTP/${TLS% *})" || fail "TLS check: $TLS"
CORS="$(curl -sS -o /dev/null -D - --max-time 20 -X OPTIONS -H "Origin: $WEB_ORIGIN" -H 'Access-Control-Request-Method: GET' "$BASE/healthz" | tr -d '\r' | grep -i '^access-control-allow-origin:' || true)"
[ -n "$CORS" ] && pass "CORS preflight allows $WEB_ORIGIN" || fail "CORS preflight did not allow $WEB_ORIGIN (check CLIENT_URL)"

WS_CHECK="$(curl -sS --max-time 20 "$BASE/ws-check" || echo '{}')"
CLIENT_IP="$(node -e 'try{process.stdout.write(String(JSON.parse(process.argv[1]).clientIp??""))}catch{}' "$WS_CHECK")"
MY_IP="$(curl -sS --max-time 10 https://checkip.amazonaws.com | tr -d '[:space:]' || true)"
if [ -n "$MY_IP" ] && [ "$CLIENT_IP" = "$MY_IP" ]; then
  pass "client IP resolved through the load balancer ($CLIENT_IP): TRUST_PROXY_HOPS is correct"
else
  fail "API sees client IP '$CLIENT_IP', public IP is '$MY_IP' (adjust TRUST_PROXY_HOPS; per-IP WebSocket limits depend on it)"
fi

step "3. WebSockets over WSS (+ streaming; the API has no SSE routes)"
info "SSE: not present (no text/event-stream routes); streamed output is the WebSocket delta sequence"
[[ " ${WS_FLAGS[*]:-} " == *" --generate "* ]] || info "streamed generation skipped (pass --generate to spend one credit on a real stream)"
if node "$AWS_DIR/scripts/ws-integration-test.mjs" --api "$BASE" --origin "$WEB_ORIGIN" --duration "$IDLE" ${WS_FLAGS[@]+"${WS_FLAGS[@]}"} 2>&1 | redact | sed 's/^/    /'; then
  pass "WebSocket integration test (upgrade, ping/pong, Origin, auth, idle $IDLE, reconnect)"
else
  fail "WebSocket integration test (see the indented output: upgrade rejections or idle closes point at the proxy)"
fi

step "4. Container logs since $SINCE"
LOGS="$(aws_ls get-container-log --service-name "$LIGHTSAIL_SERVICE" --container-name "$CONTAINER_NAME" \
  --start-time "$SINCE" --query 'logEvents[].message' --output text 2>&1 | tr '\t' '\n' | redact || true)"
FATAL="$(grep -cE 'Failed to start|FATAL|Unhandled|uncaught' <<<"$LOGS" || true)"
ERRORS="$(grep -cE '"level":(50|60)|\bERROR\b|\berror\b' <<<"$LOGS" || true)"
info "$(grep -c . <<<"$LOGS" || true) log lines, $ERRORS error-level, $FATAL fatal"
if [ "$FATAL" != "0" ]; then
  grep -E 'Failed to start|FATAL|Unhandled|uncaught' <<<"$LOGS" | head -10 | cut -c1-300
  fail "fatal startup/runtime errors in the container log"
else
  [ "$ERRORS" = "0" ] || grep -E '"level":(50|60)|\bERROR\b|\berror\b' <<<"$LOGS" | head -5 | cut -c1-300
  pass "no fatal errors in the container log"
fi

echo
if [ "$FAILURES" -eq 0 ]; then
  ok "verification passed: $BASE"
else
  die "$FAILURES verification check(s) failed"
fi
