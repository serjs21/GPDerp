import type { UsageMetricsDataPoint } from "@/types/cloudflare-env";

/** Weekly totals sent by the API job; aggregate numbers only, never per-user data. */
export type WeeklyUsagePayload = {
  weekStart: string;
  newUsers: number;
  generations: number;
  generatingUsers: number;
  avgGenerationsPerUser: number;
  release: string;
};

const WEEK_START = /^\d{4}-\d{2}-\d{2}$/;
const RELEASE = /^[A-Za-z0-9._-]{1,64}$/;
const COUNT_FIELDS = ["newUsers", "generations", "generatingUsers"] as const;

const ALLOWED_FIELDS = new Set<string>(["weekStart", "release", "avgGenerationsPerUser", ...COUNT_FIELDS]);

const isCount = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0;
const isNonNegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const matches = (value: unknown, pattern: RegExp) => typeof value === "string" && pattern.test(value);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** Strict shape check: unknown fields are rejected so nothing but totals can be stored. */
export function parseWeeklyUsagePayload(body: unknown): WeeklyUsagePayload | null {
  if (!isPlainObject(body)) return null;
  if (Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))) return null;
  const valid =
    matches(body.weekStart, WEEK_START) &&
    matches(body.release, RELEASE) &&
    COUNT_FIELDS.every((field) => isCount(body[field])) &&
    isNonNegative(body.avgGenerationsPerUser);
  return valid ? (body as WeeklyUsagePayload) : null;
}

/** Constant-time comparison of the bearer token with the configured secret. */
export function isAuthorizedIngest(authorization: string | null, secret: string | undefined): boolean {
  if (!secret || !authorization?.startsWith("Bearer ")) return false;
  const encoder = new TextEncoder();
  const given = encoder.encode(authorization.slice("Bearer ".length));
  const expected = encoder.encode(secret);
  let diff = given.length ^ expected.length;
  for (let i = 0; i < expected.length; i += 1) diff |= expected[i] ^ (given[i] ?? 0);
  return diff === 0;
}

/** Analytics Engine row: blob1 = week start, blob2 = release; double1..4 = the totals. */
export function toUsageDataPoint(payload: WeeklyUsagePayload): UsageMetricsDataPoint {
  return {
    indexes: ["weekly"],
    blobs: [payload.weekStart, payload.release],
    doubles: [payload.newUsers, payload.generations, payload.generatingUsers, payload.avgGenerationsPerUser],
  };
}
