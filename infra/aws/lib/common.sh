# Shared helpers for the infra/aws Lightsail scripts. Source it; do not execute it.
# shellcheck shell=bash

AWS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$AWS_DIR/../.." && pwd)"
API_DIR="$REPO_ROOT/apps/api"
STATE_DIR="$AWS_DIR/.state"
CONFIG_TOOL="$AWS_DIR/lib/lightsail-config.mjs"
PUBLIC_ENDPOINT_FILE="$AWS_DIR/config/public-endpoint.json"
# shellcheck source=../config/lightsail.env
. "$AWS_DIR/config/lightsail.env"
export AWS_REGION AWS_PAGER=""

info() { echo "INFO $*"; }
ok() { echo "OK   $*"; }
warn() { echo "WARN $*" >&2; }
die() { echo "FAIL $*" >&2; exit 1; }
step() { echo; echo "== $*"; }

# Strips credentials from any text before it reaches the terminal (database URLs, bearer tokens,
# cookies, Neon passwords, AWS access keys).
redact() {
  sed -E \
    -e 's#postgres(ql)?://[^[:space:]"]+#postgres://<redacted>#g' \
    -e 's#(Bearer )[A-Za-z0-9._~+/=-]+#\1<redacted>#g' \
    -e 's#((access|refresh|csrf)_token=)[^;[:space:]"]+#\1<redacted>#g' \
    -e 's#npg_[A-Za-z0-9]+#npg_<redacted>#g' \
    -e 's#(AKIA|ASIA)[A-Z0-9]{16}#<aws-key-redacted>#g'
}

require_tools() {
  local missing=()
  for tool in "$@"; do
    case "$tool" in
      buildx) docker buildx version >/dev/null 2>&1 || missing+=("docker buildx (Docker Desktop >= 4 / docker-buildx-plugin)") ;;
      lightsailctl) command -v lightsailctl >/dev/null 2>&1 || missing+=("lightsailctl (brew install aws/tap/lightsailctl)") ;;
      aws) command -v aws >/dev/null 2>&1 || missing+=("aws CLI v2 (brew install awscli)") ;;
      *) command -v "$tool" >/dev/null 2>&1 || missing+=("$tool") ;;
    esac
  done
  [ "${#missing[@]}" -eq 0 ] || die "missing tools: ${missing[*]}"
}

# Every Lightsail call is pinned to the configured region; AWS_PROFILE is honoured by the CLI.
aws_ls() { aws lightsail "$@" --region "$AWS_REGION"; }

# Private temp dir (0700) removed on exit; holds rendered configs that contain secret values.
make_private_tmp() {
  PRIVATE_TMP="$(mktemp -d)"
  chmod 700 "$PRIVATE_TMP"
  trap 'rm -rf "$PRIVATE_TMP"' EXIT
}

git_sha() { git -C "$REPO_ROOT" rev-parse --short=12 HEAD; }

# Local image tag for the current commit; "-dirty" when the working tree has uncommitted changes.
local_image_tag() {
  local sha
  sha="$(git_sha)"
  if [ -n "$(git -C "$REPO_ROOT" status --porcelain -- apps/api)" ]; then sha="$sha-dirty"; fi
  echo "$LOCAL_IMAGE_REPO:$sha"
}

# Explicit approval for one specific production change. Interactive: type the service name.
# Non-interactive: CONFIRM_DEPLOY must name THIS change (e.g. container-service-1:deploy-3), so a value
# left in the environment can never approve a different deployment or rollback.
confirm_change() {
  local prompt="$1" change="$2" expected answer
  expected="$LIGHTSAIL_SERVICE:$change"
  if [ -n "${CONFIRM_DEPLOY:-}" ]; then
    [ "$CONFIRM_DEPLOY" = "$expected" ] || die "CONFIRM_DEPLOY does not match this change (expected $expected); nothing changed"
    info "approved non-interactively for $expected"
    return 0
  fi
  [ -t 0 ] || die "explicit approval required: re-run interactively or set CONFIRM_DEPLOY=$expected"
  read -r -p "$prompt Type the service name ($LIGHTSAIL_SERVICE) to approve: " answer
  [ "$answer" = "$LIGHTSAIL_SERVICE" ] || die "not approved; nothing changed"
}

# Pattern redaction plus every sensitive value of the given config file (secrets, DB URLs).
redact_with() {
  redact | node "$CONFIG_TOOL" redact --containers "$1"
}

# Read-only checks before any push/deploy. Never creates, resizes or deletes anything.
# Exports SERVICE_STATE, SERVICE_URL, CURRENT_VERSION, CURRENT_STATE, NEXT_STATE.
preflight() {
  step "AWS preflight (profile: ${AWS_PROFILE:-default}, region: $AWS_REGION, service: $LIGHTSAIL_SERVICE)"
  local identity account arn
  identity="$(aws sts get-caller-identity --query '[Account,Arn]' --output text 2>&1)" ||
    die "AWS authentication failed: $(echo "$identity" | redact | tail -1) (run: aws login / aws sso login --profile ...)"
  account="$(echo "$identity" | cut -f1)"
  arn="$(echo "$identity" | cut -f2)"
  ok "authenticated as $arn (account $account)"
  if [ -n "$EXPECTED_ACCOUNT_ID" ] && [ "$account" != "$EXPECTED_ACCOUNT_ID" ]; then
    die "account $account is not the expected $EXPECTED_ACCOUNT_ID (set AWS_PROFILE or EXPECTED_ACCOUNT_ID)"
  fi
  case "$arn" in *":root") warn "using the account ROOT credentials; prefer an IAM user/role limited to Lightsail" ;; esac

  # The query never selects container environments, so no secret value is read here.
  local service
  service="$(aws_ls get-container-services --service-name "$LIGHTSAIL_SERVICE" \
    --query 'containerServices[0].[state,power,scale,url,isDisabled,currentDeployment.version,currentDeployment.state,nextDeployment.state]' \
    --output text 2>&1)" ||
    die "cannot read service $LIGHTSAIL_SERVICE in $AWS_REGION: $(echo "$service" | redact | tail -1). This tooling never creates services."
  read -r SERVICE_STATE power scale SERVICE_URL disabled CURRENT_VERSION CURRENT_STATE NEXT_STATE <<<"$service"
  SERVICE_URL="${SERVICE_URL%/}"
  export SERVICE_STATE SERVICE_URL CURRENT_VERSION CURRENT_STATE NEXT_STATE

  ok "service state $SERVICE_STATE, power $power, scale $scale, url $SERVICE_URL"
  info "current deployment: ${CURRENT_VERSION/None/none} (${CURRENT_STATE/None/-}), next deployment: ${NEXT_STATE/None/none}"
  [ "$power" = "$EXPECTED_POWER" ] || die "power is $power, expected $EXPECTED_POWER (this tooling never changes power)"
  [ "$scale" = "$EXPECTED_SCALE" ] || die "scale is $scale, expected $EXPECTED_SCALE (this tooling never changes scale)"
  [ "$disabled" = "False" ] || die "service is disabled"
  case "$SERVICE_STATE" in
    READY | RUNNING) ;;
    PENDING) die "service is PENDING (still being created); wait until it is READY, then re-run" ;;
    DEPLOYING | UPDATING) die "service is $SERVICE_STATE (a change is in progress); wait for it to finish" ;;
    *) die "service state $SERVICE_STATE; refusing to continue" ;;
  esac
}

# Fails unless `image` (e.g. ":container-service-1.api.3") is stored in the service.
require_stored_image() {
  local image="$1" images
  images="$(aws_ls get-container-images --service-name "$LIGHTSAIL_SERVICE" --query 'containerImages[].image' --output text)"
  tr '\t' '\n' <<<"$images" | grep -qxF -- "$image" || die "image $image is not stored in $LIGHTSAIL_SERVICE (push it first)"
}

# Writes the current or a given deployment JSON to a private file without printing it.
fetch_current_deployment() {
  local out="$1"
  ( umask 077 && aws_ls get-container-services --service-name "$LIGHTSAIL_SERVICE" \
    --query 'containerServices[0].currentDeployment' --output json >"$out" )
}

# Polls until the latest deployment settles. Prints the final state; returns non-zero unless ACTIVE.
wait_for_deployment() {
  local version="$1" timeout_s="${2:-1200}" started state
  started="$(date +%s)"
  while :; do
    state="$(aws_ls get-container-service-deployments --service-name "$LIGHTSAIL_SERVICE" \
      --query "deployments[?version==\`$version\`].state | [0]" --output text 2>/dev/null || echo UNKNOWN)"
    case "$state" in
      ACTIVE) ok "deployment $version is ACTIVE after $(( $(date +%s) - started ))s"; return 0 ;;
      FAILED) echo "FAIL deployment $version FAILED after $(( $(date +%s) - started ))s"; return 1 ;;
    esac
    if [ $(( $(date +%s) - started )) -ge "$timeout_s" ]; then
      echo "FAIL deployment $version still $state after ${timeout_s}s"
      return 1
    fi
    info "deployment $version: $state ($(( $(date +%s) - started ))s)"
    sleep 15
  done
}
