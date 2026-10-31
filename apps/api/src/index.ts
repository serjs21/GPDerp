import "./instrument";
import * as Sentry from "@sentry/node";
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
import { isMonitoringDevRouteEnabled, monitoringDevPlugin } from "./modules/monitoring/monitoringDev.controller";
import { prismaClient } from "./lib/prisma";
import { SHUTDOWN_TIMEOUT_MS } from "./consts/server";
import { redactDatabaseUrls, sanitizeDbError } from "./utils/databaseUrl";
import { readObservabilityConfig } from "./lib/observability/config";
import { createLogger } from "./lib/observability/logger";
import { registerObservability } from "./lib/observability/registerObservability";
import { REQUEST_ID_HEADER, resolveRequestId } from "./lib/observability/requestId";

const observability = readObservabilityConfig();
const SENTRY_FLUSH_TIMEOUT_MS = 2000;

const app = Fastify({
  // Credentials and session/tab identifiers never reach the logs (see LOG_REDACT_PATHS).
  loggerInstance: createLogger(observability),
  // One structured line per request comes from registerObservability instead of Fastify's two.
  disableRequestLogging: true,
  requestIdHeader: false,
  genReqId: (req) => resolveRequestId(req.headers[REQUEST_ID_HEADER]),
  // Trust only the configured proxy hops (Lightsail load balancer) so X-Forwarded-For cannot be spoofed.
  trustProxy: env.TRUST_PROXY_HOPS,
});

app.addHook("onClose", async () => {
  await prismaClient.$disconnect();
});

/* ----------------------------- Bootstrap ----------------------------- */

async function run() {
  const port = Number(process.env.PORT ?? 4000);
  console.log(`Starting server on port ${port}...`);

  /* ---------- Plugins (MUST come before routes) ---------- */

  await app.register(registerObservability, { release: observability.release });

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
    exposedHeaders: [REQUEST_ID_HEADER],
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
  if (isMonitoringDevRouteEnabled()) {
    await app.register(monitoringDevPlugin);
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
    .then(() => Sentry.close(SENTRY_FLUSH_TIMEOUT_MS))
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
  const stack = err instanceof Error && err.stack ? redactDatabaseUrls(err.stack) : undefined;
  console.error("❌ Failed to start server:", sanitizeDbError(err), stack ?? "");
  process.exit(1);
});
