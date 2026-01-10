import Fastify from "fastify";
import { WebSocketServer } from "ws";

const app = Fastify();

const wss = new WebSocketServer({ noServer: true });

app.server.on("upgrade", (req, socket, head) => {
  if (req.url === "/ws") {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  }
});

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "hello", msg: "WS connected" }));

  ws.on("message", (data) => {
    console.log("msg:", data.toString());
  });
});

app.get("/health", async () => ({ ok: true }));

app.listen({ port: 4000 }, () => {
  console.log("API listening on http://localhost:4000");
});