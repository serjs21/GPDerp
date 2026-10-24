export type WebSocketOriginCheck = {
  origin: string | undefined;
  /** Any auth cookie on the handshake: the browser would attach the user's session to the socket. */
  hasAuthCookie: boolean;
  allowedOrigins: readonly string[];
};

/**
 * Cross-site WebSocket hijacking guard. Browsers always send `Origin` on WebSocket handshakes, so a
 * cookie-bearing handshake without an allowed Origin is rejected; cookie-less non-browser clients may
 * omit it, but a present Origin must always be allowed.
 */
export const isAllowedWebSocketOrigin = ({ origin, hasAuthCookie, allowedOrigins }: WebSocketOriginCheck): boolean => {
  if (!origin) return !hasAuthCookie;
  return allowedOrigins.includes(origin);
};
