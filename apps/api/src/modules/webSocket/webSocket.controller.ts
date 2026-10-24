import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import type WebSocket from "ws";
import {
  WS_CLOSE_POLICY_VIOLATION,
  WS_CLOSE_SERVICE_RESTART,
  WS_HEARTBEAT_INTERVAL_MS,
  WS_MAX_CONNECTIONS_PER_IP,
  WS_MAX_CONNECTIONS_PER_TAB,
  WS_MAX_CONNECTIONS_PER_USER,
  WS_MAX_PAYLOAD_BYTES,
  WS_METRICS_LOG_INTERVAL_MS,
} from "../../consts/webSocket";
import { env } from "../../env";
import { AUTH_COOKIE_NAMES } from "../auth/constants";
import { diagnoseAccessTokenFromRequest, readCookieValue } from "../auth/verifyAccessToken";
import { parseClientMessage, pongMessage } from "./clientMessages";
import { createConnectionLimiter } from "./connectionLimiter";
import { createShareLinkSubscriberRegistry } from "./shareLinkSubscriptions";
import { createUserSocketRegistry } from "./userSocketRegistry";
import { createWebSocketMetrics } from "./webSocketMetrics";
import { isAllowedWebSocketOrigin } from "./webSocketOrigin";

/** Identity resolved once at the handshake; messages and heartbeats never re-check auth. */
type HandshakeContext = { tabId: string; userId: string | null; release: () => void };

/** Lingering sockets that ignore the 1012 close frame are terminated after this during shutdown. */
const SHUTDOWN_TERMINATE_AFTER_MS = 5_000;

const readTabId = (req: FastifyRequest): string | undefined => {
  const raw = req.headers["sec-websocket-protocol"];
  const protocolHeader = Array.isArray(raw) ? raw[0] : raw;
  return protocolHeader?.split(",")[0]?.trim().split(".")[1] || undefined;
};

const hasAuthCookie = (req: FastifyRequest): boolean =>
  Object.values(AUTH_COOKIE_NAMES).some((name) => Boolean(readCookieValue(req.headers.cookie, name)));

const webSocketPluginImpl = async (app: FastifyInstance) => {
  const metrics = createWebSocketMetrics();
  const limiter = createConnectionLimiter({
    perIp: WS_MAX_CONNECTIONS_PER_IP,
    perUser: WS_MAX_CONNECTIONS_PER_USER,
    perTab: WS_MAX_CONNECTIONS_PER_TAB,
  });

  await app.register(websocket, {
    options: { maxPayload: WS_MAX_PAYLOAD_BYTES },
    // Tell every tab to reconnect (to the next container) instead of dropping sockets silently.
    preClose: (done) => {
      const wss = app.websocketServer;
      for (const client of wss.clients) client.close(WS_CLOSE_SERVICE_RESTART, "server_restart");
      setTimeout(() => {
        for (const client of wss.clients) client.terminate();
      }, SHUTDOWN_TERMINATE_AFTER_MS).unref();
      wss.close();
      done();
    },
  });

  // Heartbeat: a socket still awaiting the previous pong is dead (half-open); terminating it
  // fires `close`, which removes it from every registry below. Protocol pongs never reach message handlers.
  const awaitingPong = new WeakSet<WebSocket>();
  const heartbeatTimedOut = new WeakSet<WebSocket>();
  const heartbeat = setInterval(() => {
    for (const ws of app.websocketServer.clients) {
      if (awaitingPong.has(ws)) {
        heartbeatTimedOut.add(ws);
        ws.terminate();
        continue;
      }
      awaitingPong.add(ws);
      ws.ping();
    }
  }, WS_HEARTBEAT_INTERVAL_MS);
  heartbeat.unref();

  let lastLoggedMetrics = "";
  const metricsLog = setInterval(() => {
    const snapshot = metrics.snapshot();
    const serialized = JSON.stringify(snapshot);
    if (serialized === lastLoggedMetrics) return;
    lastLoggedMetrics = serialized;
    app.log.info({ ws: snapshot }, "WS metrics");
  }, WS_METRICS_LOG_INTERVAL_MS);
  metricsLog.unref();

  app.addHook("onClose", async () => {
    clearInterval(heartbeat);
    clearInterval(metricsLog);
  });
  app.websocketServer.on("connection", (ws: WebSocket) => {
    ws.on("pong", () => awaitingPong.delete(ws));
  });

  // Upgrade sockets rejected before the handshake (e.g. by CORS) have no `error` listener;
  // an unhandled client reset on them would crash the process.
  app.server.on("upgrade", (_req, socket) => {
    socket.on("error", (err) => {
      app.log.warn({ err }, "WS upgrade socket error");
    });
  });

  // Map: uid (tab id) -> connected websocket clients
  const clients = new Map<string, Set<WebSocket>>();
  const shareLinkSubscribers = createShareLinkSubscriberRegistry();
  const userSockets = createUserSocketRegistry();
  const handshakes = new WeakMap<FastifyRequest, HandshakeContext>();

  const addClient = (uid: string, ws: WebSocket) => {
    const set = clients.get(uid) ?? new Set<WebSocket>();
    set.add(ws);
    clients.set(uid, set);

    ws.on("close", () => {
      set.delete(ws);
      if (set.size === 0) clients.delete(uid);
      shareLinkSubscribers.unsubscribe(ws);
      userSockets.unsubscribe(ws);
    });
  };

  const sendToUid = (uid: string, msg: unknown) => {
    const set = clients.get(uid);
    if (!set) return;

    const text = JSON.stringify(msg);
    for (const client of set) {
      if (client.readyState === client.OPEN) {
        client.send(text);
      }
    }
  };

  const sendToUser = (userId: string, msg: unknown) => {
    shareLinkSubscribers.sendToUser(userId, msg);
  };

  const broadcastToUser = (userId: string, msg: unknown) => {
    userSockets.sendToUser(userId, msg);
  };

  // Decorate the Fastify instance so other modules (e.g. haiku, share links) can broadcast.
  app.decorate("addClient", addClient);
  app.decorate("sendToUid", sendToUid);
  app.decorate("sendToUser", sendToUser);
  app.decorate("broadcastToUser", broadcastToUser);

  /** Runs before the upgrade: a reply here is a plain HTTP response and no socket is created. */
  const guardHandshake = async (req: FastifyRequest, reply: FastifyReply) => {
    const tabId = readTabId(req);
    // A missing tab id keeps its historical in-band 1008 close (see the handler).
    if (!tabId) return;

    const withAuthCookie = hasAuthCookie(req);
    if (!isAllowedWebSocketOrigin({ origin: req.headers.origin, hasAuthCookie: withAuthCookie, allowedOrigins: env.CORS_ORIGIN })) {
      metrics.recordRejected("origin");
      return reply.code(403).send({ ok: false, error: "Origin not allowed" });
    }

    let userId: string | null = null;
    if (readCookieValue(req.headers.cookie, AUTH_COOKIE_NAMES.accessToken)) {
      metrics.recordHandshakeAuthCheck();
      const auth = await diagnoseAccessTokenFromRequest(req);
      if (auth.ok) userId = auth.userId;
    }

    const slot = limiter.tryAcquire({ ip: req.ip ?? "unknown", userId, tabId });
    if (!slot.ok) {
      metrics.recordRejected(slot.reason);
      return reply.code(429).send({ ok: false, error: "Too many connections" });
    }
    handshakes.set(req, { tabId, userId, release: slot.release });
  };

  app.get("/ws", { websocket: true, preValidation: guardHandshake }, (connection: unknown, req: FastifyRequest) => {
    const ws: WebSocket = (connection as { socket?: WebSocket }).socket ?? (connection as WebSocket);

    const handshake = handshakes.get(req);
    handshakes.delete(req);
    if (!handshake) {
      metrics.recordRejected("tabMissing");
      ws.close(WS_CLOSE_POLICY_VIOLATION, "tabId required");
      return;
    }

    const { tabId, userId, release } = handshake;
    const authenticated = userId !== null;
    addClient(tabId, ws);
    if (userId) userSockets.subscribe(userId, ws);
    metrics.recordOpen(authenticated);
    app.log.info({ active: metrics.snapshot().active, authenticated }, "WS connected");

    ws.on("close", (code: number) => {
      release();
      metrics.recordClose({ code, authenticated, heartbeatTimeout: heartbeatTimedOut.has(ws) });
    });

    ws.on("message", (payload) => {
      metrics.recordMessage();
      const parsed = parseClientMessage(payload);
      if (!parsed) return;

      if (parsed.type === "ping") {
        metrics.recordAppPing();
        if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(pongMessage(authenticated)));
        return;
      }
      if (parsed.type === "unsubscribe") {
        shareLinkSubscribers.unsubscribe(ws);
        return;
      }
      if (userId) shareLinkSubscribers.subscribe(userId, ws);
    });
  });

  app.get("/ws-check", async (req: FastifyRequest) => ({
    ok: true,
    pid: process.pid,
    clientIp: req.ip,
    ws: metrics.snapshot(),
  }));
};

export const webSocketPlugin = fp(webSocketPluginImpl);
