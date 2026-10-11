import { test, type Page } from "playwright/test";
import { buildRecord, captureEnvironment, PERF_CPU_THROTTLE, PERF_RUNS, writeRecord } from "./benchmarkRecord";
import { DATASET_TIERS, makeLabels, pageOf } from "./datasets";
import { applyCpuThrottle, installPerfObservers, readPerfProbe, resetPerfProbe, timeInteraction } from "./measure";

/**
 * Settings → Labels collection on a production build with deterministic label datasets.
 * - first-rows: navigation start → first label rows rendered (page clock).
 * - sort-alpacabet: click the "Alpacabet" sort coin → every label rendered in sorted order
 *   (the panel loads all remaining pages before sorting in memory).
 * Run: `pnpm bench:app` (optionally `--grep "1000 labels"`, PERF_RUNS, PERF_CPU_THROTTLE).
 */

const ACCOUNT_ID = "account-1";
const ROW_SELECTOR = '[class*="ManageLabel-module"][class*="__strip"]';

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

/** Signed-in API mock serving `labels` with offset/pageSize pagination. Returns a request counter. */
async function mockSignedInApi(page: Page, labels: ReturnType<typeof makeLabels>) {
  const appOrigin = new URL(test.info().project.use.baseURL!).origin;
  const counter = { labelPages: 0 };
  await page.route(
    (url) => url.origin !== appOrigin && /^(localhost|127\.0\.0\.1)$/.test(url.hostname),
    async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname === "/auth/me") {
        return route.fulfill({ json: { ok: true, data: { user: MEMBER, account: [] } } });
      }
      if (url.pathname === "/user/profile") {
        return route.fulfill({
          json: {
            ok: true,
            data: { ...MEMBER, providers: [], pendingEmailChange: null, configuration: { theme: "night-sky", language: "en" } },
          },
        });
      }
      if (url.pathname === "/haiku/manage_labels/account") {
        return route.fulfill({ json: { ok: true, data: { accountId: ACCOUNT_ID } } });
      }
      if (url.pathname === `/haiku/labels/${ACCOUNT_ID}`) {
        counter.labelPages++;
        const offset = Number(url.searchParams.get("offset") ?? 0);
        const pageSize = Number(url.searchParams.get("pageSize") ?? 12);
        const { items, ...meta } = pageOf(labels, offset, pageSize);
        return route.fulfill({ json: { ok: true, data: { labels: items, ...meta } } });
      }
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
  return counter;
}

const rowCount = (selector: string) => document.querySelectorAll(selector).length;

async function openLabelsTab(page: Page) {
  await page.goto("/settings?tab=labels", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(rowCount, ROW_SELECTOR, { polling: "raf", timeout: 60_000 });
  return page.evaluate(() => performance.now());
}

test.describe.configure({ mode: "serial" });

for (const size of DATASET_TIERS) {
  test.describe(`${size} labels`, () => {
    const labels = makeLabels(size, ACCOUNT_ID);

    test(`first-rows ${size} labels`, async ({ page, browser }) => {
      test.setTimeout(60_000 + PERF_RUNS * 30_000);
      const samples: number[] = [];
      for (let run = 0; run <= PERF_RUNS; run++) {
        await page.context().clearCookies();
        await page.unrouteAll({ behavior: "ignoreErrors" });
        await mockSignedInApi(page, labels);
        await applyCpuThrottle(page, PERF_CPU_THROTTLE);
        const firstRowsAt = await openLabelsTab(page);
        if (run > 0) samples.push(firstRowsAt);
      }
      const record = buildRecord({
        name: "labels-collection/first-rows",
        scenario: "Navigate to /settings?tab=labels until the first label rows render",
        datasetSize: size,
        samples,
        extra: {},
        environment: captureEnvironment(browser, page),
      });
      test.info().annotations.push({ type: "perf", description: `${writeRecord(record)} median=${record.median} p95=${record.p95}` });
    });

    test(`sort-alpacabet ${size} labels`, async ({ page, browser }) => {
      test.setTimeout(60_000 + PERF_RUNS * (60_000 + size * 30));
      await installPerfObservers(page);
      const samples: number[] = [];
      const extras: Array<Record<string, number>> = [];
      for (let run = 0; run <= PERF_RUNS; run++) {
        await page.context().clearCookies();
        await page.unrouteAll({ behavior: "ignoreErrors" });
        const counter = await mockSignedInApi(page, labels);
        await applyCpuThrottle(page, PERF_CPU_THROTTLE);
        await openLabelsTab(page);
        await resetPerfProbe(page);
        counter.labelPages = 0;
        const duration = await timeInteraction(
          page,
          () => page.getByRole("button", { name: "Select Alpacabet" }).first().click(),
          ([selector, expected]) => document.querySelectorAll(selector).length === expected,
          [ROW_SELECTOR, size] as const,
          60_000 + size * 30,
        );
        if (run === 0) continue;
        samples.push(duration);
        extras.push({ ...(await readPerfProbe(page)), labelPageRequests: counter.labelPages });
      }
      const last = extras.at(-1) ?? {};
      const record = buildRecord({
        name: "labels-collection/sort-alpacabet",
        scenario: "Click the Alpacabet sort coin on /settings?tab=labels until every label row renders sorted",
        datasetSize: size,
        samples,
        extra: {
          labelPageRequests: last.labelPageRequests ?? 0,
          maxEventDuration: Math.max(0, ...extras.map((e) => e.maxEventDuration ?? 0)),
          longTasksPerRun: Math.round(extras.reduce((sum, e) => sum + (e.longTasks ?? 0), 0) / Math.max(1, extras.length)),
          longTaskMsPerRun: Math.round(extras.reduce((sum, e) => sum + (e.longTaskMs ?? 0), 0) / Math.max(1, extras.length)),
        },
        environment: captureEnvironment(browser, page),
      });
      test.info().annotations.push({ type: "perf", description: `${writeRecord(record)} median=${record.median} p95=${record.p95}` });
    });
  });
}
