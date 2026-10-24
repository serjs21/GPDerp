# API on AWS Lightsail Containers

Production deployment of the Fastify API (`apps/api`) as a single container on the **existing** Lightsail container
service `container-service-1` (us-east-2, Micro: 1 GB / 0.25 vCPU, scale 1).

Related: [local-docker-testing.md](local-docker-testing.md) (full local image test) ·
[websockets.md](websockets.md) (WebSocket behaviour, limits, metrics, multi-replica limitations).

| Script | What it does | Changes AWS? |
|---|---|---|
| [build.sh](build.sh) | `docker buildx` linux/amd64 image tagged with the git SHA, local smoke test | no |
| [push.sh](push.sh) | `push-container-image` (label `api`), prints the stored image id | uploads an image |
| [deploy.sh](deploy.sh) | composes the config, shows a names-only diff, **asks for confirmation**, deploys, waits, verifies | yes (confirmed) |
| [verify.sh](verify.sh) | deployment ACTIVE, HTTPS REST, DB via `/readyz`, WSS integration test, container logs | no |
| [rollback.sh](rollback.sh) | redeploys a previous version's configuration (**asks for confirmation**), verifies | yes (confirmed) |
| [release.sh](release.sh) | `build` → `push` → `deploy` (confirmation) → `verify` | yes (confirmed) |

None of the scripts creates, resizes or deletes a Lightsail service, deletes images or deployments, or runs Prisma
migrations.

## 1. Local tooling

- AWS CLI v2 (`brew install awscli`) and the **lightsailctl** plugin (`brew install aws/tap/lightsailctl`), which
  `push-container-image` needs.
- Docker Desktop with **Buildx** (on Apple Silicon the image is cross-built / emulated as linux/amd64).
- Node 22+ and pnpm (only for the local smoke test, `ws-integration-test.mjs` and migrations), `curl`, `git`.
- For the build smoke test: the local Postgres from `apps/api/docker-compose.yml` and `apps/api/.env`.

## 2. AWS authentication

The scripts use the normal AWS CLI credential chain; pick the profile with `AWS_PROFILE`. The service runs in the
Organizations **management account** (311883575175; member accounts are limited to us-east-1 / us-west-2 /
eu-north-1 by the org's region SCP). Deploys use the least-privilege role **`GpderpLightsailDeployer`** in that account,
assumed from your login to the `gpderp` member account (267950238053) — no root, no long-term keys:

```bash
aws login --profile gpderp-member            # browser sign-in to the gpderp member account
export AWS_PROFILE=gpderp-deployer           # assumes arn:aws:iam::311883575175:role/GpderpLightsailDeployer
aws sts get-caller-identity                  # account 311883575175, assumed-role/GpderpLightsailDeployer/...
```

`~/.aws/config`:

```ini
[profile gpderp-member]
region = us-east-1

[profile gpderp-deployer]
role_arn = arn:aws:iam::311883575175:role/GpderpLightsailDeployer
source_profile = gpderp-member
role_session_name = gpderp-lightsail-deploy
region = us-east-2
```

The role ([iam/deployer-trust-policy.json](iam/deployer-trust-policy.json),
[iam/deployer-permissions-policy.json](iam/deployer-permissions-policy.json)) can only be assumed by the member
account's `AccountFullAccessRole` inside org `o-4uj1odpsdw`, sessions last 1 h, and it allows exactly: reading
container services / images / deployments / logs / metrics in us-east-2, registry login, and registering images and
creating deployments on `container-service-1`. It cannot create, resize, disable or delete services or images, or
touch anything outside Lightsail containers. Update it with
`aws iam put-role-policy --role-name GpderpLightsailDeployer --policy-name LightsailContainerService1Deploy --policy-document file://infra/aws/iam/deployer-permissions-policy.json`
(as an admin of the management account).

Every script starts with a **preflight**: it prints the caller identity, refuses any account other than
`EXPECTED_ACCOUNT_ID`, checks that `container-service-1` exists in us-east-2 with power `micro` and scale `1`, and
continues only while the service is `READY` or `RUNNING` (it stops on `PENDING`, `DEPLOYING`, `UPDATING`, `DISABLED`).

Root credentials (`aws login` as the management account root) still work but preflight warns about them; keep root
for account administration only.

## 3. Service and region configuration

[config/lightsail.env](config/lightsail.env) (committed, no secrets; every value can be overridden from the environment):

| Setting | Value |
|---|---|
| `LIGHTSAIL_SERVICE` / `AWS_REGION` | `container-service-1` / `us-east-2` |
| `CONTAINER_NAME` / `IMAGE_LABEL` / `CONTAINER_PORT` | `api` / `api` / `8080` |
| `EXPECTED_POWER` / `EXPECTED_SCALE` / `EXPECTED_ACCOUNT_ID` | `micro` / `1` / `311883575175` |
| `RUNTIME_ENV_FILE` | `apps/api/.env.lightsail` (gitignored) |
| `WEB_ORIGIN` | `https://gpderp.party` (Origin used by the WebSocket checks) |

Public endpoint ([config/public-endpoint.json](config/public-endpoint.json)): container `api`, port 8080, health check
`GET /healthz` (200–299, every 10 s). Default domain:
`https://container-service-1.drt7c1fgdcdhp.us-east-2.cs.amazonlightsail.com` (preflight prints it). The custom domain
`api.gpderp.party` comes later (see [Remaining manual steps](#remaining-manual-steps)).

## 4. Runtime environment variables

Defined in [config/runtime-env.json](config/runtime-env.json) — the only names the tooling ever sends to Lightsail.
Values are never printed: the scripts show variable **names** (set / missing / added / removed / changed) only.

| Group | Variables (required unless marked optional) |
|---|---|
| Fixed defaults | `NODE_ENV=production`, `PORT=8080`, `TRUST_PROXY_HOPS=1`, `NODE_OPTIONS=--max-old-space-size=512`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=lax`, `DEBUG_AUTH_LOGS=false`, `HAIKU_GENERATION_API=prod` |
| Database (secret) | `DATABASE_URL` (Neon pooled, `-pooler` host), `DATABASE_URL_UNPOOLED` (Neon direct) — from `apps/api/.env.neon` |
| URLs / cookies | `CLIENT_URL`, `WEB_APP_URL` (`https://gpderp.party`), `API_BASE_URL`, `COOKIE_DOMAIN` (`.gpderp.party`) |
| Auth | `JWT_ACCESS_SECRET` (secret, 32+), `TOKEN_HASH_PEPPER` (secret, 16+), `ACCESS_TOKEN_TTL_SECONDS`, `REFRESH_TOKEN_TTL_SECONDS`, `SESSION_TTL_SECONDS`, `GOOGLE_CLIENT_ID` (optional) |
| R2 | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID` (secret), `R2_SECRET_ACCESS_KEY` (secret), `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`, `R2_REGION` / `R2_S3_ENDPOINT` (optional) |
| Paddle | `PADDLE_API_KEY` (secret), `PADDLE_WEBHOOK_SECRET` (secret), `PADDLE_ENV`, `PADDLE_PRICE_ID_100_HAIKUS` |
| Email | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (secret), `MAIL_FROM`, `SMTP_SECURE` (optional) |
| AI | `OPENAI_API_KEY` (secret) |
| Optional | `CORS_METHODS`, `CORS_HEADERS`, `CORS_CREDENTIALS`, `ICON_UPLOAD_DEBUG` |

Lightsail stores these as deployment configuration (visible to anyone with Lightsail read access).
`aws lightsail get-container-services` without `--query` prints every value — the scripts never do that.

## 5. Build an image

```bash
infra/aws/build.sh                 # buildx --platform linux/amd64 --load, tags gpderp-api:<sha> and :latest
infra/aws/build.sh --skip-smoke    # build only
```

Build context is `apps/api` ([Dockerfile](../../apps/api/Dockerfile): pnpm `--frozen-lockfile`, `prisma generate`,
`tsc`, then a runtime stage with production dependencies only, the generated Prisma client, `USER node`). `.env*`,
`.neon`, tests, scripts and dev tooling are excluded by [.dockerignore](../../apps/api/.dockerignore); no secret is
a build argument. Uncommitted changes in `apps/api` produce a `-dirty` tag (with a warning).

The smoke test runs the image (amd64 emulation, 1 GB limit) against the local Postgres, requires `/healthz` and
`/readyz` to return 200, checks that the image carries no runtime env and no `.env` files, and checks a clean
SIGTERM shutdown. The full local suite (REST, WebSockets, Neon read-only, secret scan) is
`infra/aws/scripts/local-docker-test.sh`.

## 6. Push an image

```bash
infra/aws/push.sh                          # image for the current commit
infra/aws/push.sh gpderp-api:<sha>         # a specific local tag
```

Runs `aws lightsail push-container-image --service-name container-service-1 --label api --region us-east-2`,
captures the stored identifier (`:container-service-1.api.<N>`), confirms it is listed by `get-container-images`,
and records it in `infra/aws/.state/last-image` (gitignored, used by `deploy.sh`). Older images are kept.

## 7. First deployment

Option A — runtime env file (recommended):

1. Create `apps/api/.env.lightsail` (gitignored; `chmod 600`) with every required variable from section 4. The
   database values come from `apps/api/.env.neon`; generate new `JWT_ACCESS_SECRET` / `TOKEN_HASH_PEPPER`
   (`openssl rand -base64 48`). Other keys in the file are ignored.
2. Check the migrations are applied: `(cd apps/api && pnpm migrate:status:prod)`.
3. Dry run (reads AWS only, validates the file, prints names):

   ```bash
   AWS_PROFILE=gpderp-deployer infra/aws/deploy.sh --dry-run
   ```

4. Release (build → push → deploy with confirmation → verify):

   ```bash
   AWS_PROFILE=gpderp-deployer infra/aws/release.sh
   ```

   or step by step: `build.sh`, `push.sh`, `deploy.sh` (type `container-service-1` to confirm), `verify.sh`.

Option B — Lightsail console: create the first deployment by hand (Lightsail → Containers → container-service-1 →
Deployments → Create your first deployment): container name `api`, image `:container-service-1.api.<N>` (from
`push.sh`), add each variable from section 4 under **Environment variables**, open port `8080` / `HTTP`, public
endpoint `api` with health check path `/healthz`. Later deployments with `deploy.sh` then keep that configuration.

## 8. Later deployments

```bash
AWS_PROFILE=gpderp-deployer infra/aws/release.sh
# or: infra/aws/build.sh && infra/aws/push.sh && infra/aws/deploy.sh
```

`deploy.sh` reads the **current** deployment's configuration (into a private 0600 temp file, never printed), keeps
every value, and only swaps the image. To change configuration, pass an env file containing just the variables to
change: `infra/aws/deploy.sh --env-file /path/to/changes.env` — empty values never overwrite existing ones, and the
deployment is refused if any required variable would be missing. Before confirming you see the image change and the
variable names added / removed / changed. Non-interactive confirmation: `CONFIRM_DEPLOY=container-service-1`.

Lightsail keeps serving the previous deployment until the new one passes its health check; a `FAILED` deployment
leaves the old one active.

## 9. Verify REST, WebSockets and streaming

```bash
infra/aws/verify.sh                                   # runs automatically after deploy / rollback
infra/aws/verify.sh --idle 125m                       # long idle WebSocket test (5 / 30 / 120 min checkpoints)
TEST_EMAIL=you@example.com TEST_PASSWORD_FILE=~/.gpderp-test-password infra/aws/verify.sh --allow-writes
infra/aws/verify.sh --generate                        # also streams one real haiku (one credit, OpenAI call)
```

Checks: deployment `ACTIVE`; `GET /healthz` 200 and `GET /readyz` 200 (database round trip through the app) over
HTTPS with a verified certificate; CORS preflight for `WEB_ORIGIN`; `/ws-check` client IP equals your public IP
(validates `TRUST_PROXY_HOPS`); [ws-integration-test.mjs](scripts/ws-integration-test.mjs) over `wss://`
(upgrade through the Lightsail proxy, ping/pong, Origin enforcement, authenticated tabs when credentials are given,
idle connections, reconnect after loss — upgrade rejections and idle closes are reported as failures); container
logs since the deployment scanned for fatal errors (shown redacted). **SSE:** the API has no SSE routes; streamed
output is the WebSocket `delta` sequence (`--generate`). Authentication is never bypassed; passwords come from
`TEST_PASSWORD`, `TEST_PASSWORD_FILE` (chmod 600) or a hidden prompt and are never printed.

## 10. Logs

```bash
aws lightsail get-container-log --region us-east-2 --service-name container-service-1 --container-name api \
  --start-time "$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ)" --query 'logEvents[].message' --output text | tr '\t' '\n'
```

Logs are JSON (pino); cookies, `authorization`, CSRF / tab headers and database URLs are redacted by the app. A
`WS metrics` line every minute summarises WebSocket connections. Console: Lightsail → container-service-1 → Logs.

## 11. Roll back

```bash
infra/aws/rollback.sh                 # lists versions, marks the current one, asks which to restore
infra/aws/rollback.sh --version 3     # or pick directly; --dry-run shows the change only
```

Restores the selected previous successful deployment's image, environment and endpoint as a **new** deployment
(after showing names-only differences and asking for confirmation), waits for `ACTIVE` and runs `verify.sh`. Data is
never touched and **migrations are not reverted** — an older image must still work with the current schema (write
migrations expand-first, see below). No deployment version or image is deleted.

## 12. Troubleshooting

| Symptom | Check |
|---|---|
| Preflight: `PENDING` / `DEPLOYING` | wait; another change is in progress. The scripts never force it. |
| Deployment `FAILED` | `deploy.sh` prints the last log lines. Usual causes: a missing / invalid variable (the app exits with `Missing required environment variable: …`), Neon unreachable, image not amd64. The previous deployment keeps serving. |
| Health check failing | the container must answer `GET /healthz` on 8080 within 5 s; `/healthz` never touches the DB. Check logs for startup errors. |
| Memory | Micro has 1 GB; the heap is capped at 512 MB (`NODE_OPTIONS`). Watch Lightsail metrics; scale **power** (not nodes) if needed — manually, never via these scripts. |
| `/readyz` 503 | database unreachable: Neon status, `DATABASE_URL` (`-pooler` host, `sslmode=require`), `pnpm check-db` from a workstation. Neon cold starts are absorbed by a 15 s connect timeout. |
| `/ws` 403 | `Origin` not in `CLIENT_URL` (CSWSH guard for cookie-bearing handshakes). |
| `/ws` 429 | per-IP (60) / per-user (20) / per-tab (2) limits; see `/ws-check` → `ws.rejected`. |
| Client IP wrong in `/ws-check` | set `TRUST_PROXY_HOPS` to the number of proxies in front of the container. |
| Idle WebSockets closing | the server pings every 25 s; if `verify.sh --idle` still reports closes, the proxy idle timeout is shorter — report it with the timing printed by the test. |
| Push fails | `lightsailctl` installed? Docker running? Image built for amd64 (`build.sh` checks)? |

## 13. Migrating away from AWS later

The deployable unit is a plain OCI image (`gpderp-api:<sha>`) configured only through the environment variables in
section 4, with `/healthz` for liveness and `/readyz` for readiness, listening on `$PORT`, handling `SIGTERM`. The
database stays on Neon and files on R2, so moving to any container host (Fly.io, Render, Railway, ECS/Fargate, a VM
with Docker) means: push the same image to that host's registry, set the same variables (+ `TRUST_PROXY_HOPS` for its
proxy chain), point the health check at `/healthz`, keep a single instance (or add cross-instance fan-out first, see
[websockets.md](websockets.md#multiple-replicas-limitations)), then switch the `api` DNS record. Nothing in the
application is Lightsail-specific; only `infra/aws/` is.

---

## Architecture

```
Browser / gpderp.party (Cloudflare Worker)
        │  HTTPS + WSS (cookies on .gpderp.party)
        ▼
Lightsail public endpoint (default domain, later api.gpderp.party) ── TLS terminates here
        │  HTTP :8080
        ▼
Fastify container (1 instance, Micro: 1 GB / 0.25 vCPU)
  REST routes · GET /ws (WebSocket, same server) · /healthz · /readyz
        │
        ├─ Neon Postgres, pooled  (DATABASE_URL, -pooler host)  ← Prisma app queries
        ├─ Neon Postgres, direct  (DATABASE_URL_UNPOOLED)       ← pg-boss jobs, Prisma Migrate (offline)
        └─ R2, SMTP (smtp.gmail.com:587), Paddle, OpenAI, Google token APIs (egress 443/587)
```

- One HTTP server serves REST and WebSocket (`@fastify/websocket` on `/ws`); there is no separate socket server.
- There are no SSE routes. Haiku generation streams `start` / `delta` / `saved` messages over the WebSocket while
  `POST /beer_me_haiku` is in flight.
- WebSocket registries and in-flight generations are in process memory: **keep scale at 1** (see
  [websockets.md](websockets.md#multiple-replicas-limitations)).

## Health

| Route | Purpose | Behaviour |
|---|---|---|
| `GET /healthz` | Liveness; **Lightsail health check** | `200 {"ok":true}`, never touches the database |
| `GET /readyz` | Readiness / diagnostics | `SELECT 1` through Prisma with a 3 s timeout: `200 {"ok":true,"db":"up"}` or `503 {"ok":false,"db":"down"}` (details only in logs) |
| `GET /health` | Legacy alias of `/healthz` | `200 {"ok":true}` |
| `GET /ws-check` | WebSocket diagnostics | `{ ok, pid, clientIp, ws: {counts} }` — no identifiers |

Lightsail restarts containers that fail its health check, so it points at `/healthz` rather than `/readyz`: a Neon
cold start or blip should not cause a restart loop. During shutdown Fastify answers new requests with 503.

## Shutdown

On `SIGTERM` (deploys, restarts) the server calls `app.close()`: WebSocket clients get close code 1012 and reconnect
with jitter, pg-boss stops gracefully (in-flight postcard jobs finish), Prisma disconnects. If that takes more than
25 s the process force-exits. Deploys therefore drop open sockets and interrupt in-flight generations (the web client
recovers the saved haiku over REST).

## Database (Prisma 7.5 + Neon)

Follows Neon's Prisma 7 setup: no `url` in `schema.prisma`, the CLI reads `DATABASE_URL_UNPOOLED` through
[prisma.config.ts](../../apps/api/prisma.config.ts), the app uses the pooled `DATABASE_URL`. The runtime uses
`@prisma/adapter-pg` (TCP, node-postgres) rather than Neon's serverless WebSocket adapter because the API is a
long-lived container. `prisma`, `@prisma/client` and `@prisma/adapter-pg` are all pinned to 7.5.0.

| Client | URL | Pool (per container) | Notes |
|---|---|---|---|
| Prisma singleton ([src/lib/prisma.ts](../../apps/api/src/lib/prisma.ts)) | `DATABASE_URL` (pooler) | max 5, idle 30 s, connect timeout 15 s, keep-alive | `application_name=gpderp-api` |
| pg-boss (postcard queue) | `DATABASE_URL_UNPOOLED` (direct) | max 3, idle 10 s, connect timeout 10 s | `application_name=pgboss`; needs session features, so not the pooler |
| Prisma CLI (migrations, workstation only) | `DATABASE_URL_UNPOOLED` | — | never runs in the container |

Values live in [src/consts/database.ts](../../apps/api/src/consts/database.ts). At most 3 direct sessions per
container (6 briefly during a deploy while old and new containers overlap), far below a 0.25 CU compute's
`max_connections`; the pooled side is multiplexed by PgBouncer.

- **TLS:** for every non-local host the runtime pins `sslmode=verify-full` (certificate + hostname verified) and
  refuses `disable` / `allow` / `prefer` ([src/utils/databaseUrl.ts](../../apps/api/src/utils/databaseUrl.ts)).
  The env values can keep Neon's default `sslmode=require&channel_binding=require`.
- **Scale to zero:** idle sockets close after 30 s (before Neon suspends an idle compute after 5 min), dropped
  sockets are evicted by the pool's error handler (logged as `[prisma] pool error {code, message}` without URLs) and
  the next query reconnects, waiting up to 15 s for the compute to wake. Queries are not retried automatically
  (writes are not idempotent); `/readyz` shows the current state. pg-boss polls every few seconds, which keeps the
  compute awake while the API runs — expect it to bill compute time continuously.
- **Logging:** database URLs are validated without echoing their values, and startup / pool / pg-boss errors are
  logged as code + message with any `postgres://…` redacted.

Read-only connection check (Prisma singleton, TLS protocol/cipher, masked host):

```bash
cd apps/api
sh -c 'set -a && . ./.env.neon && set +a && pnpm check-db'
```

## Database migrations

Migrations never run on container start and are never run by the deployment scripts. Apply them from a workstation
(or CI) **before** deploying an image that needs them, with
[scripts/migrate-deploy-prod.sh](../../apps/api/scripts/migrate-deploy-prod.sh):

```bash
cd apps/api
pnpm migrate:status:prod                        # read-only; exit 0 = up to date, 2 = pending
pnpm migrate:prod                               # status, then type the database name to confirm, then deploy
CONFIRM_PROD_MIGRATE=neondb pnpm migrate:prod   # non-interactive (CI)
```

The script reads only `DATABASE_URL_UNPOOLED` from `.env.neon` (override with `MIGRATE_ENV_FILE`), refuses a
`-pooler` host or a URL without TLS, stops on failed migrations / drift / connectivity errors, and redacts URLs and
the Neon endpoint id from its output. It only runs `prisma migrate status` and `prisma migrate deploy` — never
`db push`, `migrate reset`, `migrate dev` or seeds. Optionally create a Neon branch (point-in-time backup) in the
console before applying a destructive migration.

Write migrations to be compatible with the previous image (expand first, contract in a later release) so the old
container keeps working during the switch and after a rollback.

## Remaining manual steps

1. Fill `apps/api/.env.lightsail` (production values) — or use the console (section 7, option B).
2. Approve and run the first release (`infra/aws/release.sh`).
3. Deploy with `AWS_PROFILE=gpderp-deployer` (section 2) instead of root.
4. Custom domain: Lightsail → Certificates → create for `api.gpderp.party`, add the validation CNAMEs in Cloudflare
   DNS, attach the certificate to `container-service-1`, then a **DNS-only** CNAME `api` → the service's default domain.
5. Afterwards (not yet): Paddle notification URL `https://api.gpderp.party/webhooks/paddle`; web build env
   `NEXT_PUBLIC_API_BASE_URL=https://api.gpderp.party`, `NEXT_PUBLIC_WS_URL=wss://api.gpderp.party/ws`, redeploy the Worker.
