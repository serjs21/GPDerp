#!/usr/bin/env bash
# Create a Lightsail deployment of a stored image on the EXISTING service (single container "api",
# HTTP 8080, public endpoint api:8080 with health check /healthz). Production changes need an
# explicit confirmation; Prisma migrations are never run.
#
#   infra/aws/deploy.sh [--image :container-service-1.api.N] [--env-file <file>] [--dry-run] [--skip-verify] [-- <verify.sh args>]
#
# Configuration:
#   first deployment   runtime variables from --env-file (default apps/api/.env.lightsail, gitignored);
#                      every required variable in config/runtime-env.json must be set.
#   later deployments  the CURRENT deployment's environment is kept as is; --env-file (explicit only)
#                      overrides just the non-empty values it contains. Empty values never overwrite.
# Values are only written to a private temp file for the AWS call and are never printed.
set -euo pipefail
. "$(dirname "$0")/lib/common.sh"

IMAGE_ARG=""
ENV_FILE_ARG=""
DRY_RUN=0
SKIP_VERIFY=0
VERIFY_ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --image) IMAGE_ARG="$2"; shift 2 ;;
    --env-file) ENV_FILE_ARG="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    --skip-verify) SKIP_VERIFY=1; shift ;;
    --) shift; VERIFY_ARGS=("$@"); break ;;
    *) die "unknown option $1" ;;
  esac
done

require_tools aws node curl
preflight
make_private_tmp

step "Image"
IMAGE="${IMAGE_ARG:-$(cat "$STATE_DIR/last-image" 2>/dev/null || true)}"
if [ -z "$IMAGE" ] && [ "$DRY_RUN" = "1" ]; then
  IMAGE=":$LIGHTSAIL_SERVICE.$IMAGE_LABEL.<next-push>"
  warn "nothing pushed yet: dry run continues with placeholder image $IMAGE"
elif [ -z "$IMAGE" ]; then
  die "no image given and nothing pushed yet (run infra/aws/push.sh or pass --image)"
elif [ "$DRY_RUN" = "1" ]; then
  (require_stored_image "$IMAGE") || warn "dry run: $IMAGE is not stored in the service yet"
else
  require_stored_image "$IMAGE"
  ok "stored image $IMAGE"
fi

step "Configuration (variable names only; values are never printed)"
CURRENT="$PRIVATE_TMP/current.json"
NEXT="$PRIVATE_TMP/containers.json"
fetch_current_deployment "$CURRENT"
check_env_file() {
  [ -f "$1" ] || die "runtime env file $1 not found (copy apps/api/.env.example, fill production values; it is gitignored)"
  local absolute
  absolute="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
  case "$absolute" in
    "$REPO_ROOT"/*) git -C "$REPO_ROOT" check-ignore -q "$absolute" || die "$1 is not gitignored; refusing to read secrets from a committable file" ;;
  esac
  [ $(( $(stat -f '%Lp' "$1" 2>/dev/null || stat -c '%a' "$1") % 100 )) -eq 0 ] || warn "$1 is readable by group/others (chmod 600 recommended)"
}
if [ "$CURRENT_VERSION" = "None" ]; then
  ENV_FILE="${ENV_FILE_ARG:-$REPO_ROOT/$RUNTIME_ENV_FILE}"
  check_env_file "$ENV_FILE"
  info "first deployment: building the configuration from $ENV_FILE"
  node "$CONFIG_TOOL" from-env-file --env-file "$ENV_FILE" --image "$IMAGE" --out "$NEXT"
else
  OVERRIDES=()
  if [ -n "$ENV_FILE_ARG" ]; then
    check_env_file "$ENV_FILE_ARG"
    OVERRIDES=(--overrides "$ENV_FILE_ARG")
  fi
  info "keeping the configuration of deployment $CURRENT_VERSION"
  node "$CONFIG_TOOL" from-current --current "$CURRENT" --image "$IMAGE" ${OVERRIDES[@]+"${OVERRIDES[@]}"} --out "$NEXT"
fi
node "$CONFIG_TOOL" summary --containers "$NEXT" --against "$CURRENT"
info "public endpoint: $(node -e 'const e=require(process.argv[1]); process.stdout.write(`${e.containerName}:${e.containerPort}, health check ${e.healthCheck.path} (${e.healthCheck.successCodes})`)' "$PUBLIC_ENDPOINT_FILE")"

if [ "$DRY_RUN" = "1" ]; then
  echo
  ok "dry run: configuration is complete; nothing was changed in AWS"
  exit 0
fi

step "Deploy to $LIGHTSAIL_SERVICE ($AWS_REGION) — production"
confirm_service "Deploy $IMAGE to $SERVICE_URL?"
# --query keeps the response (which echoes every environment value) off the terminal.
STATE="$(aws_ls create-container-service-deployment --service-name "$LIGHTSAIL_SERVICE" \
  --containers "file://$NEXT" --public-endpoint "file://$PUBLIC_ENDPOINT_FILE" \
  --query 'containerService.state' --output text 2>&1)" || die "create-container-service-deployment failed: $(echo "$STATE" | redact | tail -3)"
NEW_VERSION="$(aws_ls get-container-service-deployments --service-name "$LIGHTSAIL_SERVICE" --query 'max(deployments[].version)' --output text)"
ok "deployment $NEW_VERSION requested (service state $STATE)"
DEPLOY_STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if ! wait_for_deployment "$NEW_VERSION"; then
  warn "recent container log lines:"
  aws_ls get-container-log --service-name "$LIGHTSAIL_SERVICE" --container-name "$CONTAINER_NAME" \
    --start-time "$DEPLOY_STARTED" --query 'logEvents[-30:].message' --output text 2>/dev/null | tr '\t' '\n' | redact || true
  die "deployment $NEW_VERSION did not become ACTIVE; Lightsail keeps serving the previous deployment (if any). See infra/aws/README.md#troubleshooting"
fi

info "Prisma migrations are never run by this tool. Check: (cd apps/api && pnpm migrate:status:prod)"
if [ "$SKIP_VERIFY" = "0" ]; then
  "$AWS_DIR/verify.sh" --since "$DEPLOY_STARTED" ${VERIFY_ARGS[@]+"${VERIFY_ARGS[@]}"}
fi
echo
ok "deployed $IMAGE as deployment $NEW_VERSION: $SERVICE_URL"
