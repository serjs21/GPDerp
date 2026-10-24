import { isAllowedWebSocketOrigin } from "../webSocketOrigin";

const allowedOrigins = ["https://gpderp.party", "http://localhost:3000"];

describe("isAllowedWebSocketOrigin", () => {
  it("accepts an allowed origin with or without cookies", () => {
    expect(isAllowedWebSocketOrigin({ origin: "https://gpderp.party", hasAuthCookie: true, allowedOrigins })).toBe(true);
    expect(isAllowedWebSocketOrigin({ origin: "http://localhost:3000", hasAuthCookie: false, allowedOrigins })).toBe(true);
  });

  it("rejects a foreign origin even without cookies", () => {
    expect(isAllowedWebSocketOrigin({ origin: "https://evil.example", hasAuthCookie: false, allowedOrigins })).toBe(false);
    expect(isAllowedWebSocketOrigin({ origin: "https://evil.example", hasAuthCookie: true, allowedOrigins })).toBe(false);
  });

  it("requires an origin when the handshake carries auth cookies", () => {
    expect(isAllowedWebSocketOrigin({ origin: undefined, hasAuthCookie: true, allowedOrigins })).toBe(false);
  });

  it("lets cookie-less non-browser clients omit the origin", () => {
    expect(isAllowedWebSocketOrigin({ origin: undefined, hasAuthCookie: false, allowedOrigins })).toBe(true);
  });
});
