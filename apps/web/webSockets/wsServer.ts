import { WebSocketServer } from "ws";
import http from "http";

// const server = http.createServer();
// const wss = new WebSocketServer({ server });

// wss.on("connection", (ws) => {
//   ws.send(JSON.stringify({ type: "hello", ts: Date.now() }));

//   ws.on("message", (data) => {
//     // echo
//     ws.send(JSON.stringify({ type: "echo", data: data.toString() }));
//   });
// });

// const port = Number(process.env.WS_PORT ?? 4000);
// server.listen(port, () => console.log(`WS server: ws://localhost:${port}`));