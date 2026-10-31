jest.mock("../../lib/prisma", () => ({ prismaClient: {} }));

import {
  buildWeeklyUsagePayload,
  countWeeklyUsage,
  previousIsoWeek,
  readUsageMetricsTarget,
  sendWeeklyUsage,
} from "./usageMetrics.service";

const week = { start: new Date("2026-10-19T00:00:00Z"), end: new Date("2026-10-26T00:00:00Z") };

describe("previousIsoWeek", () => {
  it.each([
    ["2026-10-26T00:15:00Z", "2026-10-19", "2026-10-26"], // Monday right after the week
    ["2026-10-31T23:00:00Z", "2026-10-19", "2026-10-26"], // Saturday
    ["2026-11-01T12:00:00Z", "2026-10-19", "2026-10-26"], // Sunday
    ["2027-01-04T00:15:00Z", "2026-12-28", "2027-01-04"], // across a year boundary
  ])("for %s is %s to %s (UTC)", (now, start, end) => {
    const range = previousIsoWeek(new Date(now));
    expect(range.start.toISOString().slice(0, 10)).toBe(start);
    expect(range.end.toISOString().slice(0, 10)).toBe(end);
  });
});

describe("countWeeklyUsage", () => {
  it("counts users and haikus created in the week and distinct generating users", async () => {
    const db = {
      user: { count: jest.fn().mockResolvedValue(4) },
      haiku: {
        count: jest.fn().mockResolvedValue(9),
        groupBy: jest.fn().mockResolvedValue([{ createdById: "a" }, { createdById: "b" }, { createdById: "c" }]),
      },
    };
    const counts = await countWeeklyUsage(week, db as any);
    expect(counts).toEqual({ newUsers: 4, generations: 9, generatingUsers: 3 });
    const where = { createdAt: { gte: week.start, lt: week.end } };
    expect(db.user.count).toHaveBeenCalledWith({ where });
    expect(db.haiku.groupBy).toHaveBeenCalledWith({ by: ["createdById"], where });
  });
});

describe("buildWeeklyUsagePayload", () => {
  it("carries only totals, rounding the average to 2 decimals", () => {
    expect(buildWeeklyUsagePayload(week, { newUsers: 4, generations: 10, generatingUsers: 3 }, "abc123")).toEqual({
      weekStart: "2026-10-19",
      newUsers: 4,
      generations: 10,
      generatingUsers: 3,
      avgGenerationsPerUser: 3.33,
      release: "abc123",
    });
  });

  it("reports an average of 0 when nobody generated", () => {
    const payload = buildWeeklyUsagePayload(week, { newUsers: 1, generations: 0, generatingUsers: 0 }, "x");
    expect(payload.avgGenerationsPerUser).toBe(0);
  });
});

describe("delivery", () => {
  it("is disabled unless both the URL and the token are set", () => {
    expect(readUsageMetricsTarget({})).toBeNull();
    expect(readUsageMetricsTarget({ USAGE_METRICS_INGEST_URL: "https://x" })).toBeNull();
    expect(readUsageMetricsTarget({ USAGE_METRICS_INGEST_URL: "https://x", USAGE_METRICS_INGEST_TOKEN: "t" })).toEqual({
      url: "https://x",
      token: "t",
    });
  });

  it("posts the payload with the bearer token and fails on a non-2xx answer", async () => {
    const payload = buildWeeklyUsagePayload(week, { newUsers: 1, generations: 2, generatingUsers: 1 }, "r");
    const fetchFn = jest.fn().mockResolvedValue({ ok: true, status: 204 });
    await sendWeeklyUsage(payload, { url: "https://gpderp.party/api/internal/usage-metrics", token: "t" }, fetchFn);

    const [url, init] = fetchFn.mock.calls[0];
    expect(url).toBe("https://gpderp.party/api/internal/usage-metrics");
    expect(init.method).toBe("POST");
    expect(init.headers.authorization).toBe("Bearer t");
    expect(JSON.parse(init.body)).toEqual(payload);

    fetchFn.mockResolvedValue({ ok: false, status: 401 });
    await expect(sendWeeklyUsage(payload, { url: "https://x", token: "t" }, fetchFn)).rejects.toThrow("401");
  });
});
