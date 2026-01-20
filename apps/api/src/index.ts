import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import multipart from '@fastify/multipart'
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { env } from "./env";
import type WebSocket from "ws";
import { TAB_HEADER_KEY } from "./consts/ids";

import { runHaikuAgentStreamMock } from "./mocks/textStream";
import { runHaikuAgentStream } from "./agent";


const app = Fastify();

await app.register(cors, {
  origin: env.CORS_ORIGIN,
  methods: env.CORS_METHODS,
  allowedHeaders: ["*"],
  credentials: env.CORS_CREDENTIALS,
});

await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // optional
  },
})

await app.register(websocket);

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

  const raw = req.headers["sec-websocket-protocol"];
  const tabId = raw?.split('.')[1];

  if (!tabId) {
    ws.close(1008, "tabId required");
    return;
  }

  addClient(tabId, ws);
  console.log(`🔥 WS connected: ${tabId} (total clients: ${clients.size})`);
});


app.post<{ Body: { subject: string } }>("/beer_me_haiku", async (req, res: FastifyReply) => {
  let stream: AsyncIterable<any> | null = null

  try {
    const subject = req.body?.subject || 'random morbit subject';
    console.log(`\n\nCreating Haiku for subject - ${subject}:\n\n`);
    // stream = await runHaikuAgentStream(req.body.subject || 'random morbit subject', {context: {
    //   uid: req.headers?.[TAB_HEADER_KEY]?.toString() || 'anonymous',
    //   isProUser: true,
    // } });
    stream = await runHaikuAgentStreamMock();
    console.log('stream created', stream);
  } catch (e: Error | any) {
    res.code(500).send({ ok: false, error: e?.message ?? "agent start failed" });
    return
  }


  try {
      let text = "";
    // for await (const event of stream) {
      const uid = req.headers?.[TAB_HEADER_KEY]?.toString();
      if (!uid) console.error('No uid found in headers');

    //     sendToUid(uid!, {data: event, id: req.id}); 
        
    //   if (event.type === "response.output_text.delta") {
    //     text += event.delta;
    //     process.stdout.write(event.delta); // live output
    //   }
    // }
    if (!stream) throw new Error("No stream available");
    
        for await (const chunk of stream) {
      const s = typeof chunk === "string" ? chunk : chunk.toString("utf8");
      text += s;
      console.log('chunk', s)

      sendToUid(uid!, { data: {delta: s}, id: req.id }); // send text chunk to that tab
      process.stdout.write(s);
    }

    // sendToUid(uid, { data: "[DONE]", id: req.id });
    res.status(200).send({ ok: true });
  } catch (e: any) {
    res.code(500).send({ ok: false, error: e?.message ?? "stream failed" });
  }
})


app.get("/ws-check", async () => ({ ok: true, pid: process.pid }));


console.log(app.printRoutes());



await app.listen({ port: 4000, host: "0.0.0.0" });