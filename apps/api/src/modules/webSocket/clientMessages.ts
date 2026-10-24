import { parseShareLinkChannelMessage, type ShareLinkChannelMessage } from "./shareLinkSubscriptions";

export type ClientPingMessage = { type: "ping" };

export type ClientMessage = ShareLinkChannelMessage | ClientPingMessage;

const decode = (raw: unknown): unknown => {
  try {
    if (typeof raw === "string") return JSON.parse(raw);
    if (Buffer.isBuffer(raw)) return JSON.parse(raw.toString("utf8"));
    if (Array.isArray(raw)) return JSON.parse(Buffer.concat(raw).toString("utf8"));
  } catch {
    return null;
  }
  return raw;
};

/** Messages a tab may send: the share-links channel (un)subscribe, or an app-level liveness ping. */
export function parseClientMessage(raw: unknown): ClientMessage | null {
  const decoded = decode(raw);
  if (decoded && typeof decoded === "object" && (decoded as Record<string, unknown>).type === "ping") {
    return { type: "ping" };
  }
  return parseShareLinkChannelMessage(decoded);
}

export function pongMessage(authenticated: boolean, now = Date.now()) {
  return { kind: "pong", data: { authenticated, serverTime: now } };
}
