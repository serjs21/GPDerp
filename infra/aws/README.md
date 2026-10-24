# API on AWS Lightsail Containers

Production deployment of the Fastify API (`apps/api`) as a single Lightsail container.
Local verification of the image: [local-docker-testing.md](local-docker-testing.md).

## Architecture

```
Browser / gpderp.party (Cloudflare Worker)
        │  HTTPS + WSS (cookies on .gpderp.party)
        ▼
Lightsail public endpoint  api.gpderp.party  ── TLS terminates here
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
- WebSocket registries and in-flight generations are in process memory: **keep scale at 1**.
  The server pings sockets every 25 s (keeps them alive through the load balancer, evicts dead ones).

## Image

Built from [apps/api/Dockerfile](../../apps/api/Dockerfile) with build context `apps/api` (a standalone pnpm project
with its own lockfile and no `workspace:` dependencies; the frontend is never in the context).

| Stage | What happens |
|---|---|
| `build` | `pnpm install --frozen-lockfile` (pnpm 10.27 via corepack), `prisma generate`, `pnpm build` (tsc → `dist/`, copies assets, the payments prompt and the generated Prisma client) |
| `prod-deps` | `pnpm install --prod --frozen-lockfile` on Linux, so native binaries (argon2, @resvg/resvg-js) match the image |
| `runtime` | `node:22-bookworm-slim` (Node 22 LTS, supported by Prisma 7.5), `dist/` + production `node_modules` + `package.json`, `USER node`, `NODE_ENV=production`, `PORT=8080`, `NODE_OPTIONS=--max-old-space-size=512` |

Not in the image: sources, tests, Prisma CLI / schema engine, dev tooling, `scripts/`, `deploy/`, and every `.env*` /
`.neon` file ([apps/api/.dockerignore](../../apps/api/.dockerignore)). No secret is passed as a build argument; all
credentials are runtime environment variables. Compressed size is about 325 MB.

Fastify listens on `0.0.0.0:$PORT` and trusts `X-Forwarded-For` from the endpoint (`trustProxy`).

## Health

| Route | Purpose | Behaviour |
|---|---|---|
| `GET /healthz` | Liveness; **Lightsail health check** | `200 {"ok":true}`, never touches the database |
| `GET /readyz` | Readiness / diagnostics | `SELECT 1` through Prisma with a 3 s timeout: `200 {"ok":true,"db":"up"}` or `503 {"ok":false,"db":"down"}` (details only in logs) |
| `GET /health` | Legacy alias of `/healthz` | `200 {"ok":true}` |

Lightsail restarts containers that fail its health check, so it points at `/healthz` rather than `/readyz`: a Neon
cold start or blip should not cause a restart loop. During shutdown Fastify answers new requests with 503.

## Shutdown

On `SIGTERM` (deploys, restarts) the server calls `app.close()`, which stops accepting requests, closes WebSocket
clients (they reconnect with backoff), stops pg-boss gracefully (in-flight postcard jobs finish), clears the socket
heartbeat and disconnects Prisma. If that takes more than 25 s the process force-exits. Deploys therefore drop open
sockets and interrupt in-flight generations.

## Environment variables

Set on the container deployment (never in the image). The full list with placeholders is
[apps/api/.env.example](../../apps/api/.env.example); the deployment template is
[apps/api/deploy/lightsail/containers.template.json](../../apps/api/deploy/lightsail/containers.template.json).

- Platform: `NODE_ENV=production`, `PORT=8080`
- Database: `DATABASE_URL` (Neon pooled), `DATABASE_URL_UNPOOLED` (Neon direct) — values from `apps/api/.env.neon`
- URLs: `CLIENT_URL`, `WEB_APP_URL` (`https://gpderp.party`), `API_BASE_URL` (`https://api.gpderp.party`)
- Cookies: `COOKIE_DOMAIN=.gpderp.party`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=lax`
- Auth: `JWT_ACCESS_SECRET`, `TOKEN_HASH_PEPPER`, `ACCESS_TOKEN_TTL_SECONDS`, `REFRESH_TOKEN_TTL_SECONDS`, `SESSION_TTL_SECONDS`, `GOOGLE_CLIENT_ID`
- R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL`
- Paddle: `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_ENV`, `PADDLE_PRICE_ID_100_HAIKUS`
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- AI: `OPENAI_API_KEY`, `HAIKU_GENERATION_API=prod`

Lightsail stores these as plain deployment configuration: restrict Lightsail access with a least-privilege IAM user.
`aws lightsail get-container-services` and the raw `create-container-service-deployment` response print every value
(including the database URLs); `deploy.sh` and the commands below use `--query` so they never reach a terminal or CI log.

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

## Deploy

Prerequisites: AWS CLI v2 with the `lightsailctl` plugin, Docker, Node.

1. Create the service (once):

   ```bash
   aws lightsail create-container-service --service-name gpderp-api --power micro --scale 1
   ```

2. Fill `apps/api/.env.lightsail` (gitignored by `.env*`) from `apps/api/.env.example` with production values.
3. Build, push and deploy:

   ```bash
   apps/api/deploy/lightsail/deploy.sh            # uses apps/api/.env.lightsail
   ```

   This runs `docker build --platform linux/amd64`, `aws lightsail push-container-image`, renders
   `containers.template.json` (fails on any unset variable; the rendered file is a 0600 temp file removed on exit)
   and `aws lightsail create-container-service-deployment` with
   [public-endpoint.json](../../apps/api/deploy/lightsail/public-endpoint.json) (container `api`, port 8080,
   health check `/healthz`).
4. Custom domain (once): create a Lightsail certificate for `api.gpderp.party`, add its validation CNAMEs in
   Cloudflare DNS, attach it to the service, then point a **DNS-only** CNAME `api` at the service's default domain.
5. Cut over integrations: Paddle notification URL `https://api.gpderp.party/webhooks/paddle`; web build env
   `NEXT_PUBLIC_API_BASE_URL=https://api.gpderp.party`, `NEXT_PUBLIC_WS_URL=wss://api.gpderp.party/ws`, then
   redeploy the Worker (`pnpm deploy` in `apps/web`).

Smoke test after a deploy:

```bash
curl -i https://api.gpderp.party/healthz
curl -i https://api.gpderp.party/readyz
```

Then log in on https://gpderp.party, generate a haiku (WebSocket deltas arrive) and leave a tab idle for > 60 s.

## Database migrations

Migrations never run on container start. Apply them from a workstation (or CI) **before** deploying an image that
needs them, with [scripts/migrate-deploy-prod.sh](../../apps/api/scripts/migrate-deploy-prod.sh):

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

Status at the time of writing: 31 migrations in `prisma/migrations`, all applied on Neon (`Database schema is up to date!`).

Write migrations to be compatible with the previous image (expand first, contract in a later release) so the old
container keeps working during the switch.

## Operations

- Logs: `aws lightsail get-container-log --service-name gpderp-api --container-name api`
- State: `aws lightsail get-container-services --service-name gpderp-api --query 'containerServices[0].{state:state,deployment:currentDeployment.state}'`
  (without `--query` the output includes every env value)
- Rollback: redeploy a previous image label (`aws lightsail get-container-images --service-name gpderp-api`), using
  the same env, e.g. `LIGHTSAIL_IMAGE=:gpderp-api.api.<n>` with the rendered template.
- Scale up resources (not instances) if login latency or memory is tight: `--power small` (2 GB / 0.5 vCPU).
