# Cookie Policy

**Last updated:** October 31, 2026

This Cookie Policy explains which cookies and similar technologies GPDerp (gpderp.party), the Haiku generation service, uses, why, and for how long. It is a companion to our [Privacy Policy](/privacy), which covers personal data more broadly. GPDerp is operated by Sergey Sablin, a sole proprietor based in Israel.

---

## What these technologies are

**Cookies** are small text files a website stores in your browser. **Local storage** and **session storage** are similar browser features that keep small pieces of data on your device; session storage is cleared when you close the tab. Some **scripts** can also read information from your browser (for example its type or performance figures) and send it to a server without storing anything.

We do not use advertising cookies, advertising pixels, cross-site tracking, or session recording.

---

## Essential: signing in and security

These are needed for features you ask for, such as signing in and staying signed in. They are only set once you sign in or register.

- **access_token** (cookie, set by us): keeps you signed in. Lasts 15 minutes and is renewed automatically while you use the site.
- **refresh_token** (cookie, set by us): renews your sign-in. Lasts up to 30 days, or until you sign out.
- **csrf_token** (cookie, set by us): protects your account against cross-site request forgery. Set together with your sign-in.
- **gpderp.auth.postLoginReturn** (session storage): remembers which page to bring you back to after signing in. Cleared when you close the tab.
- **tab-id** (session storage): a random identifier for the current browser tab, so your signed-in tabs stay in sync. It is not linked to you across visits and is cleared when you close the tab.

---

## Preferences

These remember choices you make so the site looks and works the way you set it. They are not used for anything else.

- **gpderp-theme** (cookie and local storage): your light or dark theme, so pages load in the right theme. The cookie lasts 1 year.
- **gpderp-locale** (cookie): the language you chose. Lasts 1 year.
- **gpderp-celestial-slot** (cookie): the sky theme you chose. Lasts 1 year, or until you reset it.
- **gpderp.profile.\*** (local storage): your theme, language, sky theme and haiku-actions panel preferences. Kept until you clear your browser data.
- **gpderp.pendingHaikuSubject** and **gpderp.pendingHaikuAfterPurchase** (local storage): keep the haiku subject you typed while you sign in or buy credits, so it isn't lost. Removed once the haiku is submitted.

---

## Cloudflare: security and site measurement

Our site is delivered through **Cloudflare**, which adds the following on every page:

- **cf_clearance** (cookie, set by Cloudflare on gpderp.party): records the result of Cloudflare's automated bot check, which runs a small script in your browser to tell people from bots and protect the site from abuse. It is encrypted, cannot be read by us, and currently lasts up to 1 year.
- **Network Error Logging** (a browser setting delivered with our pages): if a page fails to load because of a network problem, your browser may send Cloudflare a short error report (for example the type of error and when it happened). The setting lasts 7 days. Successful page loads are not reported.
- **Cloudflare Web Analytics** (a script, no cookies or storage): measures how our pages are used and how fast they load. For each page view it sends Cloudflare the page address, the referring page, your browser type and version, and page-load timing and memory figures. Cloudflare states that it does not use cookies or local storage for this and does not fingerprint visitors. We only see aggregated statistics. If you prefer that this measurement not run, you can block `static.cloudflareinsights.com` with your browser's content blocker; the site works without it.

Cloudflare may also set other security cookies (such as **\_\_cf\_bm**, which lasts up to 30 minutes) if it detects unusual traffic. See [Cloudflare's cookie list](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/) and [Cloudflare's privacy policy](https://www.cloudflare.com/privacypolicy/).

---

## Error reporting

When something breaks in your browser (a page crashes, or our server answers with an error), our pages send a short **error report** to **Better Stack**, the service we use to find and fix bugs. A report contains the error message and where in our code it happened, the page address **without** any query string, your browser type and version, the app version, and a random request identifier that lets us match it with our server logs. It uses no cookies or local storage, does not record your screen or clicks, and contains no account details. Nothing is sent while everything works. See [Better Stack's privacy policy](https://betterstack.com/privacy).

---

## Third parties you choose to use

- **Google sign-in.** When you open the sign-in or registration screen, your browser loads Google's sign-in script from accounts.google.com so the "Continue with Google" button can work. If you sign in with Google, Google handles that step under [Google's privacy policy](https://policies.google.com/privacy) and may use its own cookies on its own domains.
- **Paddle checkout.** When you start a purchase, your browser loads Paddle's checkout. **Paddle** is our merchant of record and may set its own cookies or use similar technologies to process the payment and prevent fraud, under [Paddle's privacy notice](https://www.paddle.com/legal/privacy) and the terms shown at checkout.

Neither of these loads until you open sign-in or start a purchase.

---

## Your choices

- You can view, block or delete cookies and site data in your browser settings. If you block or delete the essential sign-in cookies, you will be signed out and may not be able to sign in.
- Deleting the preference cookies or storage resets your theme and language choices.
- You can block Cloudflare Web Analytics as described above.

We do not use advertising or cross-site tracking technologies. If we add technologies that need your permission, we will update this page first and ask for your consent where the law requires it.

---

## Updates

We may update this Policy from time to time. The "Last updated" date above will change when we do.

---

## Contact

Questions: email [toaster@gpderp.party](mailto:toaster@gpderp.party), or see the [Privacy Policy](/privacy) for more on your rights and our practices.
