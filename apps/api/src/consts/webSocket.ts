/**
 * Server ping interval. Keeps idle sockets alive behind load balancers / proxies with idle timeouts
 * and evicts half-open sockets that missed the previous pong.
 */
export const WS_HEARTBEAT_INTERVAL_MS = 25_000;

/** Largest accepted client frame; clients only send small JSON channel messages. */
export const WS_MAX_PAYLOAD_BYTES = 64 * 1024;

/** Upper bounds on simultaneous sockets, checked before the upgrade (HTTP 429 when exceeded). */
export const WS_MAX_CONNECTIONS_PER_IP = 60;
export const WS_MAX_CONNECTIONS_PER_USER = 20;
/** One tab holds one socket; the second slot covers a reconnect overlap or a duplicated browser tab. */
export const WS_MAX_CONNECTIONS_PER_TAB = 2;

/** Sent to every client on shutdown so tabs reconnect (with jitter) to the next container. */
export const WS_CLOSE_SERVICE_RESTART = 1012;
export const WS_CLOSE_POLICY_VIOLATION = 1008;

export const WS_METRICS_LOG_INTERVAL_MS = 60_000;
