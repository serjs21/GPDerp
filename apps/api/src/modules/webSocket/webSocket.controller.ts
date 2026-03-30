import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type WebSocket from "ws";

const webSocketPluginImpl = async (app: FastifyInstance) => {
  await app.register(websocket);

  // Map: uid (tab id) -> connected websocket clients
  const clients = new Map<string, Set<WebSocket>>();

  const addClient = (uid: string, ws: WebSocket) => {
    const set = clients.get(uid) ?? new Set<WebSocket>();
    set.add(ws);
    clients.set(uid, set);

    ws.on("close", () => {
      set.delete(ws);
      if (set.size === 0) clients.delete(uid);
    });
  };

  const sendToUid = (uid: string, msg: unknown) => {
    const set = clients.get(uid);
    if (!set) return;

    const text = JSON.stringify(msg);
    for (const ws of set) {
      if (ws.readyState === ws.OPEN) {
        ws.send(text);
      }
    }
  };

  // Decorate the Fastify instance so other modules (e.g. haiku) can broadcast.
  app.decorate("addClient", addClient);
  app.decorate("sendToUid", sendToUid);

  app.get("/ws", { websocket: true }, (connection: unknown, req: FastifyRequest) => {
    const ws: WebSocket = (connection as any).socket ?? (connection as any);

    // Client sends tab identity encoded in `sec-websocket-protocol` header.
    const raw = (req.headers as any)["sec-websocket-protocol"] as string | string[] | undefined;
    const protocolHeader = Array.isArray(raw) ? raw[0] : raw;
    const tabId = protocolHeader?.split(".")[1];

    if (!tabId) {
      ws.close(1008, "tabId required");
      return;
    }

    addClient(tabId, ws);
    app.log.info({ tabId, clients: clients.size }, "WS connected");
  });

  app.get("/ws-check", async () => ({
    ok: true,
    pid: process.pid,
  }));
};

export const webSocketPlugin = fp(webSocketPluginImpl);

