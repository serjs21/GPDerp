import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import multipart from '@fastify/multipart'
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { runHaikuAgentStreamMock } from "./mocks/textStream";
import { runHaikuAgentStream } from "./agent";
import { env } from "./env";
import type WebSocket from "ws";

import * as sockets from "./sockets";

const app = Fastify();

await app.register(cors, {
  origin: env.CORS_ORIGIN,
  methods: env.CORS_METHODS,
  allowedHeaders: env.CORS_HEADERS,
  credentials: env.CORS_CREDENTIALS,
});


console.log("CORS config:", {
  origin: env.CORS_ORIGIN,
  methods: env.CORS_METHODS,
  allowedHeaders: true,
  credentials: env.CORS_CREDENTIALS,
});

await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // optional
  },
})

await app.register(websocket);

app.get("/health", async () => ({ ok: true }));





// app.get("/ws", { websocket: true }, (socket, req) => {

//     console.log("🔥 WS connected");
//   socket.on("message", (raw) => {
//     const text = raw.toString();
//     console.log("📩 MESSAGE", text);
//   });

//   socket.on("close", (code, reason) => {
//     console.log("👋 CLOSE", code, reason.toString());
//     app.log.info("WS disconnected");
//   });
// });



const clients = new Map<string, Set<WebSocket>>();

const addClient = (uid: string, ws: WebSocket) => {
  const set = clients.get(uid) ?? new Set<WebSocket>();
  set.add(ws);
  clients.set(uid, set);

  ws.on("close", () => {
    set.delete(ws);
    if (set.size === 0) clients.delete(uid);
  });
}

const sendToUid = (uid: string, msg: unknown) => {
  const set = clients.get(uid);
  if (!set) return;

  const text = JSON.stringify(msg);
  for (const ws of set) {
    if (ws.readyState === ws.OPEN) ws.send(text);
  }
}

app.get("/ws", { websocket: true }, (connection, req) => {
  const ws: WebSocket = (connection as any).socket ?? (connection as any);

  const uid = req.id

  if (!uid) {
    ws.close(1008, "uid required");
    return;
  }

  addClient(uid, ws);
  console.log(`🔥 WS connected: ${uid} (total clients: ${clients.size})`);
});


app.post<{ Body: { subject: string } }>("/beer_me_haiku", async (req, res: FastifyReply) => {
  // res.status(200)
  // res.header("Content-Type", "text/event-stream; charset=utf-8")
  // res.header("Cache-Control", "no-cache, no-transform")
  // res.header("Connection", "keep-alive")
  // ;(res as any).flushHeaders?.()

  let stream: AsyncIterable<any> | null = null

  try {
    stream = await runHaikuAgentStreamMock() // req.body.subject)
  } catch (e: Error | any) {
    res.code(500).send({ ok: false, error: e?.message ?? "agent start failed" });
    return
  }


  try {
      let text = "";
    for await (const event of stream) {

        sendToUid(req.headers?.['x-tab-id'], {data: event, id: req.id}); 
        
      if (event.type === "response.output_text.delta") {
        text += event.delta;
        process.stdout.write(event.delta); // live output
      }
    }
    res.status(200).send({ ok: true });
  } catch (e: any) {
    res.code(500).send({ ok: false, error: e?.message ?? "stream failed" });
  }
})


app.get("/ws-check", async () => ({ ok: true, pid: process.pid }));


console.log(app.printRoutes());



await app.listen({ port: 4000, host: "0.0.0.0" });