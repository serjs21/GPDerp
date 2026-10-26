# Paddle domain-review workarounds (temporary)

Changes made only to get `gpderp.party` through Paddle's website/domain review. Revert them once the
domain is `approved` (`cd apps/api && node scripts/paddle-live.mjs domains`). Cloudflare changes are not in
git — undo them in the dashboard (zone `gpderp.party`) or via the API; code changes are listed by file.

Some items are worth keeping regardless (marked **keep?**): they are ordinary good hygiene, not review hacks.

## Cloudflare zone `gpderp.party` (zone id `e9f33ebeb7b5ce50186bfea414b6cecb`)

| Setting | Before | Now | Changed | Revert in dashboard | Keep? |
|---|---|---|---|---|---|
| Always Use HTTPS | off | **on** | 2026-10-25 | SSL/TLS › Edge Certificates | **keep?** — plain-HTTP pages are a real risk |
| Minimum TLS version | 1.0 | **1.2** | 2026-10-25 | SSL/TLS › Edge Certificates | **keep?** |
| Browser Integrity Check | on | **off** | 2026-10-25 | Security › Settings | revert |
| Security level | medium | low (10-25) → **essentially_off** (10-26, by another assistant) | 2026-10-25/26 | Security › Settings | revert to medium |
| Privacy Pass | on (per the other assistant) | **off** | 2026-10-26 (other assistant) | Security › Settings | revert |
| Email obfuscation | on | **off** | 2026-10-26 | Scrape Shield | revert |
| Bot JavaScript detections (`bot_management.enable_js`) | on | **off** | 2026-10-26 | Security › Bots | revert |
| Bot Fight Mode | off | off (unchanged) | — | — | — |
| DNS `AAAA www.gpderp.party → 100::` (proxied) | absent | **added** | 2026-10-25 | DNS › Records | **keep?** (`www` would 404 again) |
| Single redirect rule `www.gpderp.party → https://gpderp.party` (301, keeps path + query) | absent | **added** (`http_request_dynamic_redirect` entrypoint) | 2026-10-25 | Rules › Redirect Rules | **keep?** (goes with the DNS record) |

## Web app (`apps/web`)

| Change | Files | Revert |
|---|---|---|
| `<noscript>` product summary on `/` for crawlers without JS | `src/app/page.tsx`, `src/components/GuestProductIntro/*`, `messages/*.json` (`GuestProductIntro`) | Make `page.tsx` render only `<HomePageContent />`; delete `GuestProductIntro` and its messages |
| Loader hidden when JS is off (every page) | `src/components/Loaders/htmlDecorations/htmlLoader/index.tsx` (`<noscript><style>`) | Remove the `<noscript>` block |
| "Loading" caption drawn by CSS (`data-loading-text` + `::before`) instead of HTML text, so scanners don't read the loader as page content | `src/components/Loaders/LoadingText/LoadingText.tsx`, `LoadingText.module.css` | Put `{t("text")}` and the `.` text back in the spans; drop the two `::before` rules |
| 307 redirects for guessed policy URLs (`/cookie-policy`, `/privacy-policy`, `/refund-policy`, `/terms-of-service`, `/acceptable-use-policy`) | `next.config.ts` (`redirects()`) | Remove `redirects()` |
| Operator named in the Terms ("operated by Sergey Sablin, a sole proprietor based in Israel"), last-updated date | `src/content/terms-of-service.md` (+ regenerated `legalContent.generated.ts`) | **keep?** — Paddle requires the operator's name in the Terms for as long as Paddle is used |

Not workarounds (requested on their own, keep): pricing page and footer link, footer contact button,
support email → `toaster@gpderp.party`, home intro card removal, `keep_names: false` in `wrangler.jsonc`
(fixes the `__name is not defined` theme-script error).

## Paddle side

- Live default payment link: not set yet (needs the approved domain). A background watcher started 2026-10-25
  sets it to `https://gpderp.party/` once the domain is `approved` (runs while Cursor is open, gives up after 48 h).
- Live account legal name is "Toaster Inc" in Paddle; the Terms say Sergey Sablin (sole proprietor). Align them in
  the Paddle dashboard.
