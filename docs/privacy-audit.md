# Privacy audit: cookies, browser storage and tracking

**Audit date:** October 31, 2026
**Scope:** `apps/web` (Next.js on Cloudflare Workers, `gpderp.party`), `apps/api` (Fastify on AWS Lightsail), dependencies, deployment config, and the live production site.
**Method:** static code search, read-only Cloudflare API reads, and Playwright runs against production (desktop and mobile) and local dev. No forms were submitted, no purchases were made, and no production data was changed.

This document is a technical assessment, not legal advice. Statements about the law are marked with how certain they are.

---

## 1. Executive summary

### Is a consent banner necessary?

| Part of the stack | Decision |
|---|---|
| Application code (`apps/web`, `apps/api`) | `NO_BANNER_REQUIRED`. Every cookie and storage item the app itself sets is for sign-in, CSRF protection, a user-chosen preference, or a flow the user started. |
| Production as currently configured | `BANNER_REQUIRED` for EU/EEA visitors, **only because of Cloudflare Web Analytics**, which Cloudflare injects into every page at the edge and which runs before any interaction. |
| Production with Cloudflare Web Analytics turned off | `FURTHER_VERIFICATION_REQUIRED`. The remaining Cloudflare edge features (JavaScript Detections with its 1-year `cf_clearance` cookie, and Network Error Logging) are security or reliability features whose consent exemption is arguable but not certain. An in-app banner could not block them anyway, because Cloudflare injects them before the app runs. |

**Why.** Cloudflare Web Analytics (verified at runtime) loads `static.cloudflareinsights.com/beacon.min.js` on every page. That script instructs the browser to send the page URL, referrer, user agent and client hints, JavaScript memory figures and navigation timings to `/cdn-cgi/rum`. EDPB Guidelines 2/2023 (v2.0, §33) say that JavaScript instructing the browser to send information falls within Art. 5(3) of the ePrivacy Directive. The EU has no general analytics exemption. The UK has one (see below), but only with clear information and a simple, free way to object, and the site offers neither today.

**Recommended path (not implemented, needs your decision):** turn off Cloudflare Web Analytics automatic setup for `gpderp.party`. The app has no other analytics, so this removes the only consent-requiring technology and keeps the site banner-free. If analytics is wanted later, section 4 describes options that avoid a banner and the consent design to use if a browser-side tool is chosen.

**Confidence:** high for the technical inventory (runtime-verified, except authenticated sessions and Paddle checkout). Medium for the legal classification, which depends on jurisdiction and on interpretations that regulators and courts apply differently.

**Jurisdictions and assumptions**
- Visitors may come from the EU/EEA, the UK and Israel. The operator is a sole proprietor in Israel (per the Terms of Service).
- No targeting of a specific country is assumed, so EU ePrivacy rules (as implemented nationally) are treated as applicable to EU visitors.
- Provider behavior is taken from provider documentation plus what was observed at runtime, never from package names alone.

**Unresolved questions**
- Whether site-wide bot detection (`cf_clearance`, 365 days) qualifies as "strictly necessary". WP29 Opinion 04/2012 limits the security exemption to *user-centric* security for a service the user explicitly requested, for a *limited* duration.
- Whether Network Error Logging (a browser-stored reporting policy plus failure reports to Cloudflare) counts as storage/access that needs consent, or falls under the transmission or strictly-necessary exemptions.
- What Cloudflare (Workers Logs, Web Analytics), AWS Lightsail (container logs) and Neon (backups) actually retain, and for how long.

### Legal references used

| Source | What it says that matters here |
|---|---|
| [EDPB Guidelines 2/2023 on the technical scope of Art. 5(3) ePrivacy, v2.0 (Oct 2024)](https://www.edpb.europa.eu/documents/guideline/guidelines-22023-on-technical-scope-of-art-53-of-eprivacy-directive_en) | Art. 5(3) is not limited to cookies. JavaScript that instructs the browser to send information (§33), tracking pixels and links (§47–51), and even temporary storage (§50) are in scope. |
| [WP29 Opinion 04/2012 on cookie consent exemption](https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf) | Exempt: authentication cookies, user-input/session cookies, *user-centric* security cookies "used to detect authentication abuses, for a limited persistent duration", and UI customization cookies. Not exempt: "cookies that relate to the security of websites or third party services that have not been explicitly requested by the user". No general analytics exemption. |
| [ICO: storage and access technologies – exceptions (final guidance, 29 Apr 2026)](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions) and the [Data (Use and Access) Act 2025, s.112](https://www.legislation.gov.uk/ukpga/2025/18/section/112/2026-02-05) (in force 5 Feb 2026) | UK PECR now has five exceptions, including "statistical purposes" (aggregate analytics to improve the service) and "appearance" (user preferences). Both require clear information **and** a simple, free way to object. |
| [Israel Privacy Protection Authority, opinion on consent (25 Feb 2026)](http://www.gov.il/he/pages/consent-2026), as summarized by [Schwebel Law](https://schwebel-law.com/en/writing/privacy-policy-cookies-israel) | No Israeli cookie statute. Continued browsing after adequate notice on entry is "usually" implied consent for collection reasonably linked to the service. Profiling unrelated to the service, and direct mailing, need separate opt-in. Amendment 13 section 11 notice duties apply at each collection point. *Secondary source used for the summary; the Hebrew original was not reviewed in full.* |

---

## 2. Technology inventory

Classification key: **Necessary/exempt**, **Consent required**, **Conditional/uncertain**, **Unverified**.
"Before consent" means "active before any user interaction"; there is no consent mechanism today.

### 2.1 Cookies

| Technology | Provider | Purpose | Storage/identifier | Duration | Classification | Consent required | Source location |
|---|---|---|---|---|---|---|---|
| `access_token` | First party (API) | Signed-in session (short-lived JWT with user id, session id, display name, avatar, email-verified flag) | Cookie, **not HttpOnly** (read by the web app for a presence/expiry check), Secure + SameSite=Lax in production | 900 s (`ACCESS_TOKEN_TTL_SECONDS`) | Necessary/exempt | No | `apps/api/src/modules/auth/tokenService.ts`, `apps/api/src/modules/auth/constants.ts` |
| `refresh_token` | First party (API) | Renews the session | Cookie, HttpOnly, Secure, SameSite=Lax | 30 days (`REFRESH_TOKEN_TTL_SECONDS`, `SESSION_TTL_SECONDS`) | Necessary/exempt | No | same as above |
| `csrf_token` | First party (API) | CSRF protection (double-submit with `x-csrf-token` header) | Cookie, not HttpOnly, Secure, SameSite=Lax | Set with the session cookies | Necessary/exempt | No | same as above; checked in `auth.controller.ts` |
| `gpderp-theme` | First party (web) | Remembers light/dark theme so the server renders it without a flash | Cookie, SameSite=Lax, **not Secure** (set from JS) | 1 year | Necessary/exempt (appearance) — **set on first load even without a choice** | No (UK: appearance exception needs info + a way to object; info is given in the Cookie Policy) | `apps/web/src/hooks/useTheme.ts`, `apps/web/src/theme/ThemeCookieSync.tsx`, `apps/web/src/config/userConfiguration.ts` |
| `gpderp-locale` | First party (web) | Remembers the chosen language for server rendering | Cookie, SameSite=Lax | 1 year | Necessary/exempt (set only on an explicit language change) | No | `apps/web/src/hooks/useLocale.ts`, `apps/web/src/i18n/request.ts` |
| `gpderp-celestial-slot` | First party (web) | Remembers the chosen sky theme slot for server rendering | Cookie, SameSite=Lax | 1 year (cleared when reset) | Necessary/exempt (set only on an explicit choice) | No | `apps/web/src/theme/celestialSlotPreference.ts` |
| `cf_clearance` | Cloudflare (on `gpderp.party`) | Bot detection: stores the JavaScript Detections result; Bot Fight Mode is on | Cookie, HttpOnly, Secure, SameSite=None, **Partitioned**; Cloudflare says it is "securely tied to the specific visitor and device" | **365 days** (observed `Expires`) | **Conditional/uncertain** | Uncertain in EU (site-wide bot protection, long lifetime); a banner cannot block it | Injected by Cloudflare edge (zone setting), not in the repo. Verified at runtime. |
| `__cf_bm` | Cloudflare | Bot Fight Mode bot score | Cookie | 30 min inactivity (per Cloudflare docs) | Unverified (not observed in test runs) | — | Cloudflare edge |

### 2.2 Browser storage

| Technology | Provider | Purpose | Storage/identifier | Duration | Classification | Consent required | Source location |
|---|---|---|---|---|---|---|---|
| `tab-id` | First party | Random per-tab UUID sent as `x-tab-id` so the API and live socket can tell tabs of the same session apart; hidden from API logs | sessionStorage | Until the tab closes | Necessary/exempt (created for **every** visitor, including guests) | No | `apps/web/src/utils/tabId.ts`, `apps/web/src/axios.setup.ts`, redaction in `apps/api/src/index.ts` |
| `gpderp.auth.postLoginReturn` | First party | Page to return to after signing in | sessionStorage | Until the tab closes or sign-in completes | Necessary/exempt | No | `apps/web/src/utils/auth/postLoginReturn.ts` |
| `gpderp-theme` | First party (`next-themes`) | Theme choice | localStorage | Until cleared | Necessary/exempt (written on explicit change) | No | `apps/web/src/theme/ThemeProvider.tsx` |
| `gpderp.profile.selectedTheme`, `.selectedThemeScale`, `.selectedCelestialSlot`, `.selectedLanguage`, `.haikuActionsOpen` | First party | User preferences | localStorage | Until cleared | Necessary/exempt (written on explicit change or profile load) | No | `apps/web/src/config/userConfiguration.ts` and consumers |
| `gpderp.pendingHaikuSubject`, `gpderp.pendingHaikuAfterPurchase` | First party | Keeps the haiku subject the user typed across sign-in or purchase | localStorage | Removed once submitted | Necessary/exempt | No | `HaikuGenerationStickyNote/hooks/usePendingHaikuSubmit.ts`, `NoCreditsLeft/pendingHaikuAfterPurchase.ts` |
| IndexedDB, Cache API, service workers | — | None in production (only Next.js dev tooling uses IndexedDB locally) | — | — | — | — | Verified at runtime: none on production |

### 2.3 Scripts, network reporting and integrations

| Technology | Provider | Purpose | Storage/identifier | Duration | Classification | Consent required | Source location |
|---|---|---|---|---|---|---|---|
| **Cloudflare Web Analytics** (`beacon.min.js` → `/cdn-cgi/rum`) | Cloudflare | Page-view and performance analytics | No cookies or storage (per Cloudflare docs, consistent with runtime). Sends page URL, referrer, user agent and client hints, JS heap memory, navigation timings, a random per-page-load id, plus the IP via the request | Per page load | **Consent required** (EU). UK: statistical exception possible only with information **and** an objection mechanism | **Yes, in the EU, as currently configured** | Cloudflare zone setting: Web Analytics site `gpderp.party`, `auto_install: true`, created 2026-09-08. Verified at runtime on desktop and mobile. |
| Cloudflare JavaScript Detections (`/cdn-cgi/challenge-platform/.../jsd/...`) | Cloudflare | Collects browser signals to tell bots from people; sets `cf_clearance` | See `cf_clearance` | 15-minute detection lifespan, cookie 365 days | **Conditional/uncertain** | Uncertain; cannot be turned off while Bot Fight Mode is on | Cloudflare zone: `fight_mode: true`, `enable_js: true`; no WAF custom rules exist |
| Network Error Logging (`nel` + `report-to` headers) | Cloudflare | Browser reports network failures to `a.nel.cloudflare.com` (failures only: `success_fraction: 0`) | Browser stores the reporting policy | `max_age` 604800 s (7 days) | **Conditional/uncertain** | Uncertain | Cloudflare zone setting `nel: enabled` (editable). Verified via response headers. |
| Google Sign-In (`accounts.google.com/gsi/client`) | Google | "Continue with Google" button | Third-party script; no cookies were observed on `gpderp.party`. Google may use its own cookies on its domains | — | Necessary/exempt for users who choose Google sign-in; loads when the sign-in modal or `/login` / `/register` opens, **before** the user picks Google | No for the sign-in itself; low-risk minimization possible (see §4) | `apps/web/src/components/GoogleOAuthScope/GoogleOAuthScope.tsx`, used in `AuthGateModal`, `app/login`, `app/register`. Verified at runtime. |
| Paddle.js checkout | Paddle (merchant of record) | Payment checkout | Unverified on our domain; Paddle documents its own cookies on its checkout | — | Necessary for a purchase the user starts; **Unverified** at runtime (checkout is disabled in production) | No for the purchase itself | `apps/web/src/app/providers/PaddleProvider.tsx`, `initPaddleClient.ts`, `loadPaddleSdk.ts` (same-origin proxy `/api/paddle-sdk`). Loaded only on purchase intent or a `?_ptxn=` payment link. Verified not loaded on normal pages. |
| Cloudflare Workers observability | Cloudflare | Worker invocation logs (server side) | No browser storage | Retention unverified | Personal-data processing (IP, URL), not a cookie matter | No | `apps/web/wrangler.jsonc` (`observability.enabled: true`) |
| Fastify/Pino request logging | First party (runs on AWS Lightsail) | Operational logs: method, URL, status, client IP (via `trustProxy`); cookies, `authorization`, `x-csrf-token`, `x-tab-id`, `sec-websocket-protocol` and `set-cookie` are redacted. Auth failures log IP and origin | No browser storage | Retention unverified (Lightsail container logs) | Personal-data processing, not a cookie matter | No | `apps/api/src/index.ts`, `apps/api/src/modules/auth/auth.controller.ts` |
| Auth session records | First party (Neon Postgres) | Session security: IP and user agent per session | Database | Session lifetime (30 days); deletion after expiry unverified | Personal-data processing | No | `apps/api/prisma/schema.prisma` (`AuthSession`), `auth.controller.ts` |
| Suspicious registration records | First party | Abuse prevention: normalized email, IP, country code and user agent of suspicious sign-up attempts | Database | No deletion job found | Personal-data processing | No | `schema.prisma` (`SuspiciousRegistrationAttempt`) |
| Debug auth logs | First party | Diagnosing unexpected sign-outs: IP, user agent, tab id | Database | — | Off in production (`DEBUG_AUTH_LOGS=false` in `infra/aws/config/runtime-env.json`) | No | `apps/api/src/modules/auth/debugAuthLog.ts` |
| Emails | First party (nodemailer) | Transactional emails | No tracking pixels; images are attached inline (`cid:`) | — | Not tracking | No | `apps/api/src/modules/email/` |
| Fonts | First party | Typography | Self-hosted via `next/font` (no Google Fonts requests at runtime) | — | Not tracking | No | `apps/web/src/app/layout.tsx` |

### 2.4 Added after the audit: monitoring and usage totals (see `docs/monitoring.md`)

| Technology | Provider | Purpose | Storage/identifier | Duration | Classification | Consent required | Source location |
|---|---|---|---|---|---|---|---|
| Browser error reporting (`@sentry/react`) | Better Stack | Find and fix crashes and failed API calls | No cookies or storage. On an error only: message and stack, page URL without query/fragment, user agent, release, random request id. No breadcrumbs, replay, sessions, tracing or user data | Better Stack Errors retention (90 days on the current plan, per pricing page; verify) | **Conditional/uncertain** (diagnostics script reading browser information; legitimate interest relied on, documented in the policies) | Uncertain in the EU; chosen to run without consent with minimal data | `apps/web/src/instrumentation-client.ts`, `src/utils/monitoring/` |
| API error reporting (`@sentry/node`) | Better Stack | Unexpected 5xx and crashes | Server-side only; bodies, cookies, query strings, credential headers, local variables, DB and AI data excluded | As above | Personal-data processing (server-side), not a device-access matter | No | `apps/api/src/instrument.ts`, `src/lib/observability/` |
| API warning/error log shipping (`@logtail/pino`) | Better Stack | Operational logs for failures | Server-side only; client IPs stripped before shipping; credentials redacted. Residual risk: third-party error messages (e.g. SMTP) may quote an email address | 3 days (free plan source retention) | Personal-data processing (server-side) | No | `apps/api/src/lib/observability/logger.ts` |
| `x-request-id` | First party | Correlate a browser request with API logs and error reports | Random per-request id in a request/response header; not stored in the browser | Per request | Necessary/exempt (no storage, not linked across requests) | No | `apps/web/src/axios.setup.ts`, `apps/api/src/lib/observability/requestId.ts` |
| Weekly usage totals | Cloudflare Workers Analytics Engine | New users, generations, generating users, average per user, per ISO week | Aggregate numbers only, computed server-side from existing tables; no ids, emails, IPs or content | Analytics Engine retention (verify) | Not personal data | No | `apps/api/src/modules/usageMetrics/`, `apps/web/src/app/api/internal/usage-metrics/route.ts` |

Effect on the decision: browser error reporting adds a second conditional item (after Cloudflare Web Analytics). It runs without a consent banner by explicit choice, with data minimized as above and disclosed in the Cookie and Privacy Policies. Server-side error tracking, log shipping and the weekly totals do not access the visitor's device.

**Not present at audit time (verified by code search and runtime):** Sentry or any other error-reporting SDK (since added: Better Stack via the Sentry SDK, section 2.4), session replay, Google Analytics/Tag Manager, Meta/LinkedIn/TikTok pixels, advertising tags, fingerprinting libraries in app code, and backend event tracking. The `next-auth` package is a dependency but is not used by app code.

---

## 3. Risks (ranked by privacy impact, then implementation priority)

1. **Cloudflare Web Analytics runs on every page with no consent and no objection mechanism.** It is the one technology that likely needs consent for EU visitors, and it is invisible in the repository. The old policies said "may use analytics" without naming it. *Impact: high. Fix effort: very low (one Cloudflare setting).*
2. **`cf_clearance` lasts 365 days and is set for every visitor on first load.** It is tied to the device and serves site-wide bot detection, not the user-centric login security that WP29 describes. No WAF custom rule uses the detection result; Bot Fight Mode uses it internally. *Impact: medium. Fix: not possible while Bot Fight Mode is on.*
3. **Policies were inaccurate.** They promised analytics that the code does not have, did not disclose the analytics Cloudflare actually runs, did not list cookies or durations, and named the operator differently from the Terms. *Impact: medium (transparency duties under GDPR Art. 13 and Israeli Amendment 13 section 11). Fixed in this change.*
4. **Network Error Logging** stores a 7-day reporting policy in the browser and sends failure reports to Cloudflare. *Impact: low to medium. Fix effort: very low (one Cloudflare setting).*
5. **Unknown log retention** at Cloudflare (Workers Logs), AWS Lightsail and Neon (backups). The API logs client IPs. *Impact: medium. Needs dashboard checks.*
6. **IP and user agent per session, and in suspicious-registration records, with no clean-up job found.** *Impact: low to medium. Fix: a periodic delete of expired sessions and old abuse records.*
7. **Google's sign-in script loads as soon as the sign-in modal opens**, so Google receives the visitor's IP and user agent even if they sign in with email. *Impact: low. Fix: load it on the Google button click.*
8. **`access_token` is readable by JavaScript.** A security hardening point (any XSS could read it), not a consent issue. *Impact: low for privacy.*
9. **`gpderp-theme` is written on first load even without a choice, and without `Secure`.** *Impact: very low.*
10. **`tab-id` is created for guests who never sign in.** It's random and per-tab, so the impact is very low.

---

## 4. Recommendations

### Keep (necessary)
- Auth cookies (`access_token`, `refresh_token`, `csrf_token`), the preference cookies and storage, `postLoginReturn`, the pending-haiku keys and `tab-id`.
- Google Sign-In and Paddle, loaded only after a user action.
- API request logging with the existing redaction.

### Reconfigure (needs your decision; not done in this change)
1. **Turn off Cloudflare Web Analytics automatic setup for `gpderp.party`** (Cloudflare dashboard → Web Analytics → site → disable, or set `auto_install: false`). This is the change that makes the site banner-free. Then remove the Web Analytics section from the Cookie and Privacy Policies.
2. **Network Error Logging:** consider turning it off (zone setting `nel`). It mainly helps Cloudflare's network diagnostics.
3. **Bot Fight Mode / JavaScript Detections:** keep for now (your choice), and keep it disclosed. If you later want to cut the 365-day device cookie, turning off Bot Fight Mode is the only way on this plan, at the cost of weaker bot protection.
4. **Retention:** add a scheduled job that deletes expired `AuthSession` rows and `SuspiciousRegistrationAttempt` rows older than a fixed period (for example 90 days). Check log retention in Lightsail and Cloudflare.
5. **Minor code minimization (optional):** load Google's script on the Google button click, write `gpderp-theme` only on an explicit choice and with `Secure`, and create `tab-id` lazily.

### Adding analytics later

| Option | What it is | Browser storage/access | Banner? |
|---|---|---|---|
| **A. Server-side aggregate counts** (recommended) | The API increments daily counters (page renders by route, sign-ups, generations, purchases), with no IP, user id or user agent stored | None | No. Not a storage/access technology. Disclose in the Privacy Policy |
| **B. Cloudflare Web Analytics, manual install** | Same beacon, but rendered only by the app after consent | Reads device information (as above) | **Yes** for the EU. UK: statistical exception possible with clear information plus an objection toggle |
| **C. Other browser analytics** (Plausible, Umami, PostHog, and similar) | Third-party or self-hosted script | Varies; cookie-free tools still access device information | Usually yes for the EU |

**Consent design to use if option B or C is chosen** (kept small, using the existing stack):
- A `ConsentProvider` plus a `useConsent` hook. State is stored in one first-party cookie (for example `gpderp-consent`, holding `{ v: <policyVersion>, analytics: boolean, ts }`), so the server can render without a flash. Optional categories default to off.
- Only categories that exist are shown: **Essential** (always on: sign-in, security, preferences, consent storage) and **Analytics** (off by default).
- An `OptionalScript` gate renders the analytics script only when consent is `true`, with a module-level guard against loading it twice. On withdrawal, stop sending and reload. Cloudflare's beacon stores nothing in the browser, so there is nothing to clear.
- Bumping the policy version re-asks the question.
- UI: a compact bottom banner titled "A tiny cookie intermission" with equally styled "Reject optional" and "Accept all" buttons, plus "Customize". The "Cookie settings" modal reuses the existing comic modal primitives. A footer "Cookie settings" link reopens it. Keyboard and focus handling and reduced motion as elsewhere in the app.
- The banner copy must say the site uses a cookie-free analytics script, not "cookies only".

---

## 5. Implementation changes (this change)

No banner or consent module was added: the application code has nothing that needs consent. The one technology that does (Cloudflare Web Analytics) is a Cloudflare setting, and the recommended fix is to switch it off rather than add a banner.

| File | Change |
|---|---|
| `docs/privacy-audit.md` | Created (this document). |
| `apps/web/src/content/cookie-policy.md` | Rewritten to list the cookies, storage and edge technologies actually used, with durations, providers and how to control them. Discloses Cloudflare Web Analytics as currently active. Removes the vague "may use analytics" wording. |
| `apps/web/src/content/privacy-policy.md` | Names the operator as in the Terms. Replaces the vague analytics wording with what is actually collected: server logs with IP, session IP and user agent, abuse-prevention records, Cloudflare security and analytics, Google sign-in data, and haiku subjects sent to the AI provider. Lists the processors (Cloudflare including R2 file storage, AWS, database hosting, email delivery, OpenAI, Google, Paddle). States the verified session lifetime (30 days in production); other retention is left general. Points to the Cookie Policy for cookies. |
| `apps/web/src/content/legalContent.generated.ts` | Regenerated from the Markdown by `scripts/generate-legal-content.mjs`. |

No changes were made to Cloudflare settings, sign-in, payments, or any production data.

---

## 6. Validation results

**Tooling:** Playwright (Chromium 1208, headless) with a fresh browser context per run. Probe scripts were kept outside the repository.

| # | Scenario | Result |
|---|---|---|
| 1–2 | Clean browser, first visit, no interaction (production, desktop and mobile/iPhone 13) | Cookies: `cf_clearance` (Cloudflare, 365 d, HttpOnly, Partitioned) and `gpderp-theme` (1 y). sessionStorage: `tab-id`. localStorage, IndexedDB, Cache API, service workers: empty. Third-party requests: `static.cloudflareinsights.com` (Web Analytics). Edge scripts: JS Detections. Headers: `nel` + `report-to`. |
| 1–2 | Same on local dev (no Cloudflare edge) | Cookies: `gpderp-theme` only. sessionStorage: `tab-id`. No third-party requests. Confirms that `cf_clearance`, Web Analytics and NEL come from Cloudflare, not the app. |
| 7 | Client-side navigation to `/pricing` | No new cookies or storage. Web Analytics reports the route change (it tracks single-page navigation). |
| — | Opening the sign-in modal (production and local) | `accounts.google.com/gsi/client` loads. sessionStorage gains `gpderp.auth.postLoginReturn`. No new cookies on `gpderp.party`. |
| — | Web Analytics payload | POST `/cdn-cgi/rum` with `location`, referrer, user agent and client hints, `memory`, `timingsV2`, browser info, a per-page-load UUID, `siteToken`. No cookie or storage. |
| — | Paddle | Paddle.js never requested on normal pages (production and local). |
| — | Cloudflare configuration (read-only API) | Web Analytics site `gpderp.party`: `auto_install: true`. Bot management: `fight_mode: true`, `enable_js: true`. `nel`: enabled. No WAF custom rules exist. |
| 3–6, 8–9 | Reject / accept / customize / reload / withdraw / policy-version update | **Not applicable**: no consent mechanism was implemented. |
| 10 | Authenticated session | **Not run at runtime.** It would need a test account and database writes. Auth cookies are documented from code (`tokenService.ts`). |
| 11 | Google login and payment flows | Script loading verified. A full Google login and a Paddle checkout were **not** run, to avoid real accounts or payments. Checkout is disabled in production. |
| 12 | Mobile viewport | Same results as desktop. Keyboard accessibility not applicable (no new UI). |
| 13 | Production | Covered above. |

**Policy changes:** `node scripts/generate-legal-content.mjs` regenerated the bundle, `tsc --noEmit` passed, and `/cookies` and `/privacy` render on local dev (HTTP 200) with the new sections and dates.

**Remaining gaps:** cookies Google sets on its own domains during sign-in; Paddle.js storage during a real checkout; whether `__cf_bm` appears under bot-score conditions; log retention at each provider.

---

## 7. Manual verification (outside the repository)

1. **Cloudflare dashboard → Web Analytics:** decide on the automatic setup for `gpderp.party` (recommended: turn off). Note that a second site (`graceful-laundry.org`) on the same account also has automatic setup on.
2. **Cloudflare → Security → Settings:** Bot Fight Mode and JS Detections state. Check the `cf_clearance` lifetime ("Challenge Passage" setting) — 365 days was observed.
3. **Cloudflare → Network:** Network Error Logging state.
4. **Cloudflare → Workers → `gpderp-party` → Logs:** retention period and whether request logs include client IPs.
5. **AWS Lightsail → `container-service-1` → Logs:** retention period of container logs (which contain client IPs).
6. **Neon:** backup and point-in-time-restore retention for the production branch.
7. **Email provider (SMTP host used by nodemailer):** whether it adds open or click tracking at the provider level.
8. **Google Cloud Console (OAuth client):** consent-screen links to the Privacy Policy and Terms.
9. **Paddle:** confirm which cookies Paddle.js sets during a sandbox checkout, before enabling live checkout.
10. **Legal review:** confirm the classification of `cf_clearance` (365 days) and NEL for EU visitors, and whether the UK statistical exception or Israeli implied-consent notice would be relied on if analytics is kept.
