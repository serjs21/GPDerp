import {
  WS_CLOSE_SERVICE_RESTART,
  WS_RECONNECT_BASE_DELAY_MS,
  WS_RECONNECT_MAX_DELAY_MS,
  WS_RECONNECT_MIN_DELAY_MS,
  WS_RESTART_MIN_DELAY_MS,
  WS_RESTART_SPREAD_MS,
} from "@/consts/webSocket/webSocketConsts";

/**
 * Delay before reconnect attempt `attempt` (0-based). Full jitter spreads tabs out so a deploy or
 * network blip does not turn into a synchronized reconnect storm.
 */
export const reconnectDelayMs = (attempt: number, closeCode: number | null, random: () => number = Math.random): number => {
  if (closeCode === WS_CLOSE_SERVICE_RESTART) {
    return Math.round(WS_RESTART_MIN_DELAY_MS + random() * WS_RESTART_SPREAD_MS);
  }
  const window = Math.min(WS_RECONNECT_MAX_DELAY_MS, WS_RECONNECT_BASE_DELAY_MS * 2 ** Math.max(0, attempt));
  return Math.max(WS_RECONNECT_MIN_DELAY_MS, Math.round(random() * window));
};
