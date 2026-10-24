# Paddle: sandbox → live

| Item | Sandbox | Live |
|---|---|---|
| Product "100 haikus!" | `pro_01m20fwzafy40gn3dkykd04wxe` | `pro_01m5ptpkwgar5crmsj4542wxaj` |
| Price "100 tokens" (one-time, 300 USD, tax_mode location) | `pri_01m20q9vw3xs90ss1rzs6jcjk8` | `pri_01m5ptpm2smb5r1bze7tjczh3w` |
| Client token | `test_…` (`apps/web/.env`, `.env.local`) | `live_…` `ctkn_01m5pts4my1eadd0msey04pd4s` (`apps/web/.env.production.local`) |
| Webhook destination | `ntfset_01m5pqjek0h6h0b0nakm9bcf7v` (local e2e, inactive) | `ntfset_01m5ptz62cpgkmm3zks7m23bvv` → `https://api.gpderp.party/webhooks/paddle` |
| API key | `apps/api/.env` (`pdl_sdbx…`) | `apps/api/.env.paddle-live` (`pdl_live…`) |

The mapping lives in [live-id-map.json](live-id-map.json). No Paddle IDs are hard-coded in the apps; they come from env vars
(`PADDLE_ENV`, `PADDLE_CLIENT_TOKEN`, `PADDLE_PRICE_ID_100_HAIKUS`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`).

## Staged (not deployed) live configuration

- **Web production build** — `apps/web/.env.production.local` (gitignored): `PADDLE_ENV=production`, live token, live price,
  `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_API_URL=https://api.gpderp.party`, `NEXT_PUBLIC_WS_URL=wss://api.gpderp.party/ws`.
  Local dev keeps sandbox (`.env` / `.env.local`). `pnpm deploy` runs [check-paddle-env.mjs](../../apps/web/scripts/check-paddle-env.mjs),
  which refuses mismatched environment/token/price and refuses any live deploy without `PADDLE_LIVE_DEPLOY_APPROVED=yes`.
- **API (Lightsail)** — `apps/api/.env.paddle-live-deploy` (gitignored partial env file): `PADDLE_ENV=production`,
  live key, live price, live webhook secret. The deploy tooling validates that the key prefix and price match `PADDLE_ENV`.
- **Webhook security** — the API accepts `POST /webhooks/paddle` only from Paddle's published IPs, fetched from
  `https://api.paddle.com/ips` (`sandbox-api.paddle.com/ips` in sandbox) and refreshed every 6 h
  ([paddleIpAllowlist.ts](../../apps/api/src/modules/payments/paddleIpAllowlist.ts)); then the signature is verified.
- **Default payment link** — Paddle.js opens checkout on any page with `?_ptxn=` (PaddleProvider).

## Remaining manual steps

1. Paddle (live) > My account > Settings > **Website approval**: submit `gpderp.party` (no API for this).
2. When approved: `cd apps/api && node scripts/paddle-live.mjs checkout-url --url https://gpderp.party/ --apply`
   (or Checkout > Checkout configuration > Default payment link). Check status: `node scripts/paddle-live.mjs domains`.
3. Complete verification in vendors.paddle.com (business + identity).
4. Go live — API first (new image incl. the IP allowlist + live env), then the web:

   ```bash
   AWS_PROFILE=gpderp infra/aws/release.sh --env-file apps/api/.env.paddle-live-deploy   # asks for approval
   cd apps/web && PADDLE_LIVE_DEPLOY_APPROVED=yes pnpm deploy
   ```

5. Take one real payment, confirm the `transaction.completed` webhook (Paddle > Developer tools > Notifications) and the credits.

Rollback: `infra/aws/rollback.sh` (API) and redeploy the web with the sandbox values removed from `.env.production.local`.
