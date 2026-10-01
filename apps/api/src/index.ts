import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";

import { env } from "./env";
import { authPlugin } from "./modules/auth/auth.controller";
import { webSocketPlugin } from "./modules/webSocket/webSocket.controller";
import { haikuPlugin } from "./modules/haiku/haiku.controller";
import { labelPlugin } from "./modules/label/label.controller";
import { shareLinkPlugin } from "./modules/shareLinks/shareLink.controller";
import { userPlugin } from "./modules/user/user.controller";
import { iconUploadPlugin } from "./modules/iconUpload/iconUpload.controller";
import { paymentsPlugin } from "./modules/payments/payments.controller";

const app = Fastify({
  logger: true,
});

/* ----------------------------- Bootstrap ----------------------------- */

async function run() {
  const port = Number(process.env.PORT ?? 4000);
  console.log(`Starting server on port ${port}...`);

  /* ---------- Plugins (MUST come before routes) ---------- */

  // #region agent log
  app.addHook("onRequest", async (req) => {
    if (!req.url.startsWith("/ws")) return;
    fetch('http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'725364'},body:JSON.stringify({sessionId:'725364',runId:'run1',hypothesisId:'A,B,C',location:'index.ts:onRequest',message:'ws request origin',data:{origin:req.headers.origin ?? null,referer:req.headers.referer ?? null,upgrade:req.headers.upgrade ?? null,userAgent:req.headers["user-agent"] ?? null,allowed:env.CORS_ORIGIN},timestamp:Date.now()})}).catch(()=>{});
  });
  app.addHook("onResponse", async (req, reply) => {
    if (!req.url.startsWith("/ws")) return;
    const sock = req.raw.socket;
    fetch('http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'725364'},body:JSON.stringify({sessionId:'725364',runId:'run1',hypothesisId:'D',location:'index.ts:onResponse',message:'ws response socket state',data:{statusCode:reply.statusCode,errorListeners:sock?.listenerCount('error') ?? null,destroyed:sock?.destroyed ?? null,writable:sock?.writable ?? null},timestamp:Date.now()})}).catch(()=>{});
  });
  process.on("exit", (code) => {
    require("node:fs").appendFileSync("/Users/omnitoaster/GPDerp/.cursor/debug-725364.log", JSON.stringify({sessionId:'725364',runId:'run1',hypothesisId:'D,E',location:'index.ts:exit',message:'process exit',data:{code},timestamp:Date.now()}) + "\n");
  });
  // #endregion

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow non-browser requests (no `Origin` header).
      if (!origin) return cb(null, true);
      if (env.CORS_ORIGIN.includes(origin)) return cb(null, true);
      // #region agent log
      fetch('http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'725364'},body:JSON.stringify({sessionId:'725364',runId:'run1',hypothesisId:'A,B,C',location:'index.ts:corsReject',message:'cors rejected origin',data:{origin,originJson:JSON.stringify(origin),allowed:env.CORS_ORIGIN},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      return cb(new Error("CORS origin not allowed"), false);
    },
    credentials: env.CORS_CREDENTIALS,
    methods: env.CORS_METHODS,
    allowedHeaders: env.CORS_HEADERS.length ? env.CORS_HEADERS : undefined,
  });

  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });

  await app.register(webSocketPlugin);
  await app.register(authPlugin);
  await app.register(paymentsPlugin);
  await app.register(haikuPlugin);
  await app.register(labelPlugin);
  await app.register(shareLinkPlugin);
  await app.register(userPlugin);
  await app.register(iconUploadPlugin);

  /* ------------------------------ Routes ------------------------------ */

  app.get("/health", async () => ({ ok: true }));

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
