# Paddle domain-review workarounds — reverted

`gpderp.party` was approved by Paddle on 2026-10-26. The workarounds made to get it through review were reverted the
same day; only what is legally or payment-compliance required was kept.

## Kept (required)

| What | Why |
|---|---|
| Terms name the operator: "operated by Sergey Sablin, a sole proprietor based in Israel" (`apps/web/src/content/terms-of-service.md`) | Paddle (merchant of record) requires the seller's name in the Terms; basic seller disclosure |
| Cloudflare **Always Use HTTPS** on (was off) | Checkout pages must be served over HTTPS (Paddle / payment networks) |
| Cloudflare **minimum TLS 1.2** (was 1.0) | PCI DSS requires TLS 1.2+ where card checkout runs |
| Paddle live default payment link `https://gpderp.party/` | Needed for live checkout |

## Reverted (2026-10-26)

| What | Restored to |
|---|---|
| Cloudflare Browser Integrity Check | on |
| Cloudflare security level | medium |
| Cloudflare Privacy Pass | on |
| Cloudflare email obfuscation | on |
| Cloudflare bot JavaScript detections | on (Bot Fight Mode stays off, as before) |
| `www.gpderp.party` DNS record and the www → apex redirect rule | deleted (`www` no longer resolves, as before) |
| `<noscript>` product summary on `/` (`GuestProductIntro` component + messages) | removed |
| `<noscript>` rule hiding the HTML loader | removed |
| CSS-generated "Loading" caption (`data-loading-text`) | text back in the HTML (`LoadingText`) |
| 307 redirects for guessed policy URLs (`/cookie-policy`, …) in `next.config.ts` | removed |
