#!/usr/bin/env bash
# Build the production API image for Lightsail (linux/amd64) and smoke-test it locally.
#
#   infra/aws/build.sh [--skip-smoke] [--no-cache]
#
# Tags: gpderp-api:<git-sha>[-dirty] and gpderp-api:latest. Build context: apps/api (standalone pnpm
# project). The smoke test runs the image under amd64 emulation against the LOCAL Postgres from
# apps/api/.env (docker compose) and checks /healthz, /readyz and that no secret is baked in.
set -euo pipefail
. "$(dirname "$0")/lib/common.sh"

SMOKE=1
CACHE_FLAG=()
for arg in "$@"; do
  case "$arg" in
    --skip-smoke) SMOKE=0 ;;
    --no-cache) CACHE_FLAG=(--no-cache) ;;
    *) die "unknown option $arg" ;;
  esac
done

require_tools docker buildx git node curl
IMAGE="$(local_image_tag)"
case "$IMAGE" in *-dirty) warn "apps/api has uncommitted changes: tagging $IMAGE (commit before a production push)" ;; esac

step "Build $IMAGE (linux/amd64, context apps/api)"
# --load stores the single-platform image in the local Docker engine (works on Apple Silicon via emulation/cross-build).
docker buildx build --platform linux/amd64 --load ${CACHE_FLAG[@]+"${CACHE_FLAG[@]}"} \
  --label "org.opencontainers.image.revision=$(git_sha)" \
  -t "$IMAGE" -t "$LOCAL_IMAGE_REPO:latest" "$API_DIR"

ARCH="$(docker image inspect -f '{{.Architecture}}/{{.Os}}' "$IMAGE")"
[ "$ARCH" = "amd64/linux" ] || die "image platform is $ARCH, expected amd64/linux"
ok "built $IMAGE ($ARCH, $(docker image ls "$IMAGE" --format '{{.Size}}'))"

ENV_NAMES="$(docker image inspect -f '{{range .Config.Env}}{{println .}}{{end}}' "$IMAGE" | cut -d= -f1 | grep -v '^$' | sort | tr '\n' ' ')"
UNEXPECTED="$(tr ' ' '\n' <<<"$ENV_NAMES" | grep -v '^$' | grep -vE '^(NODE_ENV|PORT|NODE_OPTIONS|PATH|NODE_VERSION|YARN_VERSION)$' || true)"
[ -z "$UNEXPECTED" ] || die "unexpected env baked into the image: $UNEXPECTED"
ok "image env holds no runtime configuration ($ENV_NAMES)"
ENV_FILES="$(docker run --rm --platform linux/amd64 --entrypoint sh "$IMAGE" -c 'find /app -maxdepth 3 \( -name ".env*" -o -name ".neon" \) -print' || true)"
[ -z "$ENV_FILES" ] || die "env files inside the image: $ENV_FILES"
ok "no .env / .neon files in the image"

if [ "$SMOKE" = "1" ]; then
  step "Local smoke test (local Postgres; nothing is sent to AWS)"
  make_private_tmp
  node "$AWS_DIR/scripts/prepare-local-env.mjs" --app-env "$PRIVATE_TMP/app.env" >/dev/null
  CONTAINER="gpderp-api-build-smoke-$$"
  trap 'docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; rm -rf "$PRIVATE_TMP"' EXIT
  PORT_ON_HOST="${SMOKE_PORT:-18081}"
  docker run -d --name "$CONTAINER" --platform linux/amd64 --memory 1g \
    --env-file "$PRIVATE_TMP/app.env" -p "$PORT_ON_HOST:8080" "$IMAGE" >/dev/null
  HEALTHY=""
  for _ in $(seq 1 90); do
    if curl -fsS "http://localhost:$PORT_ON_HOST/healthz" >/dev/null 2>&1; then HEALTHY=1; break; fi
    [ "$(docker inspect -f '{{.State.Running}}' "$CONTAINER")" = "true" ] || break
    sleep 1
  done
  if [ -z "$HEALTHY" ]; then
    docker logs "$CONTAINER" 2>&1 | tail -20 | redact
    die "container did not answer /healthz (is the local Postgres from apps/api/docker-compose.yml running?)"
  fi
  ok "GET /healthz -> $(curl -s "http://localhost:$PORT_ON_HOST/healthz")"
  READY_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT_ON_HOST/readyz")"
  [ "$READY_STATUS" = "200" ] && ok "GET /readyz -> 200 (database reachable)" || die "GET /readyz -> $READY_STATUS"
  docker stop -t 30 "$CONTAINER" >/dev/null
  [ "$(docker inspect -f '{{.State.ExitCode}}' "$CONTAINER")" = "0" ] && ok "graceful SIGTERM shutdown (exit 0)" || die "container did not stop cleanly"
fi

echo
ok "image ready: $IMAGE"
echo "Next: infra/aws/push.sh $IMAGE"
