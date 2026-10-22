#!/usr/bin/env sh
# Build the API image, push it to the Lightsail container service and roll out a deployment.
#
# Usage (from anywhere):  apps/api/deploy/lightsail/deploy.sh [env-file]
#   env-file defaults to apps/api/.env.lightsail (gitignored by `.env*`; see .env.example).
# Requires: docker, aws CLI v2 with the lightsailctl plugin, node.
set -eu

SERVICE="${LIGHTSAIL_SERVICE:-gpderp-api}"
LABEL="${LIGHTSAIL_LABEL:-api}"
LOCAL_IMAGE="gpderp-api:latest"

cd "$(dirname "$0")/../.."
ENV_FILE="${1:-.env.lightsail}"
if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE (copy .env.example and fill production values)." >&2
  exit 1
fi

docker build --platform linux/amd64 -t "$LOCAL_IMAGE" .
aws lightsail push-container-image --service-name "$SERVICE" --label "$LABEL" --image "$LOCAL_IMAGE"

# Newest pushed image, e.g. ":gpderp-api.api.3".
LIGHTSAIL_IMAGE="$(aws lightsail get-container-images --service-name "$SERVICE" \
  --query 'containerImages[0].image' --output text)"
export LIGHTSAIL_IMAGE

RENDERED="$(mktemp)"
chmod 600 "$RENDERED"
trap 'rm -f "$RENDERED"' EXIT

set -a
# shellcheck disable=SC1090
. "./$ENV_FILE"
set +a
node deploy/lightsail/renderTemplate.mjs deploy/lightsail/containers.template.json > "$RENDERED"

aws lightsail create-container-service-deployment \
  --service-name "$SERVICE" \
  --containers "file://$RENDERED" \
  --public-endpoint "file://deploy/lightsail/public-endpoint.json"

echo "Deployment of $LIGHTSAIL_IMAGE requested. Watch: aws lightsail get-container-services --service-name $SERVICE"
