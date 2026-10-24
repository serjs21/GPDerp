/** Upper bound for graceful shutdown after SIGTERM/SIGINT before the process force-exits. */
export const SHUTDOWN_TIMEOUT_MS = 25_000;

/** `GET /readyz` fails (503) if the database does not answer `SELECT 1` within this time. */
export const READYZ_DB_TIMEOUT_MS = 3_000;
