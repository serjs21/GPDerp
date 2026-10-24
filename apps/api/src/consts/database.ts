/**
 * Connection budget for one 1 GB container: Prisma goes through the Neon pooler (PgBouncer),
 * pg-boss holds direct sessions that count against the compute's `max_connections`.
 */
export const PRISMA_POOL_MAX = 5;
export const PG_BOSS_POOL_MAX = 3;

/** Close idle sockets well before Neon scales the compute to zero (5 min) so none go stale. */
export const DB_IDLE_TIMEOUT_MS = 30_000;

/** Long enough for a suspended Neon compute to wake up (Neon recommends `connect_timeout=15`). */
export const DB_CONNECTION_TIMEOUT_MS = 15_000;

/** Shows up in `pg_stat_activity.application_name`. */
export const DB_APPLICATION_NAME = "gpderp-api";

/** Local databases (dev, Docker smoke test) that run without TLS. */
export const TLS_EXEMPT_HOSTS: readonly string[] = ["localhost", "127.0.0.1", "host.docker.internal"];
