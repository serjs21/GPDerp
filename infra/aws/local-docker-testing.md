# Local Docker testing (production image)

[scripts/local-docker-test.sh](scripts/local-docker-test.sh) builds the production image for `linux/amd64` and checks
it the way Lightsail will run it. Run it from anywhere:

```bash
infra/aws/scripts/local-docker-test.sh
```

Options (env): `IMAGE` (default `gpderp-api:local`), `HOST_PORT` (default `18080`), `SKIP_BUILD=1` (reuse the
image), `TEST_EMAIL` / `TEST_PASSWORD` (existing local user for the generation check).

## Prerequisites

- Docker (on Apple Silicon the amd64 image runs under emulation: slower, same behaviour).
- Node and `pnpm install` done in `apps/api` (the checker borrows `ws` and `dotenv` from it).
- Local Postgres from `apps/api/docker-compose.yml` on `localhost:5433` with migrations applied.
- `apps/api/.env` (dev values) and, for the Neon check, `apps/api/.env.neon`.

## What it runs and proves

| # | Check | How |
|---|---|---|
| 1 | Image builds for linux/amd64, runs as non-root | `docker build --platform linux/amd64 -t gpderp-api:local apps/api`; `docker image inspect` → `amd64/linux`, `User=node` |
| 2 | Runtime env only | A 0600 temp env file is generated from `apps/api/.env` (DB → `host.docker.internal:5433`, `HAIKU_GENERATION_API=dev`, `COOKIE_SECURE=false` for plain-HTTP localhost only, SMTP disabled) |
| 3 | Fastify starts | `docker run -d --platform linux/amd64 --memory 1g --env-file <tmp> -p 18080:8080 gpderp-api:local`; waits for `/healthz` |
| 4 | Health and REST | `/healthz` 200, `/readyz` 200 (database reachable), `/health` 200, `GET /auth/check-username` 200, `POST /auth/login` (unknown user, exercises argon2) 401, `GET /auth/me` 401, dev route `/dev/postcard_back.png` 404 |
| 5 | WebSocket upgrades | `ws://localhost:18080/ws` with the `tabId.<uuid>` subprotocol opens, and the 25 s server heartbeat ping arrives |
| 5 | Streamed generation | Logs in, opens `/ws` with the session cookie, `POST /beer_me_haiku`; asserts `start` → deltas → `saved`/`complete` and HTTP 200 with `creditsRemaining` (mock stream, local DB, spends one local credit) |
| 5b | Reconnect after dropped connections | Terminates the app's and pg-boss's Postgres sessions (`pg_terminate_backend`, the way a Neon suspend or restart drops them), then expects `/readyz` 200 again, the process still running and a REST call to succeed |
| 6 | Neon through the app's Prisma singleton, with TLS | `docker run --rm` the image with the runtime env and the Neon URLs; inside it `dist/lib/prisma` (the real singleton, bounded pool, `verify-full` TLS) runs `SELECT 1`, `user.count()`, `haiku.count()`; then the pooled and direct URLs are opened with the same TLS settings and must report an encrypted, certificate- and hostname-verified socket (protocol, cipher). Server-side `pg_stat_ssl` is not used: Neon terminates TLS at its proxy, so it reads `false` even for TLS clients. Read-only; hosts are printed masked (`ep-***`); the server and pg-boss are not started against Neon |
| 7 | No secrets in the image | `Config.Env` holds only `NODE_ENV`, `PORT`, `NODE_OPTIONS`, `PATH`, `NODE_VERSION`, `YARN_VERSION`; `docker history --no-trunc` and a `docker export` of the filesystem are searched for every credential value from `.env` / `.env.neon` (count only, values never printed; values shorter than 12 characters or digit-only are skipped and listed by key name, because placeholders like a 10-digit dev webhook secret also occur in library code); no `.env*` / `.neon` files; no sources, tests or dev tooling under `/app` |
| 8 | Graceful shutdown | `docker stop -t 30` → exit code 0 and `SIGTERM received` in the logs |
| 9 | No database URLs in logs | The full container log (including the reconnect errors from 5b) contains no `postgres://` URL and none of the secret values |

Without `TEST_EMAIL` / `TEST_PASSWORD`, check 5 creates a disposable `docker-smoke+<timestamp>@example.com` user in the
**local** database (registration's verification email cannot be sent because SMTP is disabled; login does not require
it). Delete such users from the local database whenever convenient.

SSE: the API has no SSE routes; streamed output uses the WebSocket, which check 5 covers.

The script exits non-zero if any check fails and always removes the container and temp files.

## Manual equivalents

```bash
docker build --platform linux/amd64 -t gpderp-api:local apps/api
docker run --rm --platform linux/amd64 --memory 1g -p 18080:8080 --env-file /path/to/runtime.env gpderp-api:local
curl -i http://localhost:18080/healthz
curl -i http://localhost:18080/readyz
docker stop <container>      # expect "SIGTERM received, shutting down..." and exit code 0
```

`runtime.env` must be a plain `KEY=value` file (Docker does not strip quotes) and must never be committed.
