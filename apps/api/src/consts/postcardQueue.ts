export const POSTCARD_QUEUE_SCHEMA = "pgboss";

export const POSTCARD_EMAIL_QUEUE = "postcard-email";
export const POSTCARD_EMAIL_DLQ = "postcard-email-dlq";
export const POSTCARD_BATCH_CLEANUP_QUEUE = "postcard-batch-cleanup";

/** Backoff of roughly 30s, 1m, 2m, 4m, 8m (with jitter), capped at 10 minutes. */
export const POSTCARD_EMAIL_RETRY_LIMIT = 5;
export const POSTCARD_EMAIL_RETRY_DELAY_SECONDS = 30;
export const POSTCARD_EMAIL_RETRY_DELAY_MAX_SECONDS = 600;
/** One attempt (render + SMTP) must finish within this, otherwise it is retried. */
export const POSTCARD_EMAIL_EXPIRE_SECONDS = 120;
export const POSTCARD_EMAIL_LOCAL_CONCURRENCY = 2;

export const POSTCARD_BATCH_RETENTION_DAYS = 7;
/** Daily at 03:00 UTC. */
export const POSTCARD_BATCH_CLEANUP_CRON = "0 3 * * *";
