#!/usr/bin/env bash
# One command for a release: build + local smoke test, push, deploy (asks for confirmation), verify.
# Stops at the first failure. Never runs Prisma migrations: apply them first if the release needs them
# (cd apps/api && pnpm migrate:status:prod && pnpm migrate:prod).
#
#   infra/aws/release.sh [--env-file <file>] [--skip-smoke] [-- <verify.sh args, e.g. --idle 5m>]
set -euo pipefail
. "$(dirname "$0")/lib/common.sh"

BUILD_ARGS=()
DEPLOY_ARGS=()
VERIFY_ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --skip-smoke) BUILD_ARGS+=(--skip-smoke); shift ;;
    --env-file) DEPLOY_ARGS+=(--env-file "$2"); shift 2 ;;
    --) shift; VERIFY_ARGS=("$@"); break ;;
    *) die "unknown option $1" ;;
  esac
done

"$AWS_DIR/build.sh" ${BUILD_ARGS[@]+"${BUILD_ARGS[@]}"}
"$AWS_DIR/push.sh" "$(local_image_tag)"
"$AWS_DIR/deploy.sh" --image "$(cat "$STATE_DIR/last-image")" ${DEPLOY_ARGS[@]+"${DEPLOY_ARGS[@]}"} -- ${VERIFY_ARGS[@]+"${VERIFY_ARGS[@]}"}
