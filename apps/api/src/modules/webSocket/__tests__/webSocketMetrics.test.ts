import { classifyClose, createWebSocketMetrics } from "../webSocketMetrics";

describe("classifyClose", () => {
  it.each([
    [1000, false, "normal"],
    [1001, false, "normal"],
    [1012, false, "serverRestart"],
    [1008, false, "policy"],
    [1006, false, "abnormal"],
    [1011, false, "abnormal"],
    [1006, true, "heartbeatTimeout"],
  ] as const)("code %i (heartbeat timeout %s) -> %s", (code, heartbeatTimeout, expected) => {
    expect(classifyClose(code, heartbeatTimeout)).toBe(expected);
  });
});

describe("createWebSocketMetrics", () => {
  it("tracks active, authenticated and peak connections plus close classes", () => {
    const metrics = createWebSocketMetrics();
    metrics.recordOpen(true);
    metrics.recordOpen(false);
    metrics.recordClose({ code: 1006, authenticated: true, heartbeatTimeout: false });
    metrics.recordRejected("origin");
    metrics.recordAppPing();
    metrics.recordMessage();
    metrics.recordHandshakeAuthCheck();

    const snapshot = metrics.snapshot();
    expect(snapshot).toMatchObject({
      active: 1,
      authenticated: 0,
      peakActive: 2,
      opened: 2,
      messagesIn: 1,
      appPings: 1,
      handshakeAuthChecks: 1,
    });
    expect(snapshot.closed.abnormal).toBe(1);
    expect(snapshot.rejected.origin).toBe(1);
  });

  it("returns snapshots that are not mutated by later events", () => {
    const metrics = createWebSocketMetrics();
    const before = metrics.snapshot();
    metrics.recordRejected("ipLimit");
    expect(before.rejected.ipLimit).toBe(0);
  });
});
