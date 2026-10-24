jest.mock("../../../env", () => ({ env: { CORS_ORIGIN: ["https://gpderp.party"] } }));
jest.mock("../../../consts/webSocket", () => ({
  ...jest.requireActual("../../../consts/webSocket"),
  WS_MAX_CONNECTIONS_PER_IP: 3,
  WS_MAX_CONNECTIONS_PER_USER: 2,
  WS_MAX_CONNECTIONS_PER_TAB: 1,
}));
jest.mock("../../auth/verifyAccessToken", () => ({
  diagnoseAccessTokenFromRequest: jest.fn(),
  readCookieValue: (header: string | undefined, name: string) =>
    header
      ?.split(";")
      .map((part) => part.trim().split("="))
      .find(([key]) => key === name)?.[1],
}));

import Fastify, { type FastifyInstance } from "fastify";
import type WebSocket from "ws";
import { webSocketPlugin } from "../webSocket.controller";

const { diagnoseAccessTokenFromRequest } = jest.requireMock("../../auth/verifyAccessToken") as {
  diagnoseAccessTokenFromRequest: jest.Mock;
};

const ORIGIN = "https://gpderp.party";
let tabCounter = 0;

type Handshake = { tab?: string; cookie?: string; origin?: string | null; ip?: string };

const connect = (app: FastifyInstance, { tab, cookie, origin = ORIGIN, ip = "10.0.0.1" }: Handshake = {}) => {
  const headers: Record<string, string> = { "sec-websocket-protocol": `tabId.${tab ?? `tab-${++tabCounter}`}` };
  if (cookie) headers.cookie = cookie;
  if (origin) headers.origin = origin;
  return app.injectWS("/ws", { headers, socket: { remoteAddress: ip } } as never);
};

const nextMessage = (ws: WebSocket) =>
  new Promise<Record<string, unknown>>((resolve) => ws.once("message", (data) => resolve(JSON.parse(String(data)))));

const closed = (ws: WebSocket) =>
  new Promise<{ code: number; reason: string }>((resolve) =>
    ws.once("close", (code, reason) => resolve({ code, reason: reason.toString() })),
  );

const wsCheck = async (app: FastifyInstance) => (await app.inject({ method: "GET", url: "/ws-check" })).json().ws;

describe("webSocket plugin", () => {
  let app: FastifyInstance;
  const sockets: WebSocket[] = [];
  const track = async (pending: Promise<WebSocket>) => {
    const ws = await pending;
    sockets.push(ws);
    return ws;
  };

  beforeEach(async () => {
    diagnoseAccessTokenFromRequest.mockReset();
    diagnoseAccessTokenFromRequest.mockResolvedValue({ ok: true, userId: "user-1", sessionId: "s1" });
    app = Fastify();
    await app.register(webSocketPlugin);
    await app.ready();
  });

  afterEach(async () => {
    for (const ws of sockets.splice(0)) ws.terminate();
    for (const serverSide of app.websocketServer?.clients ?? []) serverSide.terminate();
    await app.close();
  });

  it("answers app-level pings without any auth or database work", async () => {
    const ws = await track(connect(app));
    const reply = nextMessage(ws);
    ws.send(JSON.stringify({ type: "ping" }));
    expect(await reply).toMatchObject({ kind: "pong", data: { authenticated: false } });
    expect(diagnoseAccessTokenFromRequest).not.toHaveBeenCalled();
    expect(await wsCheck(app)).toMatchObject({ active: 1, appPings: 1, handshakeAuthChecks: 0 });
  });

  it("authenticates once at the handshake and reuses it for pings and subscriptions", async () => {
    const ws = await track(connect(app, { cookie: "access_token=jwt" }));
    ws.send(JSON.stringify({ type: "subscribe", channel: "share-links" }));
    const reply = nextMessage(ws);
    ws.send(JSON.stringify({ type: "ping" }));
    expect(await reply).toMatchObject({ kind: "pong", data: { authenticated: true } });

    const notification = nextMessage(ws);
    app.sendToUser("user-1", { kind: "share_link", data: { id: "link-1" } });
    expect(await notification).toEqual({ kind: "share_link", data: { id: "link-1" } });
    expect(diagnoseAccessTokenFromRequest).toHaveBeenCalledTimes(1);
  });

  it("delivers user broadcasts to every authenticated tab and nothing to anonymous sockets", async () => {
    const tabA = await track(connect(app, { cookie: "access_token=jwt" }));
    const tabB = await track(connect(app, { cookie: "access_token=jwt" }));
    const anonymous = await track(connect(app));
    const anonymousMessages: unknown[] = [];
    anonymous.on("message", (data) => anonymousMessages.push(String(data)));

    const received = Promise.all([nextMessage(tabA), nextMessage(tabB)]);
    app.broadcastToUser("user-1", { kind: "generation_credits", data: { credits: 4 } });
    expect(await received).toEqual([
      { kind: "generation_credits", data: { credits: 4 } },
      { kind: "generation_credits", data: { credits: 4 } },
    ]);
    expect(anonymousMessages).toEqual([]);
  });

  it("rejects cookie-bearing handshakes without an allowed Origin", async () => {
    await expect(connect(app, { cookie: "access_token=jwt", origin: null })).rejects.toThrow("403");
    await expect(connect(app, { cookie: "access_token=jwt", origin: "https://evil.example" })).rejects.toThrow("403");
    expect(diagnoseAccessTokenFromRequest).not.toHaveBeenCalled();
    expect((await wsCheck(app)).rejected.origin).toBe(2);
  });

  it("allows cookie-less clients without an Origin", async () => {
    await expect(track(connect(app, { origin: null }))).resolves.toBeDefined();
  });

  it("enforces per-tab, per-user and per-IP limits before the upgrade", async () => {
    await track(connect(app, { tab: "same-tab" }));
    await expect(connect(app, { tab: "same-tab" })).rejects.toThrow("429");

    await track(connect(app, { cookie: "access_token=jwt", ip: "10.0.0.2" }));
    await track(connect(app, { cookie: "access_token=jwt", ip: "10.0.0.3" }));
    await expect(connect(app, { cookie: "access_token=jwt", ip: "10.0.0.4" })).rejects.toThrow("429");

    await track(connect(app, { ip: "10.0.0.9" }));
    await track(connect(app, { ip: "10.0.0.9" }));
    await track(connect(app, { ip: "10.0.0.9" }));
    await expect(connect(app, { ip: "10.0.0.9" })).rejects.toThrow("429");

    expect((await wsCheck(app)).rejected).toMatchObject({ tabLimit: 1, userLimit: 1, ipLimit: 1 });
  });

  it("frees the slot when a socket closes (real TCP connection)", async () => {
    const address = await app.listen({ port: 0, host: "127.0.0.1" });
    const url = `${address.replace("http", "ws")}/ws`;
    const open = (socket: globalThis.WebSocket) =>
      new Promise<void>((resolve, reject) => {
        socket.addEventListener("open", () => resolve(), { once: true });
        socket.addEventListener("error", () => reject(new Error("upgrade failed")), { once: true });
      });

    const first = new globalThis.WebSocket(url, ["tabId.reused-tab"]);
    await open(first);
    first.close(1000, "bye");
    for (let i = 0; i < 100 && (await wsCheck(app)).active > 0; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const second = new globalThis.WebSocket(url, ["tabId.reused-tab"]);
    await open(second);
    expect((await wsCheck(app)).closed.normal).toBe(1);
    second.close(1000, "bye");
  });

  it("closes sockets without a tab id with 1008", async () => {
    const ws = await track(app.injectWS("/ws", { headers: {}, socket: { remoteAddress: "10.0.0.1" } } as never));
    expect(await closed(ws)).toEqual({ code: 1008, reason: "tabId required" });
  });

  it("closes every client with 1012 when the server shuts down", async () => {
    const ws = await track(connect(app));
    const serverSide = [...app.websocketServer.clients];
    const result = closed(ws);
    await app.close();
    expect((await result).code).toBe(1012);
    for (const socket of serverSide) socket.terminate();
    app = Fastify();
  });
});
