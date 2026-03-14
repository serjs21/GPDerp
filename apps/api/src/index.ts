import Fastify, { FastifyReply } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";
import type WebSocket from "ws";

import { env } from "./env";
import { TAB_HEADER_KEY } from "./consts/ids";
import { runHaikuAgentStreamMock } from "./mocks/textStream";
// import { runHaikuAgentStreamMock } from "./mocks/textStream";

const app = Fastify({
  logger: true,
});

/* ----------------------------- Bootstrap ----------------------------- */

async function run() {
  const port = Number(process.env.PORT ?? 4000);
  console.log(`Starting server on port ${port}...`);

  /* ---------- Plugins (MUST come before routes) ---------- */

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: env.CORS_METHODS,
    allowedHeaders: ["*"],
    credentials: env.CORS_CREDENTIALS,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  await app.register(websocket);

  /* ------------------------------ Routes ------------------------------ */

  app.get("/health", async () => ({ ok: true }));

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

  /* --------------------------- WebSocket --------------------------- */

  app.get("/ws", { websocket: true }, (connection, req) => {
    const ws: WebSocket = (connection as any).socket ?? (connection as any);

    const raw = req.headers["sec-websocket-protocol"];
    const tabId = raw?.split(".")[1];

    if (!tabId) {
      ws.close(1008, "tabId required");
      return;
    }

    addClient(tabId, ws);
    console.log(`WS connected: ${tabId} (clients: ${clients.size})`);
  });

  /* ------------------------------ API ------------------------------ */

  app.post<{ Body: { subject: string } }>(
    "/beer_me_haiku",
    async (req, res: FastifyReply) => {
      let stream: AsyncIterable<string | null> | null = null;

      try {
        const subject = req.body?.subject || "random morbit subject";
        console.log(`\n Creating haiku for: ${subject}\n`);

        stream = await runHaikuAgentStreamMock();
        //  stream = await runHaikuAgentStream(subject, {
        //   context: {
        //     uid: req.headers?.[TAB_HEADER_KEY]?.toString() || "anonymous",
        //     isProUser: true,
        //   },
        // });
      } catch (e: any) {
        res.code(500).send({
          ok: false,
          error: e?.message ?? "agent start failed",
        });
        return;
      }

      try {
        if (!stream) throw new Error("No stream available");

        const subject = req.body?.subject || "Random subject";
        const uid = req.headers?.[TAB_HEADER_KEY]?.toString();

        if (!uid) console.warn("⚠️  No uid found in headers");

        for await (const chunk of stream) {
          const s = typeof chunk === "string" ? chunk : chunk.toString("utf8");

          sendToUid(uid!, {
            data: { delta: s, subject },
            id: req.id,
          });

          process.stdout.write(s);
        }

        res.status(200).send({ ok: true });
      } catch (e: unknown) {
        res.code(500).send({
          ok: false,
          error: e?.message ?? "stream failed",
        });
      }
    },
  );

  app.get("/ws-check", async () => ({
    ok: true,
    pid: process.pid,
  }));

  console.log(app.printRoutes());

  /* ------------------------------ Listen ------------------------------ */

  await app.listen({
    port,
    host: "0.0.0.0",
  });

  console.log(`Server ready on http://localhost:${port}`);
}

/* --------------------------- Entrypoint --------------------------- */

run().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
