import Fastify from "fastify";
import websocket from "@fastify/websocket";
import { WebSocket } from "ws"

// const sockets = new Set<WebSocket>();

// export const saveSocketConnection = (socket: WebSocket) => {
//     sockets.add(socket);
// }

// export const removeSocketConnection = (socket: WebSocket) => {
//     sockets.delete(socket);
// }


// const app = Fastify({ logger: true });

// await app.register(websocket);

// export const sendSocketMessage = (payload: any) => {
//     const socket = Array.from(sockets).find(s => s.readyState === s.OPEN);

//     if (!socket) {
//         console.error('No open socket found');
//         return;
//     }

//     if (socket.readyState !== socket.OPEN) return;
//     socket.send(JSON.stringify(payload));
// };

// export const closeSocketConnection = (socket: WebSocket, code = 1000, reason = "bye") => {
//   if (socket.readyState === socket.OPEN || socket.readyState === socket.CLOSING) {
//     socket.close(code, reason);
//   }
// }
