import { createSharedSocketManager } from "./sharedSocketManager";

class FakeSocket {
  static instances: FakeSocket[] = [];
  readyState = 0;
  sent: string[] = [];
  closedWith: { code?: number; reason?: string } | null = null;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(
    public url: string,
    public protocols: string[],
  ) {
    FakeSocket.instances.push(this);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close(code?: number, reason?: string) {
    this.closedWith = { code, reason };
    this.readyState = 3;
  }

  serverOpen() {
    this.readyState = 1;
    this.onopen?.(new Event("open"));
  }

  serverMessage(data: string) {
    this.onmessage?.({ data } as MessageEvent);
  }

  serverClose(code: number) {
    this.readyState = 3;
    this.onclose?.({ code } as CloseEvent);
  }
}

const latest = () => FakeSocket.instances[FakeSocket.instances.length - 1];

const setup = (online = true) => {
  const state = { online };
  const manager = createSharedSocketManager({
    url: "ws://api/ws",
    createSocket: (url, protocols) => new FakeSocket(url, protocols) as unknown as WebSocket,
    getTabId: () => "tab-1",
    random: () => 0.5,
    isOnline: () => state.online,
  });
  return { manager, state };
};

const useFakeSockets = () => {
  beforeEach(() => {
    jest.useFakeTimers();
    FakeSocket.instances = [];
  });
  afterEach(() => jest.useRealTimers());
};

describe("createSharedSocketManager: sharing and messaging", () => {
  useFakeSockets();

  it("waits for an identity, then opens a single socket for all consumers", () => {
    const { manager } = setup();
    const releaseA = manager.acquire();
    const releaseB = manager.acquire();
    expect(FakeSocket.instances).toHaveLength(0);

    manager.setIdentity("user-1");
    expect(FakeSocket.instances).toHaveLength(1);
    expect(latest().protocols).toEqual(["tabId.tab-1"]);

    releaseA();
    releaseB();
    jest.advanceTimersByTime(999);
    expect(latest().closedWith).toBeNull();
    jest.advanceTimersByTime(1);
    expect(latest().closedWith).toEqual({ code: 1000, reason: "idle" });
  });

  it("survives a release/re-acquire within the idle window (Strict Mode remount) without a new socket", () => {
    const { manager } = setup();
    manager.setIdentity("anon");
    const release = manager.acquire();
    release();
    manager.acquire();
    jest.advanceTimersByTime(5_000);
    expect(FakeSocket.instances).toHaveLength(1);
    expect(latest().closedWith).toBeNull();
  });

  it("dispatches messages, runs open handlers on every open and queues sends while closed", () => {
    const { manager } = setup();
    manager.setIdentity("user-1");
    manager.acquire();
    const received: string[] = [];
    manager.subscribe((event) => received.push(String(event.data)));
    const opens: number[] = [];
    manager.addOpenHandler(() => opens.push(1));

    expect(manager.send({ type: "subscribe", channel: "share-links" })).toBe(false);
    latest().serverOpen();
    expect(latest().sent).toEqual(['{"type":"subscribe","channel":"share-links"}']);
    expect(opens).toHaveLength(1);

    latest().serverMessage('{"kind":"share_link","data":{"id":"1"}}');
    latest().serverMessage('{"kind":"pong","data":{"authenticated":true}}');
    expect(received).toEqual(['{"kind":"share_link","data":{"id":"1"}}']);
  });

});

describe("createSharedSocketManager: liveness and reconnects", () => {
  useFakeSockets();

  it("reconnects with jittered backoff and reports the reconnect once open again", () => {
    const { manager } = setup();
    manager.setIdentity("user-1");
    manager.acquire();
    const reconnected = jest.fn();
    manager.onReconnected(reconnected);
    latest().serverOpen();
    expect(reconnected).not.toHaveBeenCalled();

    latest().serverClose(1006);
    jest.advanceTimersByTime(249);
    expect(FakeSocket.instances).toHaveLength(1);
    jest.advanceTimersByTime(1);
    expect(FakeSocket.instances).toHaveLength(2);

    latest().serverClose(1006);
    jest.advanceTimersByTime(499);
    expect(FakeSocket.instances).toHaveLength(2);
    jest.advanceTimersByTime(1);
    expect(FakeSocket.instances).toHaveLength(3);

    latest().serverOpen();
    expect(reconnected).toHaveBeenCalledTimes(1);
  });

  it("spreads reconnects after a server restart (1012) over 1-5 s", () => {
    const { manager } = setup();
    manager.setIdentity("anon");
    manager.acquire();
    latest().serverOpen();
    latest().serverClose(1012);
    jest.advanceTimersByTime(2_999);
    expect(FakeSocket.instances).toHaveLength(1);
    jest.advanceTimersByTime(1);
    expect(FakeSocket.instances).toHaveLength(2);
  });

  it("treats a missing pong as a dead connection", () => {
    const { manager } = setup();
    manager.setIdentity("anon");
    manager.acquire();
    const socket = latest();
    socket.serverOpen();

    jest.advanceTimersByTime(25_000);
    expect(socket.sent).toEqual(['{"type":"ping"}']);
    jest.advanceTimersByTime(10_000);
    expect(socket.closedWith).toEqual({ code: 4000, reason: "pong_timeout" });
    jest.advanceTimersByTime(250);
    expect(FakeSocket.instances).toHaveLength(2);
  });

  it("keeps the connection when pongs arrive", () => {
    const { manager } = setup();
    manager.setIdentity("anon");
    manager.acquire();
    const socket = latest();
    socket.serverOpen();
    for (let i = 0; i < 4; i += 1) {
      jest.advanceTimersByTime(25_000);
      socket.serverMessage('{"kind":"pong","data":{"authenticated":false}}');
    }
    jest.advanceTimersByTime(20_000);
    expect(socket.closedWith).toBeNull();
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it("re-establishes the socket on identity change without a reconnect event", () => {
    const { manager } = setup();
    manager.setIdentity("anon");
    manager.acquire();
    const reconnected = jest.fn();
    manager.onReconnected(reconnected);
    const anonymous = latest();
    anonymous.serverOpen();

    manager.setIdentity("user-1");
    expect(anonymous.closedWith).toEqual({ code: 1000, reason: "identity_change" });
    expect(FakeSocket.instances).toHaveLength(2);
    latest().serverOpen();
    expect(reconnected).not.toHaveBeenCalled();
  });

  it("does not spend backoff attempts while offline", () => {
    const { manager, state } = setup();
    manager.setIdentity("anon");
    manager.acquire();
    latest().serverOpen();
    state.online = false;
    latest().serverClose(1006);
    jest.advanceTimersByTime(60_000);
    expect(FakeSocket.instances).toHaveLength(1);
  });

  it("whenOpen resolves on open or after the timeout", async () => {
    const { manager } = setup();
    manager.setIdentity("anon");
    manager.acquire();
    const pending = manager.whenOpen(3_000);
    latest().serverOpen();
    await expect(pending).resolves.toBe(true);

    latest().serverClose(1006);
    const timedOut = manager.whenOpen(3_000);
    jest.advanceTimersByTime(3_000);
    await expect(timedOut).resolves.toBe(false);
  });
});
