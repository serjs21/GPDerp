import type { PgBoss } from "pg-boss" with { "resolution-mode": "import" };
import {
  USAGE_METRICS_CRON,
  USAGE_METRICS_EXPIRE_SECONDS,
  USAGE_METRICS_QUEUE,
  USAGE_METRICS_RETRY_DELAY_SECONDS,
  USAGE_METRICS_RETRY_LIMIT,
} from "../../consts/usageMetrics";
import { runWeeklyUsageJob } from "./usageMetrics.service";

const LOG_PREFIX = "[usageMetrics]";

const QUEUE_OPTIONS = {
  retryLimit: USAGE_METRICS_RETRY_LIMIT,
  retryDelay: USAGE_METRICS_RETRY_DELAY_SECONDS,
  expireInSeconds: USAGE_METRICS_EXPIRE_SECONDS,
};

/** Registers the weekly totals job on the shared pg-boss instance. */
export async function startUsageMetricsSchedule(boss: PgBoss): Promise<void> {
  if (await boss.getQueue(USAGE_METRICS_QUEUE)) await boss.updateQueue(USAGE_METRICS_QUEUE, QUEUE_OPTIONS);
  else await boss.createQueue(USAGE_METRICS_QUEUE, QUEUE_OPTIONS);

  await boss.work(USAGE_METRICS_QUEUE, async () => {
    try {
      const sent = await runWeeklyUsageJob();
      if (sent) console.log(LOG_PREFIX, `sent totals for week ${sent.weekStart}`);
    } catch (err) {
      console.warn(LOG_PREFIX, "weekly totals not sent:", err instanceof Error ? err.message : err);
      throw err;
    }
  });
  await boss.schedule(USAGE_METRICS_QUEUE, USAGE_METRICS_CRON);
}
