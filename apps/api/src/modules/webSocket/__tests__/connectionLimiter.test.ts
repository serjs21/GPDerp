import { createConnectionLimiter } from "../connectionLimiter";

describe("createConnectionLimiter", () => {
  it("rejects past the per-tab limit and frees the slot on release", () => {
    const limiter = createConnectionLimiter({ perIp: 10, perUser: 10, perTab: 2 });
    const key = { ip: "1.1.1.1", userId: "u1", tabId: "tab-a" };
    const first = limiter.tryAcquire(key);
    const second = limiter.tryAcquire(key);
    expect(first.ok && second.ok).toBe(true);
    expect(limiter.tryAcquire(key)).toEqual({ ok: false, reason: "tabLimit" });

    if (first.ok) first.release();
    expect(limiter.tryAcquire(key).ok).toBe(true);
  });

  it("enforces the per-user limit across tabs and the per-IP limit across users", () => {
    const limiter = createConnectionLimiter({ perIp: 3, perUser: 2, perTab: 5 });
    expect(limiter.tryAcquire({ ip: "a", userId: "u1", tabId: "t1" }).ok).toBe(true);
    expect(limiter.tryAcquire({ ip: "a", userId: "u1", tabId: "t2" }).ok).toBe(true);
    expect(limiter.tryAcquire({ ip: "b", userId: "u1", tabId: "t3" })).toEqual({ ok: false, reason: "userLimit" });
    expect(limiter.tryAcquire({ ip: "a", userId: null, tabId: "t4" }).ok).toBe(true);
    expect(limiter.tryAcquire({ ip: "a", userId: "u2", tabId: "t5" })).toEqual({ ok: false, reason: "ipLimit" });
  });

  it("does not count anonymous sockets against any user and ignores double release", () => {
    const limiter = createConnectionLimiter({ perIp: 5, perUser: 1, perTab: 5 });
    const anon = limiter.tryAcquire({ ip: "a", userId: null, tabId: "t1" });
    expect(limiter.tryAcquire({ ip: "a", userId: "u1", tabId: "t2" }).ok).toBe(true);
    if (anon.ok) {
      anon.release();
      anon.release();
    }
    expect(limiter.counts()).toEqual({ ips: 1, users: 1, tabs: 1 });
  });
});
