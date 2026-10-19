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

test("not-connected action svg timing", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await mockApi(page);
  const t0 = Date.now();
  page.on("requestfinished", (req) => {
    if (req.url().includes("not_connected_action")) console.log("svg finished", Date.now() - t0, "ms");
  });
  page.on("requestfailed", (req) => {
    if (req.url().includes("label_actions")) console.log("FAILED", req.url(), req.failure()?.errorText);
  });
  await page.goto("/settings?tab=labels");
  for (let i = 0; i < 12; i++) {
    const state = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll<HTMLImageElement>("img[src*='not_connected_action']")];
      return {
        revealed: document.documentElement.dataset.hydrated === "true",
        imgs: imgs.map((img) => {
          const r = img.getBoundingClientRect();
          return `${img.complete ? "complete" : "loading"}/${img.naturalWidth}w/${Math.round(r.width)}x${Math.round(r.height)}`;
        }),
      };
    });
    console.log(Date.now() - t0, "ms", JSON.stringify(state));
    if (i === 1 || i === 11) {
      await page.screenshot({ path: `/tmp/gpderp-shots/label-actions-${i}.png`, clip: { x: 900, y: 150, width: 380, height: 700 } });
    }
    await page.waitForTimeout(150);
  }
});
