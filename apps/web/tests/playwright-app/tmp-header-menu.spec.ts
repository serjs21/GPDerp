import { test, type Page } from "playwright/test";

function fakeJwt(payload: Record<string, unknown>) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.sig`;
}

const MEMBER = {
  id: "user-1",
  email: "member@example.com",
  userName: "member",
  firstName: "Mem",
  lastName: "Ber",
  avatar: "",
  avatarManuallySet: false,
  emailVerifiedAt: "2026-01-01T00:00:00.000Z",
};

async function mockApi(page: Page, loggedIn: boolean) {
  const appOrigin = new URL(test.info().project.use.baseURL!).origin;
  await page.route(
    (url) => url.origin !== appOrigin && /^(localhost|127\.0\.0\.1)$/.test(url.hostname),
    async (route) => {
      const { pathname } = new URL(route.request().url());
      if (!loggedIn) return route.fulfill({ status: 401, json: { ok: false, error: "unauthorized" } });
      if (pathname === "/auth/me") return route.fulfill({ json: { ok: true, data: { user: MEMBER, account: [] } } });
      if (pathname === "/haiku")
        return route.fulfill({ json: { ok: true, data: { haikus: [], total: 0, pageSize: 20, offset: 0 } } });
      if (pathname === "/haiku/manage_labels/account")
        return route.fulfill({ json: { ok: true, data: { accountId: "account-1" } } });
      if (pathname.startsWith("/haiku/labels/"))
        return route.fulfill({ json: { ok: true, data: { labels: [], total: 0, pageSize: 50, offset: 0 } } });
      if (pathname === "/share_links")
        return route.fulfill({ json: { ok: true, data: { items: [], total: 0, pageSize: 50, offset: 0 } } });
      if (pathname === "/user/profile")
        return route.fulfill({
          json: { ok: true, data: { ...MEMBER, providers: [], configuration: { theme: "night-sky", language: "en" } } },
        });
      return route.fulfill({ json: { ok: true, data: [] } });
    },
  );
  if (!loggedIn) return;
  await page.context().addCookies([
    {
      name: "access_token",
      value: fakeJwt({
        sub: MEMBER.id,
        sid: "session-1",
        exp: Math.floor(Date.now() / 1000) + 3600,
        userName: MEMBER.userName,
        avatar: "",
        emailVerifiedAt: MEMBER.emailVerifiedAt,
      }),
      url: appOrigin,
    },
  ]);
}

const measure = (page: Page) =>
  page.evaluate(() => {
    const header = document.querySelector("header")!.getBoundingClientRect();
    const main = document.querySelector("main")!.getBoundingClientRect();
    const lang = document.querySelector("header [aria-label='Language']")?.getBoundingClientRect();
    return { h: Math.round(header.height), main: Math.round(main.top), langTop: lang ? Math.round(lang.top) : null };
  });

const PAGES = [
  { name: "home", path: "/", loggedIn: true },
  { name: "settings-profile", path: "/settings", loggedIn: true },
  { name: "settings-links", path: "/settings?tab=share-links", loggedIn: true },
];

for (const p of PAGES) {
  test(`menu ${p.name}`, async ({ page }) => {
    await mockApi(page, p.loggedIn);
    const rows: string[] = [];
    for (const width of [360, 390, 430, 505, 506, 560, 640, 700, 768, 900, 1024]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(p.path);
      const trigger = page.locator("header button[aria-haspopup='listbox']").first();
      await trigger.waitFor();
      await page.waitForTimeout(600);
      const closed = await measure(page);
      await trigger.click();
      await page.waitForTimeout(900);
      const open = await measure(page);
      if (width === 390 || width === 505) {
        await page.screenshot({ path: `local/tmp-menu-${p.name}-${width}.png`, clip: { x: 0, y: 0, width, height: 300 } });
      }
      const changed = closed.h !== open.h || closed.main !== open.main || closed.langTop !== open.langTop;
      rows.push(`${width}: ${changed ? "CHANGED" : "same"} closed=${JSON.stringify(closed)} open=${JSON.stringify(open)}`);
    }
    console.log(`\n${p.name}\n${rows.join("\n")}`);
  });
}
