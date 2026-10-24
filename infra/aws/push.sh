#!/usr/bin/env bash
# Push a locally built image to the EXISTING Lightsail container service (label "api").
#
#   infra/aws/push.sh [gpderp-api:<tag>]      (default: the image for the current commit)
#
# Prints the stored image identifier (e.g. ":container-service-1.api.3") and records it in
# infra/aws/.state/last-image for deploy.sh. Previous images are never deleted.
set -euo pipefail
. "$(dirname "$0")/lib/common.sh"

require_tools aws lightsailctl docker git
IMAGE="${1:-$(local_image_tag)}"
docker image inspect "$IMAGE" >/dev/null 2>&1 || die "local image $IMAGE not found (run infra/aws/build.sh)"
ARCH="$(docker image inspect -f '{{.Architecture}}/{{.Os}}' "$IMAGE")"
[ "$ARCH" = "amd64/linux" ] || die "$IMAGE is $ARCH; Lightsail needs amd64/linux (build with infra/aws/build.sh)"
case "$IMAGE" in *-dirty) warn "pushing an image built from uncommitted changes ($IMAGE)" ;; esac

preflight

step "Push $IMAGE to $LIGHTSAIL_SERVICE (label $IMAGE_LABEL)"
mkdir -p "$STATE_DIR"
LOG="$(mktemp)"
trap 'rm -f "$LOG"' EXIT
# lightsailctl (Go SDK) cannot read `aws login` / SSO session credentials, so it gets the current
# short-lived credentials as environment variables, scoped to this subshell and never printed.
if ! (
  CREDS="$(aws configure export-credentials --format env-no-export 2>/dev/null)" || die "cannot export the current AWS credentials for lightsailctl"
  while IFS= read -r line; do
    case "$line" in AWS_ACCESS_KEY_ID=* | AWS_SECRET_ACCESS_KEY=* | AWS_SESSION_TOKEN=* | AWS_CREDENTIAL_EXPIRATION=*) export "${line?}" ;; esac
  done <<<"$CREDS"
  # A profile name would be forwarded to lightsailctl, which then ignores the exported credentials.
  unset AWS_PROFILE AWS_DEFAULT_PROFILE
  aws_ls push-container-image --service-name "$LIGHTSAIL_SERVICE" --label "$IMAGE_LABEL" --image "$IMAGE"
) 2>&1 | tee "$LOG" | redact; then
  die "push-container-image failed"
fi

# lightsailctl prints: Refer to this image as ":container-service-1.api.3" in deployments.
STORED="$(grep -oE "\":${LIGHTSAIL_SERVICE}\.${IMAGE_LABEL}\.[0-9]+\"" "$LOG" | tail -1 | tr -d '"')"
[ -n "$STORED" ] || die "could not find the stored image identifier in the push output"
require_stored_image "$STORED"
VERSION="${STORED##*.}"

echo "$STORED" >"$STATE_DIR/last-image"
printf '%s %s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$STORED" "$IMAGE" >>"$STATE_DIR/push-history"

echo
ok "stored image: $STORED (label $IMAGE_LABEL, version $VERSION) from $IMAGE"
echo "Next: infra/aws/deploy.sh --image $STORED"
