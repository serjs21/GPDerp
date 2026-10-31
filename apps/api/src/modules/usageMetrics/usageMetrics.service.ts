import { prismaClient } from "../../lib/prisma";
import { USAGE_METRICS_REQUEST_TIMEOUT_MS } from "../../consts/usageMetrics";

const DAY_MS = 24 * 60 * 60 * 1000;

export type WeekRange = { start: Date; end: Date };

/** Aggregate totals only: no ids, emails, IPs or content ever leave the server. */
export type WeeklyUsagePayload = {
  weekStart: string;
  newUsers: number;
  generations: number;
  generatingUsers: number;
  avgGenerationsPerUser: number;
  release: string;
};

export type UsageMetricsTarget = { url: string; token: string };

/** The ISO week (Monday 00:00 UTC to the next Monday) before the one containing `now`. */
export function previousIsoWeek(now: Date): WeekRange {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceMonday = (now.getUTCDay() + 6) % 7;
  const currentWeekStart = today - daysSinceMonday * DAY_MS;
  return { start: new Date(currentWeekStart - 7 * DAY_MS), end: new Date(currentWeekStart) };
}

type UsageCounts = Omit<WeeklyUsagePayload, "weekStart" | "release" | "avgGenerationsPerUser">;

/**
 * Counts from existing tables. Generations are haikus created in the week, so haikus deleted
 * before this job runs are not counted (there is no separate generation ledger).
 */
export async function countWeeklyUsage(range: WeekRange, db = prismaClient): Promise<UsageCounts> {
  const createdAt = { gte: range.start, lt: range.end };
  const [newUsers, generations, generators] = await Promise.all([
    db.user.count({ where: { createdAt } }),
    db.haiku.count({ where: { createdAt } }),
    db.haiku.groupBy({ by: ["createdById"], where: { createdAt } }),
  ]);
  return { newUsers, generations, generatingUsers: generators.length };
}

export function buildWeeklyUsagePayload(range: WeekRange, counts: UsageCounts, release: string): WeeklyUsagePayload {
  const avg = counts.generatingUsers > 0 ? counts.generations / counts.generatingUsers : 0;
  return {
    weekStart: range.start.toISOString().slice(0, 10),
    ...counts,
    avgGenerationsPerUser: Math.round(avg * 100) / 100,
    release,
  };
}

/** Both settings are required; without them the job is a no-op (e.g. local development). */
export function readUsageMetricsTarget(env: NodeJS.ProcessEnv = process.env): UsageMetricsTarget | null {
  const url = env.USAGE_METRICS_INGEST_URL?.trim();
  const token = env.USAGE_METRICS_INGEST_TOKEN?.trim();
  return url && token ? { url, token } : null;
}

export async function sendWeeklyUsage(
  payload: WeeklyUsagePayload,
  target: UsageMetricsTarget,
  fetchFn: typeof fetch = fetch,
): Promise<void> {
  const response = await fetchFn(target.url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${target.token}` },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(USAGE_METRICS_REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`usage metrics ingest responded ${response.status}`);
}

/** Job body: throws on delivery failure so pg-boss retries. */
export async function runWeeklyUsageJob(now = new Date(), env: NodeJS.ProcessEnv = process.env): Promise<WeeklyUsagePayload | null> {
  const target = readUsageMetricsTarget(env);
  if (!target) return null;
  const range = previousIsoWeek(now);
  const payload = buildWeeklyUsagePayload(range, await countWeeklyUsage(range), env.APP_RELEASE ?? "unknown");
  await sendWeeklyUsage(payload, target);
  return payload;
}
