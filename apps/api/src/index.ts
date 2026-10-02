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

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allow non-browser requests (no `Origin` header).
      if (!origin) return cb(null, true);
      if (env.CORS_ORIGIN.includes(origin)) return cb(null, true);
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
