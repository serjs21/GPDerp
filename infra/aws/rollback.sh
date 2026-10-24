#!/usr/bin/env bash
# Roll the service back to a previous deployment version, as a NEW deployment. Never touches data and
# never reverts Prisma migrations.
#
#   infra/aws/rollback.sh [--version N] [--restore-config] [--dry-run] [-- <verify.sh args>]
#
# Default: restore only the IMAGE of version N and keep the CURRENT environment, so rotated or added
# secrets are not undone. --restore-config also restores that version's environment and endpoint
# (old secret values come back; use only when the current configuration itself is the problem).
# Approval: type the service name, or CONFIRM_DEPLOY=container-service-1:rollback-<N>[+config].
set -euo pipefail
. "$(dirname "$0")/lib/common.sh"

TARGET=""
DRY_RUN=0
RESTORE_CONFIG=0
VERIFY_ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --version) TARGET="$2"; shift 2 ;;
    --restore-config) RESTORE_CONFIG=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --) shift; VERIFY_ARGS=("$@"); break ;;
    *) die "unknown option $1" ;;
  esac
done

require_tools aws node curl
preflight
make_private_tmp

step "Deployment versions (newest first)"
# Image names and states only; environments are never selected here.
VERSIONS="$(aws_ls get-container-service-deployments --service-name "$LIGHTSAIL_SERVICE" \
  --query "reverse(sort_by(deployments, &version))[].[version,state,containers.${CONTAINER_NAME}.image,createdAt]" --output text)"
[ -n "$VERSIONS" ] || die "no deployments exist yet; nothing to roll back to"
printf '%-8s %-12s %-36s %s\n' VERSION STATE IMAGE CREATED
while read -r version state image created; do
  marker=""
  [ "$version" = "$CURRENT_VERSION" ] && marker="  <- current"
  printf '%-8s %-12s %-36s %s%s\n' "$version" "$state" "$image" "$created" "$marker"
done <<<"$VERSIONS"

# Previously successful versions: ACTIVE or INACTIVE (superseded); FAILED ones are never offered.
CANDIDATES="$(awk -v cur="$CURRENT_VERSION" '$1 != cur && ($2 == "ACTIVE" || $2 == "INACTIVE") {print $1}' <<<"$VERSIONS")"
[ -n "$CANDIDATES" ] || die "no previous successful deployment to roll back to"
if [ -z "$TARGET" ]; then
  [ -t 0 ] || die "pass --version N (candidates: $(tr '\n' ' ' <<<"$CANDIDATES"))"
  DEFAULT="$(head -1 <<<"$CANDIDATES")"
  read -r -p "Version to restore [$DEFAULT]: " TARGET
  TARGET="${TARGET:-$DEFAULT}"
fi
grep -qx -- "$TARGET" <<<"$CANDIDATES" || die "version $TARGET is not a previous successful deployment (candidates: $(tr '\n' ' ' <<<"$CANDIDATES"))"
TARGET_IMAGE="$(awk -v v="$TARGET" '$1 == v {print $3}' <<<"$VERSIONS")"
require_stored_image "$TARGET_IMAGE"

SOURCE="$PRIVATE_TMP/source.json"
CURRENT="$PRIVATE_TMP/current.json"
NEXT="$PRIVATE_TMP/containers.json"
ENDPOINT="$PRIVATE_TMP/endpoint.json"
fetch_current_deployment "$CURRENT"
if [ "$RESTORE_CONFIG" = "1" ]; then
  step "Selected deployment $TARGET: image AND its environment (variable names only)"
  warn "--restore-config brings back the environment of deployment $TARGET, including any secret values rotated since"
  ( umask 077 && aws_ls get-container-service-deployments --service-name "$LIGHTSAIL_SERVICE" \
    --query "deployments[?version==\`$TARGET\`] | [0]" --output json >"$SOURCE" )
  node "$CONFIG_TOOL" from-deployment --deployment "$SOURCE" --out "$NEXT" --endpoint-out "$ENDPOINT"
  CHANGE="rollback-$TARGET+config"
else
  step "Selected deployment $TARGET: image $TARGET_IMAGE, current environment kept (variable names only)"
  node "$CONFIG_TOOL" from-current --current "$CURRENT" --image "$TARGET_IMAGE" --out "$NEXT"
  cp "$PUBLIC_ENDPOINT_FILE" "$ENDPOINT"
  CHANGE="rollback-$TARGET"
fi
node "$CONFIG_TOOL" summary --containers "$NEXT" --against "$CURRENT"
info "data is untouched and Prisma migrations are NOT reverted: an image older than the latest migration must still work with the current schema"

if [ "$DRY_RUN" = "1" ]; then
  echo
  ok "dry run: nothing was changed in AWS"
  exit 0
fi

confirm_change "Roll $LIGHTSAIL_SERVICE back to $TARGET_IMAGE (deployment $TARGET)?" "$CHANGE"
STATE="$(aws_ls create-container-service-deployment --service-name "$LIGHTSAIL_SERVICE" \
  --containers "file://$NEXT" --public-endpoint "file://$ENDPOINT" \
  --query 'containerService.state' --output text 2>&1)" || die "create-container-service-deployment failed: $(echo "$STATE" | redact_with "$NEXT" | tail -3)"
NEW_VERSION="$(aws_ls get-container-service-deployments --service-name "$LIGHTSAIL_SERVICE" --query 'max(deployments[].version)' --output text)"
ok "rollback deployment $NEW_VERSION requested (service state $STATE)"
STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
wait_for_deployment "$NEW_VERSION" || die "rollback deployment $NEW_VERSION did not become ACTIVE"
"$AWS_DIR/verify.sh" --since "$STARTED" ${VERIFY_ARGS[@]+"${VERIFY_ARGS[@]}"}
echo
ok "rolled back to $TARGET_IMAGE (deployment $TARGET) as deployment $NEW_VERSION"
