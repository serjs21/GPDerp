import { WS_APP_PING_INTERVAL_MS, WS_PONG_TIMEOUT_MS } from "@/consts/webSocket/webSocketConsts";

const PING_MESSAGE = JSON.stringify({ type: "ping" });

type Timer = ReturnType<typeof setTimeout>;

/**
 * App-level heartbeat for one open socket: pings periodically and reports the connection dead when
 * no frame arrives within the pong timeout (browsers hide protocol-level pings from JavaScript).
 */
export function createLivenessWatchdog(onDead: (socket: WebSocket) => void) {
  let socket: WebSocket | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let pongTimer: Timer | null = null;

  const clearPong = () => {
    if (pongTimer) clearTimeout(pongTimer);
    pongTimer = null;
  };

  const ping = () => {
    const current = socket;
    if (!current || pongTimer) return;
    current.send(PING_MESSAGE);
    pongTimer = setTimeout(() => {
      pongTimer = null;
      if (current === socket) onDead(current);
    }, WS_PONG_TIMEOUT_MS);
  };

  return {
    start(next: WebSocket) {
      socket = next;
      pingTimer = setInterval(ping, WS_APP_PING_INTERVAL_MS);
    },
    stop() {
      socket = null;
      if (pingTimer) clearInterval(pingTimer);
      pingTimer = null;
      clearPong();
    },
    /** Probe now (e.g. the tab became visible again after sleep). */
    ping,
    /** Any received frame proves the connection is alive. */
    heard: clearPong,
  };
}
