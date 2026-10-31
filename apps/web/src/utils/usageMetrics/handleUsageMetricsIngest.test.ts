/**
 * @jest-environment node
 */
import { handleUsageMetricsIngest } from "./handleUsageMetricsIngest";
import { isAuthorizedIngest, parseWeeklyUsagePayload } from "./usageMetricsIngest";

const TOKEN = "s3cret-token-value";
const payload = {
  weekStart: "2026-10-19",
  newUsers: 4,
  generations: 10,
  generatingUsers: 3,
  avgGenerationsPerUser: 3.33,
  release: "abc123def456",
};

const post = (body: unknown, authorization = `Bearer ${TOKEN}`) =>
  new Request("https://gpderp.party/api/internal/usage-metrics", {
    method: "POST",
    headers: { authorization, "content-type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("handleUsageMetricsIngest", () => {
  const writeDataPoint = jest.fn();
  const bindings = { dataset: { writeDataPoint }, token: TOKEN };
  beforeEach(() => writeDataPoint.mockReset());

  it("writes one data point of totals for a valid, authorized request", async () => {
    const res = await handleUsageMetricsIngest(post(payload), bindings);
    expect(res.status).toBe(204);
    expect(writeDataPoint).toHaveBeenCalledTimes(1);
    expect(writeDataPoint).toHaveBeenCalledWith({
      indexes: ["weekly"],
      blobs: ["2026-10-19", "abc123def456"],
      doubles: [4, 10, 3, 3.33],
    });
  });

  it.each(["Bearer wrong", "", `Basic ${TOKEN}`, `Bearer ${TOKEN}x`])("rejects authorization %p with 401", async (auth) => {
    const res = await handleUsageMetricsIngest(post(payload, auth), bindings);
    expect(res.status).toBe(401);
    expect(writeDataPoint).not.toHaveBeenCalled();
  });

  it.each([
    ["malformed JSON", "{"],
    ["a negative count", { ...payload, generations: -1 }],
    ["a fractional count", { ...payload, newUsers: 1.5 }],
    ["a bad week", { ...payload, weekStart: "last week" }],
    ["an extra (personal) field", { ...payload, email: "a@example.com" }],
  ])("rejects %s with 400", async (_label, body) => {
    const res = await handleUsageMetricsIngest(post(body), bindings);
    expect(res.status).toBe(400);
    expect(writeDataPoint).not.toHaveBeenCalled();
  });

  it("is unavailable (503) when the binding or secret is missing", async () => {
    expect((await handleUsageMetricsIngest(post(payload), { dataset: undefined, token: TOKEN })).status).toBe(503);
    expect((await handleUsageMetricsIngest(post(payload), { dataset: bindings.dataset, token: undefined })).status).toBe(503);
  });
});

describe("usage metrics validation", () => {
  it("accepts exactly the totals payload", () => {
    expect(parseWeeklyUsagePayload(payload)).toEqual(payload);
    expect(parseWeeklyUsagePayload([payload])).toBeNull();
    expect(parseWeeklyUsagePayload(null)).toBeNull();
  });

  it("requires a configured secret", () => {
    expect(isAuthorizedIngest(`Bearer ${TOKEN}`, undefined)).toBe(false);
    expect(isAuthorizedIngest(`Bearer ${TOKEN}`, TOKEN)).toBe(true);
  });
});
