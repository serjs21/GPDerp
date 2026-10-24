export type ConnectionLimits = { perIp: number; perUser: number; perTab: number };

export type ConnectionKey = { ip: string; userId: string | null; tabId: string };

export type ConnectionLimitReason = "ipLimit" | "userLimit" | "tabLimit";

export type ConnectionAcquireResult =
  | { ok: true; release: () => void }
  | { ok: false; reason: ConnectionLimitReason };

const increment = (counts: Map<string, number>, key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);

const decrement = (counts: Map<string, number>, key: string) => {
  const next = (counts.get(key) ?? 0) - 1;
  if (next > 0) counts.set(key, next);
  else counts.delete(key);
};

/** In-process counters of open sockets per client IP, authenticated user and tab. */
export function createConnectionLimiter(limits: ConnectionLimits) {
  const byIp = new Map<string, number>();
  const byUser = new Map<string, number>();
  const byTab = new Map<string, number>();

  const tryAcquire = ({ ip, userId, tabId }: ConnectionKey): ConnectionAcquireResult => {
    if ((byIp.get(ip) ?? 0) >= limits.perIp) return { ok: false, reason: "ipLimit" };
    if (userId && (byUser.get(userId) ?? 0) >= limits.perUser) return { ok: false, reason: "userLimit" };
    if ((byTab.get(tabId) ?? 0) >= limits.perTab) return { ok: false, reason: "tabLimit" };

    increment(byIp, ip);
    if (userId) increment(byUser, userId);
    increment(byTab, tabId);

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      decrement(byIp, ip);
      if (userId) decrement(byUser, userId);
      decrement(byTab, tabId);
    };
    return { ok: true, release };
  };

  const counts = () => ({ ips: byIp.size, users: byUser.size, tabs: byTab.size });

  return { tryAcquire, counts };
}
