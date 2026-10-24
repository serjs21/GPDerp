#!/usr/bin/env bash
# Roll the service back to a previous deployment version's configuration (image + environment +
# public endpoint), as a NEW deployment. Never touches data and never reverts Prisma migrations.
#
#   infra/aws/rollback.sh [--version N] [--dry-run] [-- <verify.sh args>]
set -euo pipefail
. "$(dirname "$0")/lib/common.sh"

TARGET=""
DRY_RUN=0
VERIFY_ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --version) TARGET="$2"; shift 2 ;;
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

step "Selected deployment $TARGET (variable names only)"
SOURCE="$PRIVATE_TMP/source.json"
CURRENT="$PRIVATE_TMP/current.json"
NEXT="$PRIVATE_TMP/containers.json"
ENDPOINT="$PRIVATE_TMP/endpoint.json"
( umask 077 && aws_ls get-container-service-deployments --service-name "$LIGHTSAIL_SERVICE" \
  --query "deployments[?version==\`$TARGET\`] | [0]" --output json >"$SOURCE" )
fetch_current_deployment "$CURRENT"
node "$CONFIG_TOOL" from-deployment --deployment "$SOURCE" --out "$NEXT" --endpoint-out "$ENDPOINT"
node "$CONFIG_TOOL" summary --containers "$NEXT" --against "$CURRENT"
info "data is untouched and Prisma migrations are NOT reverted: an image older than the latest migration must still work with the current schema"

if [ "$DRY_RUN" = "1" ]; then
  echo
  ok "dry run: nothing was changed in AWS"
  exit 0
fi

confirm_service "Roll $LIGHTSAIL_SERVICE back to the configuration of deployment $TARGET?"
STATE="$(aws_ls create-container-service-deployment --service-name "$LIGHTSAIL_SERVICE" \
  --containers "file://$NEXT" --public-endpoint "file://$ENDPOINT" \
  --query 'containerService.state' --output text 2>&1)" || die "create-container-service-deployment failed: $(echo "$STATE" | redact | tail -3)"
NEW_VERSION="$(aws_ls get-container-service-deployments --service-name "$LIGHTSAIL_SERVICE" --query 'max(deployments[].version)' --output text)"
ok "rollback deployment $NEW_VERSION requested (service state $STATE)"
STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
wait_for_deployment "$NEW_VERSION" || die "rollback deployment $NEW_VERSION did not become ACTIVE"
"$AWS_DIR/verify.sh" --since "$STARTED" ${VERIFY_ARGS[@]+"${VERIFY_ARGS[@]}"}
echo
ok "rolled back to the configuration of deployment $TARGET (now deployment $NEW_VERSION)"
