/** Weekly usage totals job (pg-boss). Runs Mondays 00:15 UTC for the ISO week that just ended. */
export const USAGE_METRICS_QUEUE = "usage-metrics-weekly";
export const USAGE_METRICS_CRON = "15 0 * * 1";
export const USAGE_METRICS_RETRY_LIMIT = 3;
export const USAGE_METRICS_RETRY_DELAY_SECONDS = 300;
export const USAGE_METRICS_EXPIRE_SECONDS = 120;
export const USAGE_METRICS_REQUEST_TIMEOUT_MS = 10_000;
