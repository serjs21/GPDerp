# Monitoring: Better Stack errors and logs, request IDs, uptime, weekly usage totals

What runs where:

| Piece | Where | Turned on by |
|---|---|---|
| Browser error tracking (`@sentry/react` → Better Stack Errors) | `apps/web/src/instrumentation-client.ts` | `NEXT_PUBLIC_BETTERSTACK_ERRORS_DSN` at **build** time |
| Browser source maps (uploaded, never served) | `apps/web/scripts/upload-sourcemaps.mjs` | `SENTRY_*` in the deploy shell |
| API error tracking (`@sentry/node` → Better Stack Errors) | `apps/api/src/instrument.ts`, `src/lib/observability/` | `BETTERSTACK_ERRORS_DSN` |
| API log shipping, `warn` and above (`@logtail/pino`) | `apps/api/src/lib/observability/logger.ts` | `BETTERSTACK_LOGS_SOURCE_TOKEN` + `BETTERSTACK_LOGS_INGESTING_HOST` |
| Request IDs (`x-request-id`) | browser axios → API → response header, logs, error tags | always on |
| Health endpoints `/health/live`, `/health/ready` (plus `/healthz`, `/readyz`, `/health`) | `apps/api/src/modules/health/` | always on |
| Weekly usage totals → Cloudflare Workers Analytics Engine | API job `src/modules/usageMetrics/`, web route `/api/internal/usage-metrics` | `USAGE_METRICS_INGEST_URL` + `USAGE_METRICS_INGEST_TOKEN` (API) and Worker secret |

Every integration is off when its variables are missing, and telemetry failures never fail a request or block startup.

## What is (and isn't) collected

- **Browser errors:** error type, message and stack, page URL **without** query string or fragment, user agent, release and environment. Tags for API failures: API route and page route (ids replaced by `:id`), method, status, request id. **No** breadcrumbs, console output, cookies, referrer, user details, session replay, tracing or release-health sessions.
- **API errors:** only unexpected **5xx** (a thrown error, or a handler that sends a 500 itself), once per request, tagged with request id, route pattern, method and status. Request bodies, query strings, cookies, credential headers, local variables, database data and AI prompts/outputs are not collected (`dataCollection` in `instrument.ts`, plus `scrubEvent`).
- **API logs:** one line per request on stdout (`route`, `method`, `statusCode`, `durationMs`, `release`, `reqId`; no IP, no body). Only `warn`/`error` lines (5xx requests, failures) are shipped to Better Stack, so routine successful requests stay local. Cookies, credential headers and `password`/`token`-style fields are redacted everywhere.
- **Weekly totals:** new users, generations (haikus created), distinct generating users and average generations per user for the previous ISO week. No ids, emails, IPs or content.
  - Limitation: there is no generation ledger, so haikus deleted before the Monday job runs are not counted.

## Free-tier budget

Better Stack free plan (October 2026): 100,000 exceptions/month, 3 GB logs kept 3 days, 10 monitors (3-minute checks). Defaults keep well inside it: errors at 100% (`*_ERRORS_SAMPLE_RATE=1`), traces off, remote logs at `warn`. If a noisy error loop appears, lower `BETTERSTACK_ERRORS_SAMPLE_RATE` / `NEXT_PUBLIC_BETTERSTACK_ERRORS_SAMPLE_RATE` (0–1) rather than raising quotas.

---

## 1. Manual setup in Better Stack

1. **Create two Errors applications** (Errors → Applications → Create): `gpderp-web` (JavaScript/React) and `gpderp-api` (Node.js). Pick the **EU** data region if available for your team.
   - From each app's **Ingest** tab copy the **DSN** (`https://<token>@<host>/<id>`).
2. **Source map settings** (web app → **Advanced settings**): note `SENTRY_ORG`, `SENTRY_PROJECT` and `SENTRY_URL` (e.g. `https://<region>-sourcemaps.betterstackdata.com`).
3. **Create a Telemetry API token** (Settings → API tokens) for source map uploads → `SENTRY_AUTH_TOKEN`. Keep it out of git.
4. **Create a Logs source** (Telemetry → Sources → Connect source → JavaScript & Node.js), name it `gpderp-api`. Copy the **source token** and **ingesting host**. Set the source retention to the free 3 days.
5. **Uptime monitors** (Uptime → Monitors → Create), 3-minute interval, e-mail alerts:
   - `https://gpderp.party/` — keyword check for `GPDerp`.
   - `<API_BASE_URL>/health/ready` — expect HTTP 200 (503 means the database is unreachable).
   - Optionally `<API_BASE_URL>/health/live` — expect HTTP 200 (process alive).
6. **Alerts:** in each Errors application, enable e-mail notifications for new errors.

## 2. Manual setup in Cloudflare

1. Generate a random token (e.g. `openssl rand -hex 32`) for the usage ingest.
2. Store it as a Worker secret on `gpderp-party`: `cd apps/web && pnpm exec wrangler secret put USAGE_METRICS_INGEST_TOKEN`.
3. The Analytics Engine dataset `gpderp_weekly_usage` is created automatically on the first write (binding `USAGE_METRICS` in `apps/web/wrangler.jsonc`).
4. For reading the totals, create an API token with **Account → Account Analytics → Read**.

## 3. Configuration values

**API (Lightsail, via `infra/aws/config/runtime-env.json`; put values in `apps/api/.env.lightsail`):**

| Variable | Value | Secret |
|---|---|---|
| `BETTERSTACK_ERRORS_DSN` | `gpderp-api` DSN | yes |
| `BETTERSTACK_LOGS_SOURCE_TOKEN` | Logs source token | yes |
| `BETTERSTACK_LOGS_INGESTING_HOST` | ingesting host, no `https://` | no |
| `USAGE_METRICS_INGEST_URL` | `https://gpderp.party/api/internal/usage-metrics` | no |
| `USAGE_METRICS_INGEST_TOKEN` | same value as the Worker secret | yes |
| optional | `BETTERSTACK_ERRORS_SAMPLE_RATE` (1), `BETTERSTACK_TRACES_SAMPLE_RATE` (0), `BETTERSTACK_LOG_LEVEL` (warn), `LOG_LEVEL` (info), `APP_ENV` | no |

`APP_RELEASE` is baked into the image by `infra/aws/build.sh` (git commit). Keep `MONITORING_DEV_ROUTES` unset in production except for a deliberate one-off check.

**Web (build-time, in the deploy shell or an uncommitted env file):**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_BETTERSTACK_ERRORS_DSN` | `gpderp-web` DSN (public by design) |
| `NEXT_PUBLIC_APP_ENV` | `production` |
| `NEXT_PUBLIC_BETTERSTACK_ERRORS_SAMPLE_RATE` | optional, default 1 |
| `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_URL`, `SENTRY_AUTH_TOKEN` | from step 1.2–1.3, deploy shell only |

`NEXT_PUBLIC_APP_RELEASE` defaults to the git commit. The `.env.example` files in `apps/api` and `apps/web` list all of these but are git-ignored in this repo.

---

## 4. Deployment checklist

1. [ ] Commit the changes (the API image tag and both releases come from the commit).
2. [ ] **API first** — it must accept the new `x-request-id` CORS header before the web app sends it.
   - [ ] Add the API values from section 3 to `apps/api/.env.lightsail`.
   - [ ] `infra/aws/build.sh` → `infra/aws/push.sh <image>` → `infra/aws/deploy.sh` (confirm with the `CONFIRM_DEPLOY` token it prints).
   - [ ] `curl -sI <API_BASE_URL>/health/ready` → `200` and an `x-request-id` header.
3. [ ] **Web second.**
   - [ ] `wrangler secret put USAGE_METRICS_INGEST_TOKEN` (once).
   - [ ] Export the web values from section 3 in the deploy shell (keep the existing Paddle exports).
   - [ ] `cd apps/web && pnpm run deploy` (runs `check-paddle-env` → `opennextjs-cloudflare build` → `upload-sourcemaps.mjs` → `opennextjs-cloudflare deploy`). If you deploy with the individual commands instead, run `node scripts/upload-sourcemaps.mjs` between build and deploy.
   - [ ] The upload step must end with `removed N source map(s) from deployable assets`.
   - [ ] `curl -s -o /dev/null -w '%{http_code}' https://gpderp.party/_next/static/chunks/<any>.js.map` → `404`.
4. [ ] Set up the uptime monitors (section 1.5) if not done yet.

## 5. Verification checklist

**Frontend errors**
- [ ] Locally (`pnpm dev`, with `NEXT_PUBLIC_BETTERSTACK_ERRORS_DSN` set in `.env.local`) open `/dev/monitoring` and press each button: render error (error page with "Try again"), event-handler error, unhandled rejection, API thrown 500, API handler-sent 500.
- [ ] Each appears once in Better Stack Errors (`gpderp-web`) with environment `development`, the release, a page URL without query string, and no breadcrumbs.
- [ ] After a production deploy, the stack trace of a production error shows original source file names (source maps symbolicated).
- [ ] A 4xx (e.g. wrong password on login) creates **no** error.

**Backend exceptions**
- [ ] Locally: `curl -i localhost:4000/dev/monitoring/throw` → 500 with Fastify's usual body; one exception in `gpderp-api` tagged `route=/dev/monitoring/throw`, `request_id=<header value>`.
- [ ] `curl -i localhost:4000/dev/monitoring/handled-500` → one message `HTTP 500 GET /dev/monitoring/handled-500`.
- [ ] Production one-off (optional): set `MONITORING_DEV_ROUTES=true`, redeploy, hit `/dev/monitoring/throw`, then remove the variable and redeploy.

**Correlated request logs**
- [ ] `curl -i -H 'x-request-id: verify-12345678' <API>/health/ready` → the response echoes `x-request-id: verify-12345678`.
- [ ] Trigger an API 500 from the browser: the Better Stack error's `request_id` tag matches a log line in the Logs source (`reqId`), with `route`, `method`, `statusCode`, `durationMs`, `release`.
- [ ] Better Stack Logs shows no `info` "request completed" lines for successful requests, and no cookies, tokens or passwords in any line.

**Uptime alerts**
- [ ] Both monitors are green. Use "Send test alert" (or pause the API briefly in a maintenance window) to confirm the e-mail arrives.

**Weekly usage totals**
- [ ] Ingest route check: `curl -i -X POST https://gpderp.party/api/internal/usage-metrics` → `401` (no token).
- [ ] After the first Monday 00:15 UTC run, the API log shows `[usageMetrics] sent totals for week YYYY-MM-DD`, and the query below returns a row.

## 6. Reading the weekly totals (Analytics Engine SQL API)

```bash
curl "https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/analytics_engine/sql" \
  --header "Authorization: Bearer <ACCOUNT_ANALYTICS_READ_TOKEN>" \
  --data "
SELECT
  blob1                        AS week_start,
  argMax(double1, timestamp)   AS new_users,
  argMax(double2, timestamp)   AS generations,
  argMax(double3, timestamp)   AS generating_users,
  argMax(double4, timestamp)   AS avg_generations_per_user
FROM gpderp_weekly_usage
WHERE index1 = 'weekly'
GROUP BY week_start
ORDER BY week_start DESC
LIMIT 12
FORMAT JSON"
```

`argMax(…, timestamp)` keeps the latest write per week, so a retried job doesn't double count. Columns: `blob1` week start (Monday, UTC), `blob2` API release, `double1` new users, `double2` generations, `double3` distinct generating users, `double4` average generations per generating user.

To send a week manually (e.g. to backfill), POST the same JSON body the job sends:

```bash
curl -X POST https://gpderp.party/api/internal/usage-metrics \
  -H "Authorization: Bearer $USAGE_METRICS_INGEST_TOKEN" -H 'content-type: application/json' \
  -d '{"weekStart":"2026-10-19","newUsers":0,"generations":0,"generatingUsers":0,"avgGenerationsPerUser":0,"release":"manual"}'
```
