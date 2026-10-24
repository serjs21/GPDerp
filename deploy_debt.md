# Deploy debt — gpderp.party

Frontend Worker `gpderp-party` is live at https://gpderp.party via OpenNext. These items are still required for a complete production stack.

## Blockers (app will not fully work without these)

1. **Host the Fastify API on AWS Lightsail Containers** (scaffolding ready; needs an AWS account)  
   Full guide: [infra/aws/README.md](infra/aws/README.md); local image checks: [infra/aws/local-docker-testing.md](infra/aws/local-docker-testing.md).  
   Image: `apps/api/Dockerfile` (verified locally: builds for linux/amd64, ~325 MB, ~225 MiB RSS idle). Database: Neon (`apps/api/.env.neon`, schema already at the latest migration).
   1. Install AWS CLI v2 + the `lightsailctl` plugin; sign in with a least-privilege IAM user.
   2. `aws lightsail create-container-service --service-name gpderp-api --power micro --scale 1`  
      Keep scale at **1**: WebSocket registries and in-flight generations are process-local.
   3. Create `apps/api/.env.lightsail` (gitignored) from `apps/api/.env.example` with production values:
      `DATABASE_URL` / `DATABASE_URL_UNPOOLED` from `.env.neon`, new `JWT_ACCESS_SECRET` (32+) and `TOKEN_HASH_PEPPER` (16+), R2, Paddle, SMTP, `OPENAI_API_KEY`, and the URLs from item 3.
   4. `apps/api/deploy/lightsail/deploy.sh` — builds, pushes, renders `containers.template.json` (fails on any unset variable) and deploys with `public-endpoint.json` (port 8080, health check `/healthz`).
   5. Custom domain: Lightsail → Certificates → create for `api.gpderp.party`; add the validation CNAMEs in Cloudflare DNS; attach the certificate to the service; add CNAME `api` → the service's default domain as **DNS only** (grey cloud) to start.
   6. Smoke: `curl https://api.gpderp.party/healthz` and `/readyz`, then confirm a `wss://api.gpderp.party/ws` connection stays open past 60 s (server pings every 25 s).
   - Migrations are never run in the container: run `pnpm migrate:prod` in `apps/api` before deploying an image that needs a new migration.

2. **Set production frontend API URLs and redeploy the Worker** (after item 1 serves `/healthz`)  
   In `apps/web` production env (build-time `NEXT_PUBLIC_*`; currently forced empty by gitignored `.env.production.local`):
   - `NEXT_PUBLIC_API_BASE_URL=https://api.gpderp.party`
   - `NEXT_PUBLIC_WS_URL=wss://api.gpderp.party/ws`  
   Then `pnpm deploy` in `apps/web`.

3. **API URLs and cookies** (in `.env.lightsail`)
   - `CLIENT_URL=https://gpderp.party` (single origin: CORS allowlist + CSRF Origin check)
   - `WEB_APP_URL=https://gpderp.party`
   - `API_BASE_URL=https://api.gpderp.party` (email verification links)
   - `COOKIE_DOMAIN=.gpderp.party`, `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=lax` — the web app reads `access_token` / `csrf_token`, so cookies must cover both hosts.

4. **Paddle dashboard**  
   Point the notification destination to `https://api.gpderp.party/webhooks/paddle`; its secret must equal `PADDLE_WEBHOOK_SECRET`. Match `PADDLE_ENV` (sandbox/production) on API and web.

5. **Google OAuth console**  
   Authorized JavaScript origin `https://gpderp.party` (the API has no OAuth redirect/callback URIs; it only verifies tokens). Align `GOOGLE_CLIENT_ID` (API) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (web).

## Strongly recommended

6. **Production secrets on the API host** (Lightsail deployment env; names only — rotate away from any example/dev values):  
   `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `JWT_ACCESS_SECRET`, `TOKEN_HASH_PEPPER`, `SMTP_*`, `MAIL_FROM`, R2 credentials (`R2_*`), `PADDLE_*`, `OPENAI_API_KEY`. Lightsail stores them as plain deployment env: restrict who has Lightsail access.  
   `HAIKU_GENERATION_API=prod` (set in the Lightsail template) switches haiku generation to the real OpenAI agent; local dev keeps `dev` (mock stream, no OpenAI calls).

7. **R2**  
   Confirm the live `icons` (or production) bucket + `R2_PUBLIC_BASE_URL` match what the API uses in prod.

8. **Smoke-test after API is wired**  
   - Login / register / Google sign-in  
   - Cookie auth + refresh across `gpderp.party` ↔ `api.gpderp.party`  
   - WebSocket haiku generation (deltas arrive) and a socket idle > 60 s  
   - Paddle sandbox purchase (webhook delivered, credits update live)  
   - Label / share / icon upload paths  
   - Redeploy once and confirm the logs show `SIGTERM received, shutting down...`

9. **Commit deploy scaffolding** (if not already):  
   `wrangler.jsonc`, `open-next.config.ts`, `public/_headers`, package scripts, `.gitignore` OpenNext entries, `apps/api/Dockerfile`, `apps/api/.dockerignore`, `apps/api/deploy/lightsail/*` — **never** commit `.env*`, `.dev.vars`, or secrets.

## Optional / polish

10. Enable or document a `*.workers.dev` URL if you want a non-custom-domain preview (custom domain is the canonical prod URL).  
11. OpenNext incremental cache via R2 binding (not configured; optional performance).  
12. Cloudflare Images binding is present; confirm whether Next image optimization should use it in prod.  
13. DNS list API returned 403 with Wrangler OAuth (`zone:read` only) — use a token with DNS read if you need automated DNS audits later.  
14. Pre-existing TS noise was narrowed via `tsconfig` excludes + a few cast/fix; consider a proper cleanup pass so production builds stay green without excludes.  
15. pg-boss polls Neon over the direct URL, so production compute never scales to zero (cost). Consider a longer polling interval if idle cost matters.

## Done (for reference)

- Worker `gpderp-party` deployed to account `6a315f2195d9aaf620d3cfc4d8d79d75`  
- Custom domain `gpderp.party` bound and serving Next/OpenNext (`x-opennext: 1`)  
- Homepage, `/login`, and static `/_next` assets verified over HTTPS  
- Fastify API intentionally left off Workers  
- API container scaffolding: `apps/api/Dockerfile` (node:22-bookworm-slim, linux/amd64, non-root, port 8080), `.dockerignore`, `.env.example`, `deploy/lightsail/` (templates, renderer, `deploy.sh`); proxy IPs (`trustProxy`), bounded graceful shutdown, Prisma disconnect, WebSocket 25 s heartbeat + 64 KB frame cap — verified in a local container  
