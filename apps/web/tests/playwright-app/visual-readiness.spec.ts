import { expect, test, type Page, type Route } from "playwright/test";

/**
 * First-load visual readiness: the HtmlLoader must stay up until auth is initialized AND the
 * view's critical art is decoded (or the bounded cap reveals a degraded view). Assertions use
 * observable state captured at the reveal moment, not final-state screenshots.
 */

const BACKGROUND = "**/background/background_base*.webp";
const MOUNTAIN_MASK = "**/background/masks/mountain-mask.png";
const ROTATED_LANTERN = "**/lantern/lantern_base_rotated.webp";
const UPRIGHT_LANTERN = "**/lantern/lantern_base.webp";
const FIRST_REVEAL_MAX_WAIT_MS = 5000;
const SHARE_LINKS_SORT_COVER = "**/sort_button/time_cover.svg";
const CONTROL_ART_MAX_WAIT_MS = 2000;

type RevealProbe = {
  revealAt: number | null;
  visualReady: string | null;
  authReadyAt: number | null;
  artAtReveal: { complete: boolean; naturalWidth: number }[];
  memberViewAtReveal: boolean;
};

async function installRevealProbe(page: Page) {
  await page.addInitScript(() => {
    const probe = {
      revealAt: null,
      visualReady: null,
      authReadyAt: null,
      artAtReveal: [],
      memberViewAtReveal: false,
    } as {
      revealAt: number | null;
      visualReady: string | null;
      authReadyAt: number | null;
      artAtReveal: { complete: boolean; naturalWidth: number }[];
      memberViewAtReveal: boolean;
    };
    (window as unknown as { __reveal: typeof probe }).__reveal = probe;
    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      // Guest auth initialized: Login/Register lanterns mounted (under the loader).
      if (probe.authReadyAt === null && document.querySelector('[class*="AuthLanternEntry"]')) {
        probe.authReadyAt = performance.now();
      }
      if (probe.revealAt === null && root.dataset.hydrated === "true") {
        probe.revealAt = performance.now();
        probe.visualReady = root.dataset.visualReady ?? null;
        probe.artAtReveal = [...document.querySelectorAll<HTMLImageElement>("img")]
          .filter((img) => img.src.includes("/background/"))
          .map((img) => ({ complete: img.complete, naturalWidth: img.naturalWidth }));
        probe.memberViewAtReveal = Boolean(document.querySelector('[class*="HaikuDisplay"]'));
      }
    });
    const start = () =>
      observer.observe(document.documentElement, { attributes: true, childList: true, subtree: true });
    if (document.documentElement) start();
    else document.addEventListener("readystatechange", start, { once: true });
  });
}

const readProbe = (page: Page) =>
  page.evaluate(() => (window as unknown as { __reveal: RevealProbe }).__reveal);

/** Hold matching requests until `release()`; `abort` fails them instead. */
async function holdRequests(page: Page, pattern: string, mode: "hold" | "abort" = "hold") {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  let seen = 0;
  await page.route(pattern, async (route: Route) => {
    seen += 1;
    if (mode === "abort") return route.abort();
    await gate;
    await route.continue().catch(() => {});
  });
  return { release, seen: () => seen };
}

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

/** Mock the API origin (anything not served by the Next app). */
async function mockApi(page: Page, { loggedIn }: { loggedIn: boolean }) {
  const appOrigin = new URL(test.info().project.use.baseURL!).origin;
  await page.route(
    (url) => url.origin !== appOrigin && /^(localhost|127\.0\.0\.1)$/.test(url.hostname),
    async (route) => {
      const { pathname } = new URL(route.request().url());
      if (!loggedIn) return route.fulfill({ status: 401, json: { ok: false, error: "unauthorized" } });
      if (pathname === "/auth/me") {
        return route.fulfill({ json: { ok: true, data: { user: MEMBER, account: [] } } });
      }
      if (pathname === "/haiku") {
        return route.fulfill({ json: { ok: true, data: { haikus: [], total: 0, pageSize: 20, offset: 0 } } });
      }
      if (pathname === "/haiku/manage_labels/account") {
        return route.fulfill({ json: { ok: true, data: { accountId: "account-1" } } });
      }
      if (pathname.startsWith("/haiku/labels/")) {
        return route.fulfill({ json: { ok: true, data: { labels: [], total: 0, pageSize: 50, offset: 0 } } });
      }
      if (pathname === "/share_links") {
        return route.fulfill({ json: { ok: true, data: { items: [], total: 0, pageSize: 50, offset: 0 } } });
      }
      if (pathname === "/user/profile") {
        return route.fulfill({
          json: {
            ok: true,
            data: {
              ...MEMBER,
              providers: [],
              configuration: { theme: "night-sky", language: "en" },
            },
          },
        });
      }
      return route.fulfill({ json: { ok: true, data: [] } });
    },
  );
  if (loggedIn) {
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
}

const loader = (page: Page) => page.locator(".scene-container");
const isRevealed = (page: Page) =>
  page.evaluate(() => document.documentElement.dataset.hydrated === "true");

async function expectArtCompleteAtReveal(page: Page) {
  const probe = await readProbe(page);
  expect(probe.revealAt).not.toBeNull();
  expect(probe.artAtReveal).toHaveLength(2);
  for (const art of probe.artAtReveal) {
    expect(art.complete).toBe(true);
    expect(art.naturalWidth).toBeGreaterThan(0);
  }
  return probe;
}

test.describe("first-load visual readiness", () => {
  test.beforeEach(async ({ page }) => {
    await installRevealProbe(page);
  });

  test("guest: loader holds while the background is downloading, then reveals complete", async ({ page }) => {
    await mockApi(page, { loggedIn: false });
    const background = await holdRequests(page, BACKGROUND);
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Auth is initialized (guest lanterns mounted under the loader) but art is still pending.
    await page.waitForFunction(() => (window as unknown as { __reveal: RevealProbe }).__reveal.authReadyAt !== null);
    expect(background.seen()).toBeGreaterThan(0);
    expect(await isRevealed(page)).toBe(false);
    await expect(loader(page)).toBeVisible();

    background.release();
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    await expect(loader(page)).toBeHidden();
    const probe = await expectArtCompleteAtReveal(page);
    expect(probe.visualReady).toBe("ready");
  });

  test("guest: Login/Register lantern mask is part of the Main view's readiness", async ({ page }) => {
    await mockApi(page, { loggedIn: false });
    const lanternMask = await holdRequests(page, ROTATED_LANTERN);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => (window as unknown as { __reveal: RevealProbe }).__reveal.authReadyAt !== null);
    // Background + mountain mask can finish; the lantern mask is still held.
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLImageElement>("img")]
        .filter((img) => img.src.includes("/background/"))
        .every((img) => img.complete && img.naturalWidth > 0),
    );
    expect(await isRevealed(page)).toBe(false);

    lanternMask.release();
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    expect((await readProbe(page)).visualReady).toBe("ready");
  });

  test("CSS-only mountain mask is part of the shell's readiness", async ({ page }) => {
    await mockApi(page, { loggedIn: false });
    const mountainMask = await holdRequests(page, MOUNTAIN_MASK);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLImageElement>("img")]
        .filter((img) => img.src.includes("/background/"))
        .every((img) => img.complete && img.naturalWidth > 0),
    );
    expect(await isRevealed(page)).toBe(false);

    mountainMask.release();
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    expect((await readProbe(page)).visualReady).toBe("ready");
  });

  test("failed background reveals degraded within the cap, without a broken frame", async ({ page }) => {
    await mockApi(page, { loggedIn: false });
    await holdRequests(page, BACKGROUND, "abort");
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true", null, {
      timeout: FIRST_REVEAL_MAX_WAIT_MS + 10_000,
    });
    const probe = await readProbe(page);
    expect(probe.visualReady).toBe("degraded");
    expect(probe.revealAt! - probe.authReadyAt!).toBeLessThanOrEqual(FIRST_REVEAL_MAX_WAIT_MS + 1000);
    // Decorative imgs use alt="", so a failed load renders nothing rather than a broken-image icon.
    const alts = await page.$$eval('img[src*="/background/"]', (imgs) => imgs.map((img) => img.getAttribute("alt")));
    expect(alts).toEqual(["", ""]);
  });

  test("slow background past the cap reveals degraded instead of blocking", async ({ page }) => {
    await mockApi(page, { loggedIn: false });
    const background = await holdRequests(page, BACKGROUND);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true", null, {
      timeout: FIRST_REVEAL_MAX_WAIT_MS + 10_000,
    });
    expect((await readProbe(page)).visualReady).toBe("degraded");
    background.release();
  });

  test("warm reload: critical art served from cache, reveal follows auth immediately", async ({ page }) => {
    await mockApi(page, { loggedIn: false });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.dataset.visualReady === "ready");

    await page.reload();
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    const probe = await expectArtCompleteAtReveal(page);
    expect(probe.visualReady).toBe("ready");
    // No extra loading state on a warm cache: reveal lands within a few frames of auth init.
    expect(probe.revealAt! - probe.authReadyAt!).toBeLessThan(250);
  });

  test("rapid reload while art is downloading still ends in a complete reveal", async ({ page }) => {
    await mockApi(page, { loggedIn: false });
    const background = await holdRequests(page, BACKGROUND);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => (window as unknown as { __reveal: RevealProbe }).__reveal.authReadyAt !== null);
    await page.reload({ waitUntil: "commit" });
    background.release();
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    const probe = await expectArtCompleteAtReveal(page);
    expect(probe.visualReady).toBe("ready");
  });

  test("reduced motion: same gated reveal", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await mockApi(page, { loggedIn: false });
    const background = await holdRequests(page, BACKGROUND);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => (window as unknown as { __reveal: RevealProbe }).__reveal.authReadyAt !== null);
    expect(await isRevealed(page)).toBe(false);
    background.release();
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    await expectArtCompleteAtReveal(page);
  });

  test("member on Main waits for the lantern path art", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    const lantern = await holdRequests(page, UPRIGHT_LANTERN);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect.poll(() => lantern.seen()).toBeGreaterThan(0);
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLImageElement>("img")]
        .filter((img) => img.src.includes("/background/"))
        .every((img) => img.complete && img.naturalWidth > 0),
    );
    expect(await isRevealed(page)).toBe(false);
    lantern.release();
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    expect((await readProbe(page)).visualReady).toBe("ready");
    expect((await readProbe(page)).memberViewAtReveal).toBe(true);
  });

  test("member on Main: reveal waits for the code-split member view to mount", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    let held = 0;
    await page.route("**/_next/static/chunks/*.js", async (route) => {
      const response = await route.fetch();
      const body = await response.text();
      if (body.includes("HaikuDisplay-module")) {
        held += 1;
        await gate;
      }
      await route.fulfill({ response, body }).catch(() => {});
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect.poll(() => held).toBeGreaterThan(0);
    await page.waitForFunction(() =>
      [...document.querySelectorAll<HTMLImageElement>("img")]
        .filter((img) => img.src.includes("/background/"))
        .every((img) => img.complete && img.naturalWidth > 0),
    );
    await page.waitForTimeout(500);
    expect(await isRevealed(page)).toBe(false);
    release();
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    expect((await readProbe(page)).memberViewAtReveal).toBe(true);
  });

  test("member on Settings waits only for shell art, not Main's lantern art", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    const lantern = await holdRequests(page, UPRIGHT_LANTERN);
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
    await expectArtCompleteAtReveal(page);
    await expect(page.locator('main[class*="profilePage"]')).toBeAttached();
    expect(lantern.seen()).toBe(0);
    lantern.release();
  });

  test("settings share-links: sort coins stay hidden until their cover art decodes", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    const cover = await holdRequests(page, SHARE_LINKS_SORT_COVER);
    await page.goto("/settings?tab=share-links", { waitUntil: "domcontentloaded" });
    const cluster = page.locator('[role="radiogroup"]');
    await expect(cluster).toBeAttached();
    await expect.poll(() => cover.seen()).toBeGreaterThan(0);
    expect(await cluster.evaluate((node) => getComputedStyle(node).visibility)).toBe("hidden");

    cover.release();
    await expect.poll(() => cluster.evaluate((node) => getComputedStyle(node).visibility)).toBe("visible");
    const covers = await cluster.evaluate((node) =>
      [...node.querySelectorAll<HTMLImageElement>('img[src*="_cover"]')].map((img) => ({
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      })),
    );
    expect(covers).toHaveLength(4);
    for (const art of covers) {
      expect(art.complete).toBe(true);
      expect(art.naturalWidth).toBeGreaterThan(0);
    }
  });

  test("settings share-links: failed cover art reveals the coins within the cap", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    await holdRequests(page, SHARE_LINKS_SORT_COVER, "abort");
    await page.goto("/settings?tab=share-links", { waitUntil: "domcontentloaded" });
    const cluster = page.locator('[role="radiogroup"]');
    await expect(cluster).toBeAttached();
    await expect
      .poll(() => cluster.evaluate((node) => getComputedStyle(node).visibility), {
        timeout: CONTROL_ART_MAX_WAIT_MS + 3000,
      })
      .toBe("visible");
  });

  test("settings: page stays hidden until the tab strip art decodes, then reveals complete", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    const tabIcon = await holdRequests(page, "**/profile/share_link.svg");
    await page.goto("/settings?tab=share-links", { waitUntil: "domcontentloaded" });
    const main = page.locator('main[class*="profilePage"]');
    await expect(main).toBeAttached();
    expect(await main.evaluate((node) => getComputedStyle(node).visibility)).toBe("hidden");

    tabIcon.release();
    await expect.poll(() => main.evaluate((node) => getComputedStyle(node).visibility)).toBe("visible");
    const icons = await main.evaluate((node) =>
      [...node.querySelectorAll<HTMLImageElement>('img[src*="/profile/"], img[src*="/share_links_filter/"]')].map(
        (img) => img.complete && img.naturalWidth > 0,
      ),
    );
    expect(icons.length).toBeGreaterThanOrEqual(7);
    expect(icons.every(Boolean)).toBe(true);

    // Switching tabs after the first view must not hide the page again.
    await page.evaluate(() => {
      (window as unknown as { next: { router: { replace: (href: string) => void } } }).next.router.replace(
        "/settings?tab=labels",
      );
    });
    await page.waitForURL((url) => url.searchParams.get("tab") === "labels");
    expect(await main.evaluate((node) => getComputedStyle(node).visibility)).toBe("visible");
  });

  test("settings labels: page stays hidden until the create ticket art decodes", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    const ticket = await holdRequests(page, "**/create_label_button_base/label_ticket_base.svg");
    await page.goto("/settings?tab=labels", { waitUntil: "domcontentloaded" });
    const main = page.locator('main[class*="profilePage"]');
    await expect(main).toBeAttached();
    await expect.poll(() => ticket.seen()).toBeGreaterThan(0);
    expect(await main.evaluate((node) => getComputedStyle(node).visibility)).toBe("hidden");

    ticket.release();
    await expect.poll(() => main.evaluate((node) => getComputedStyle(node).visibility)).toBe("visible");
    const sortCluster = page.locator('[role="radiogroup"]').first();
    await expect(sortCluster).toBeAttached();
    await expect.poll(() => sortCluster.evaluate((node) => getComputedStyle(node).visibility)).toBe("visible");
    const art = await main.evaluate((node) =>
      [...node.querySelectorAll<HTMLImageElement>('img[src*="_cover"], img[src*="label_ticket_base"]')].map(
        (img) => img.complete && img.naturalWidth > 0,
      ),
    );
    expect(art.length).toBeGreaterThanOrEqual(4);
    expect(art.every(Boolean)).toBe(true);
  });

  test("settings: tab art is requested before the profile fetch resolves", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    let releaseProfile!: () => void;
    const profileGate = new Promise<void>((resolve) => (releaseProfile = resolve));
    await page.route(/\/user\/profile$/, async (route) => {
      await profileGate;
      await route.fallback();
    });
    const coverRequested = page.waitForRequest((request) => request.url().includes("/sort_button/time_cover.svg"));
    await page.goto("/settings?tab=share-links", { waitUntil: "domcontentloaded" });
    await coverRequested;
    await expect(page.locator('[role="radiogroup"]')).toHaveCount(0);
    releaseProfile();
    await expect(page.locator('[role="radiogroup"]')).toBeAttached();
  });

  test("client navigation and back/forward keep the persistent background mounted", async ({ page }) => {
    await mockApi(page, { loggedIn: true });
    await page.goto("/settings", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.documentElement.dataset.visualReady === "ready");
    await page.evaluate(() => {
      for (const img of document.querySelectorAll<HTMLImageElement>('img[src*="/background/"]')) {
        (img as HTMLImageElement & { __mark?: boolean }).__mark = true;
      }
    });
    const backgroundRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/background/")) backgroundRequests.push(request.url());
    });

    for (const step of ["home", "back", "forward", "back"] as const) {
      if (step === "home") {
        await page.evaluate(() => {
          (window as unknown as { next: { router: { push: (href: string) => void } } }).next.router.push("/");
        });
        await page.waitForURL((url) => url.pathname === "/");
      } else if (step === "back") {
        await page.goBack();
      } else {
        await page.goForward();
      }
      await expect(loader(page)).toBeHidden();
      const stillMounted = await page.$$eval('img[src*="/background/"]', (imgs) =>
        imgs.every((img) => (img as HTMLImageElement & { __mark?: boolean }).__mark === true),
      );
      expect(stillMounted).toBe(true);
    }
    expect(backgroundRequests).toEqual([]);
  });
});

test.describe("responsive background composition", () => {
  for (const width of [320, 375, 650, 770, 1024, 1099, 1100, 1101, 1440]) {
    test(`width ${width}: complete art at reveal, width-locked mask, no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await installRevealProbe(page);
      await mockApi(page, { loggedIn: false });
      await page.goto("/", { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
      await expectArtCompleteAtReveal(page);

      const geometry = await page.$$eval('img[src*="/background/"]', (imgs) => {
        const mountain = imgs[1]!;
        const box = mountain.getBoundingClientRect();
        return {
          width: box.width,
          height: box.height,
          maskSize: getComputedStyle(mountain).maskSize,
          maskPosition: getComputedStyle(mountain).maskPosition,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        };
      });
      // `100% auto` on the full-width art box = the former JS layout (width-locked, 1672:941 mask).
      expect(geometry.maskSize).toMatch(/^100%( auto)?$/);
      expect(geometry.maskPosition).toBe("50% 100%");
      expect(geometry.width).toBeGreaterThanOrEqual(1100);
      expect(geometry.height).toBeCloseTo((geometry.width * 518) / 1672, 0);
      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.innerWidth);
    });
  }
});
