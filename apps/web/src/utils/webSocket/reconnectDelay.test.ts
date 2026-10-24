import { reconnectDelayMs } from "./reconnectDelay";

describe("reconnectDelayMs", () => {
  it("grows the jitter window exponentially and caps it at 30 s", () => {
    expect(reconnectDelayMs(0, 1006, () => 1)).toBe(500);
    expect(reconnectDelayMs(3, 1006, () => 1)).toBe(4_000);
    expect(reconnectDelayMs(20, 1006, () => 1)).toBe(30_000);
  });

  it("uses full jitter with a small floor", () => {
    expect(reconnectDelayMs(4, 1006, () => 0.5)).toBe(4_000);
    expect(reconnectDelayMs(4, 1006, () => 0)).toBe(250);
  });

  it("spreads reconnects over 1-5 s after a server restart (1012), regardless of attempt", () => {
    expect(reconnectDelayMs(0, 1012, () => 0)).toBe(1_000);
    expect(reconnectDelayMs(9, 1012, () => 1)).toBe(5_000);
  });
});
