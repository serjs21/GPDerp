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
import {
  isPurchaseMessagesDevRouteEnabled,
  purchaseMessagesDevPlugin,
} from "./modules/payments/purchaseMessagesDev.controller";
import { startPostcardQueue, stopPostcardQueue } from "./modules/postcard/postcardQueue";
import { isPostcardDevRouteEnabled, postcardDevPlugin } from "./modules/postcard/postcardDev.controller";
import { emailPreviewDevPlugin, isEmailPreviewDevRouteEnabled } from "./modules/email/emailPreviewDev.controller";
import { healthPlugin } from "./modules/health/health.controller";
import { prismaClient } from "./lib/prisma";
import { SHUTDOWN_TIMEOUT_MS } from "./consts/server";

const app = Fastify({
  logger: true,
  // Only reachable through the hosting load balancer: take the client IP from X-Forwarded-For.
  trustProxy: true,
});

app.addHook("onClose", async () => {
  await prismaClient.$disconnect();
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
      return cb(Object.assign(new Error("CORS origin not allowed"), { statusCode: 403 }), false);
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
  if (isPurchaseMessagesDevRouteEnabled()) {
    await app.register(purchaseMessagesDevPlugin);
  }
  if (isPostcardDevRouteEnabled()) {
    await app.register(postcardDevPlugin);
  }
  if (isEmailPreviewDevRouteEnabled()) {
    await app.register(emailPreviewDevPlugin);
  }

  /* ------------------------------ Routes ------------------------------ */

  await app.register(healthPlugin);
  // Backward-compatible alias of /healthz.
  app.get("/health", async () => ({ ok: true }));

  console.log(app.printRoutes());

  /* ------------------------------ Queue ------------------------------ */

  await startPostcardQueue();
  app.addHook("onClose", stopPostcardQueue);

  /* ------------------------------ Listen ------------------------------ */

  await app.listen({
    port,
    host: "0.0.0.0",
  });

  console.log(`Server ready on http://localhost:${port}`);
}

/**
 * Let in-flight requests and postcard jobs finish (graceful pg-boss stop via onClose) before exiting,
 * but never past SHUTDOWN_TIMEOUT_MS: the platform kills the container shortly after SIGTERM.
 */
const shutdown = (signal: NodeJS.Signals) => {
  console.log(`${signal} received, shutting down...`);
  setTimeout(() => {
    console.error(`Shutdown exceeded ${SHUTDOWN_TIMEOUT_MS}ms, forcing exit.`);
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();
  app
    .close()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Shutdown failed:", err);
      process.exit(1);
    });
};
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

/* --------------------------- Entrypoint --------------------------- */

run().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
