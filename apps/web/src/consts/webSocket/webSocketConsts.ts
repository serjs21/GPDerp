export const WEB_SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws";

/** Storybook sets this so stories never open sockets to the real API. */
export const WEB_SOCKETS_DISABLED = process.env.NEXT_PUBLIC_WS_DISABLED === "true";

/** Reconnect backoff: full jitter over an exponential window, capped. */
export const WS_RECONNECT_BASE_DELAY_MS = 500;
export const WS_RECONNECT_MAX_DELAY_MS = 30_000;
export const WS_RECONNECT_MIN_DELAY_MS = 250;
/** The attempt counter only resets once a connection stayed up this long (no tight accept-then-drop loops). */
export const WS_STABLE_CONNECTION_MS = 30_000;

/** After a server restart (close 1012) tabs spread their reconnects over 1–5 s. */
export const WS_CLOSE_SERVICE_RESTART = 1012;
export const WS_RESTART_MIN_DELAY_MS = 1_000;
export const WS_RESTART_SPREAD_MS = 4_000;

/**
 * Browsers cannot see protocol pings, so the tab sends an app-level ping and treats a missing pong
 * as a dead connection (laptop sleep, network switch).
 */
export const WS_APP_PING_INTERVAL_MS = 25_000;
export const WS_PONG_TIMEOUT_MS = 10_000;
export const WS_CLOSE_PONG_TIMEOUT = 4000;

/** Keeps the shared socket briefly after the last consumer unmounts (route changes, Strict Mode remounts). */
export const WS_IDLE_RELEASE_DELAY_MS = 1_000;

export const WS_SEND_QUEUE_LIMIT = 20;

/** Longest a haiku request waits for the tab's socket to (re)open before posting anyway. */
export const HAIKU_STREAM_SOCKET_WAIT_MS = 3_000;
