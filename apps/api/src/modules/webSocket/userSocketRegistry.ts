export const GENERATION_CREDITS_SOCKET_KIND = "generation_credits";

const WS_OPEN = 1;

export type UserBroadcastSocket = {
  readyState: number;
  send: (data: string) => void;
};

export function createUserSocketRegistry() {
  const byUser = new Map<string, Set<UserBroadcastSocket>>();
  const userBySocket = new WeakMap<UserBroadcastSocket, string>();

  const unsubscribe = (ws: UserBroadcastSocket) => {
    const userId = userBySocket.get(ws);
    if (!userId) return;
    userBySocket.delete(ws);
    const set = byUser.get(userId);
    if (!set) return;
    set.delete(ws);
    if (set.size === 0) byUser.delete(userId);
  };

  const subscribe = (userId: string, ws: UserBroadcastSocket) => {
    unsubscribe(ws);
    const set = byUser.get(userId) ?? new Set<UserBroadcastSocket>();
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

export function generationCreditsMessage(credits: number) {
  return { kind: GENERATION_CREDITS_SOCKET_KIND, data: { credits } };
}
