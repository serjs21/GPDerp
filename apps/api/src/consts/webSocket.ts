/**
 * Server ping interval. Keeps idle sockets alive behind load balancers / proxies with idle timeouts
 * and evicts half-open sockets that missed the previous pong.
 */
export const WS_HEARTBEAT_INTERVAL_MS = 25_000;

/** Largest accepted client frame; clients only send small JSON channel messages. */
export const WS_MAX_PAYLOAD_BYTES = 64 * 1024;
