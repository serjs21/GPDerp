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

const LABELS = [0, 1, 2, 3].map((n) => ({
  id: `label-${n}`,
  name: `Label ${n}`,
  color: "#c47a7a",
  shape: "burst",
  accountId: "account-1",
  createdAt: `2026-09-0${n + 1}T12:00:00.000Z`,
  connectedHaikus:
    n === 1
      ? { total: 1, items: [{ id: "h1", title: "Night questions", body: "a\nb\nc\n—Jean" }] }
      : { total: 0, items: [] },
}));

async function mockApi(page: Page) {
  const appOrigin = new URL(test.info().project.use.baseURL!).origin;
  await page.route(
    (url) => url.origin !== appOrigin && /^(localhost|127\.0\.0\.1)$/.test(url.hostname),
    async (route) => {
      const { pathname } = new URL(route.request().url());
      if (pathname === "/auth/me") return route.fulfill({ json: { ok: true, data: { user: MEMBER, account: [] } } });
      if (pathname === "/haiku/manage_labels/account")
        return route.fulfill({ json: { ok: true, data: { accountId: "account-1" } } });
      if (pathname.startsWith("/haiku/labels/"))
        return route.fulfill({ json: { ok: true, data: { labels: LABELS, total: 4, pageSize: 50, offset: 0 } } });
      if (pathname === "/user/profile")
        return route.fulfill({
          json: { ok: true, data: { ...MEMBER, providers: [], configuration: { theme: "night-sky", language: "en" } } },
        });
      return route.fulfill({ json: { ok: true, data: [] } });
    },
  );
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
    const stacks = [...document.querySelectorAll("[role='group'][aria-label^='Label actions'], [role='group']")].filter((g) =>
      g.querySelector("img[src*='not_connected_action']"),
    );
    return stacks.slice(0, 1).map((g) => {
      const wrapper = g.firstElementChild as HTMLElement;
      const panels = [...g.querySelectorAll("button")].map((b) => Math.round(b.getBoundingClientRect().height));
      return { wrapperDisplay: getComputedStyle(wrapper).display, buttonHeights: panels.join("/") };
    });
  });

for (const mode of ["normal", "dev-order"]) {
  test(`tune-in panel height (${mode}, svg delayed 3s)`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await mockApi(page);
    await page.route("**/not_connected_action.svg", async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });
    await page.goto("/settings?tab=labels");
    await page.locator("img[src*='not_connected_action']").first().waitFor({ state: "attached" });
    if (mode === "dev-order") {
      await page.evaluate(() => {
        const root = [...document.styleSheets]
          .flatMap((sheet) => { try { return [...sheet.cssRules]; } catch { return []; } })
          .map((rule) => (rule as CSSStyleRule).selectorText ?? "")
          .find((sel) => /^\.HoverHoldCallout-module__\w+__root$/.test(sel));
        const style = document.createElement("style");
        style.textContent = `${root} { display: inline-block; }`;
        document.head.appendChild(style);
      });
    }
    await page.waitForTimeout(800);
    console.log(mode, "before svg", JSON.stringify(await measure(page)));
    await page.screenshot({ path: `/tmp/gpderp-shots/tunein-${mode}-loading.png`, clip: { x: 900, y: 150, width: 380, height: 420 } });
    await page.waitForTimeout(3200);
    console.log(mode, "after svg", JSON.stringify(await measure(page)));
  });
}
