export const SHARE_LINKS_CHANNEL = "share-links";
const WS_OPEN = 1;

export type ShareLinkSocket = {
  readyState: number;
  send: (data: string) => void;
};

export type ShareLinkChannelMessage = {
  type: "subscribe" | "unsubscribe";
  channel: typeof SHARE_LINKS_CHANNEL;
};

export function parseShareLinkChannelMessage(raw: unknown): ShareLinkChannelMessage | null {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  } else if (Buffer.isBuffer(raw)) {
    try {
      parsed = JSON.parse(raw.toString("utf8"));
    } catch {
      return null;
    }
  } else if (Array.isArray(raw)) {
    try {
      parsed = JSON.parse(Buffer.concat(raw).toString("utf8"));
    } catch {
      return null;
    }
  }

  if (!parsed || typeof parsed !== "object") return null;
  const rec = parsed as Record<string, unknown>;
  if (rec.channel !== SHARE_LINKS_CHANNEL) return null;
  if (rec.type !== "subscribe" && rec.type !== "unsubscribe") return null;
  return { type: rec.type, channel: SHARE_LINKS_CHANNEL };
}

export function createShareLinkSubscriberRegistry() {
  const byUser = new Map<string, Set<ShareLinkSocket>>();
  const userBySocket = new WeakMap<ShareLinkSocket, string>();

  const unsubscribe = (ws: ShareLinkSocket) => {
    const userId = userBySocket.get(ws);
    if (!userId) return;
    userBySocket.delete(ws);
    const set = byUser.get(userId);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) byUser.delete(userId);
  };

  const subscribe = (userId: string, ws: ShareLinkSocket) => {
    unsubscribe(ws);
    const set = byUser.get(userId) ?? new Set<ShareLinkSocket>();
    set.add(ws);
    byUser.set(userId, set);
    userBySocket.set(ws, userId);
  };

  const sendToUser = (userId: string, msg: unknown) => {
    const set = byUser.get(userId);
    if (!set) return;
    const text = JSON.stringify(msg);
    for (const ws of set) {
      if (ws.readyState === WS_OPEN) {
        ws.send(text);
      }
    }
  };

  return { subscribe, unsubscribe, sendToUser };
}
