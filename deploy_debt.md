# Deploy debt — gpderp.party

Frontend Worker `gpderp-party` is live at https://gpderp.party via OpenNext. These items are still required for a complete production stack.

## Blockers (app will not fully work without these)

1. **Host the Fastify API somewhere reachable on the public internet**  
   `apps/api` is Node + Prisma + WebSockets + `argon2` / `pg` / SMTP — not on Workers. Needs a long-lived Node host (VM, Fly, Railway, Render, etc.) with Postgres.

2. **Set production frontend API URLs and redeploy the Worker**  
   Rebuild/redeploy `apps/web` after setting (build-time / `NEXT_PUBLIC_*`):
   - `NEXT_PUBLIC_API_BASE_URL` — HTTPS origin of the API (not localhost)
   - `NEXT_PUBLIC_WS_URL` — `wss://…/ws`
   - Optionally clear/override empty values currently forced by gitignored `.env.production.local`

3. **Point the API at the production web origin**  
   On the API host, set at least:
   - `CLIENT_URL` / CORS allowlist → `https://gpderp.party` (code reads `CLIENT_URL`, not `CORS_ORIGIN`)
   - `WEB_APP_URL` → `https://gpderp.party`
   - `API_BASE_URL` → the public API origin
   - `COOKIE_SECURE=true` (and a sensible `COOKIE_DOMAIN` / `COOKIE_SAME_SITE` for cross-site if API is on another host)

4. **Google OAuth console**  
   Add `https://gpderp.party` (and any API callback URLs you use) to authorized JavaScript origins / redirect URIs. Align `GOOGLE_CLIENT_ID` (API) and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (web).

## Strongly recommended

5. **Production secrets on the API host** (names only — rotate away from any example/dev values):  
   `DATABASE_URL`, `JWT_ACCESS_SECRET`, `TOKEN_HASH_PEPPER`, `SMTP_*`, `MAIL_FROM`, R2 credentials (`R2_*`), etc.

6. **R2**  
   Confirm the live `icons` (or production) bucket + `R2_PUBLIC_BASE_URL` match what the API uses in prod.

7. **Smoke-test after API is wired**  
   - Login / register / Google sign-in  
   - Cookie auth + refresh across `gpderp.party` ↔ API origin  
   - WebSocket haiku generation  
   - Label / share / icon upload paths  

8. **Commit deploy scaffolding** (if not already):  
   `wrangler.jsonc`, `open-next.config.ts`, `public/_headers`, package scripts, `.gitignore` OpenNext entries — **never** commit `.env*`, `.dev.vars`, or secrets.

## Optional / polish

9. Enable or document a `*.workers.dev` URL if you want a non-custom-domain preview (custom domain is the canonical prod URL).  
10. OpenNext incremental cache via R2 binding (not configured; optional performance).  
11. Cloudflare Images binding is present; confirm whether Next image optimization should use it in prod.  
12. DNS list API returned 403 with Wrangler OAuth (`zone:read` only) — use a token with DNS read if you need automated DNS audits later.  
13. Pre-existing TS noise was narrowed via `tsconfig` excludes + a few cast/fix; consider a proper cleanup pass so production builds stay green without excludes.

## Done (for reference)

- Worker `gpderp-party` deployed to account `6a315f2195d9aaf620d3cfc4d8d79d75`  
- Custom domain `gpderp.party` bound and serving Next/OpenNext (`x-opennext: 1`)  
- Homepage, `/login`, and static `/_next` assets verified over HTTPS  
- Fastify API intentionally left off Workers  
