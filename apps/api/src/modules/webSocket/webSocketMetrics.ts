export type WebSocketCloseClass = "normal" | "serverRestart" | "heartbeatTimeout" | "policy" | "abnormal";

export type WebSocketRejectReason = "origin" | "ipLimit" | "userLimit" | "tabLimit" | "tabMissing";

export type WebSocketMetricsSnapshot = {
  active: number;
  authenticated: number;
  peakActive: number;
  opened: number;
  closed: Record<WebSocketCloseClass, number>;
  rejected: Record<WebSocketRejectReason, number>;
  messagesIn: number;
  appPings: number;
  handshakeAuthChecks: number;
};

export type WebSocketCloseEvent = { code: number; authenticated: boolean; heartbeatTimeout: boolean };

/** 1000/1001 are clean closes; everything else unexpected (1006 = connection dropped without a close frame). */
export const classifyClose = (code: number, heartbeatTimeout: boolean): WebSocketCloseClass => {
  if (heartbeatTimeout) return "heartbeatTimeout";
  if (code === 1000 || code === 1001) return "normal";
  if (code === 1012) return "serverRestart";
  if (code === 1008) return "policy";
  return "abnormal";
};

/** Aggregate counters only: no user, session or tab identifiers. */
export function createWebSocketMetrics() {
  const state: WebSocketMetricsSnapshot = {
    active: 0,
    authenticated: 0,
    peakActive: 0,
    opened: 0,
    closed: { normal: 0, serverRestart: 0, heartbeatTimeout: 0, policy: 0, abnormal: 0 },
    rejected: { origin: 0, ipLimit: 0, userLimit: 0, tabLimit: 0, tabMissing: 0 },
    messagesIn: 0,
    appPings: 0,
    handshakeAuthChecks: 0,
  };

  return {
    recordOpen(authenticated: boolean) {
      state.opened += 1;
      state.active += 1;
      if (authenticated) state.authenticated += 1;
      state.peakActive = Math.max(state.peakActive, state.active);
    },
    recordClose({ code, authenticated, heartbeatTimeout }: WebSocketCloseEvent) {
      state.active = Math.max(0, state.active - 1);
      if (authenticated) state.authenticated = Math.max(0, state.authenticated - 1);
      state.closed[classifyClose(code, heartbeatTimeout)] += 1;
    },
    recordRejected(reason: WebSocketRejectReason) {
      state.rejected[reason] += 1;
    },
    recordMessage() {
      state.messagesIn += 1;
    },
    recordAppPing() {
      state.appPings += 1;
    },
    recordHandshakeAuthCheck() {
      state.handshakeAuthChecks += 1;
    },
    snapshot(): WebSocketMetricsSnapshot {
      return { ...state, closed: { ...state.closed }, rejected: { ...state.rejected } };
    },
  };
}

export type WebSocketMetrics = ReturnType<typeof createWebSocketMetrics>;
