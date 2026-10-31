// Loaded first by index.ts: the Sentry SDK must initialize before Fastify is imported.
import "dotenv/config";
import * as Sentry from "@sentry/node";
import { readObservabilityConfig } from "./lib/observability/config";
import { scrubEvent } from "./lib/observability/scrubEvent";

const config = readObservabilityConfig();

if (config.errorsDsn) {
  try {
    Sentry.init({
      dsn: config.errorsDsn,
      environment: config.environment,
      release: config.release,
      sampleRate: config.errorsSampleRate,
      tracesSampleRate: config.tracesSampleRate,
      // SDK defaults collect bodies, headers, cookies, local variables, DB data and AI prompts;
      // none of that may leave the server (credentials, passwords, user-written subjects).
      dataCollection: {
        userInfo: false,
        cookies: false,
        httpHeaders: { request: { allow: ["content-type"] }, response: false },
        httpBodies: [],
        urlQueryParams: false,
        stackFrameVariables: false,
        databaseQueryData: false,
        queues: false,
        genAI: { inputs: false, outputs: false },
        mcp: { inputs: false, outputs: false },
        graphQL: { document: false, variables: false },
      },
      // Breadcrumbs can echo console output and request URLs (with one-time tokens); keep none.
      maxBreadcrumbs: 0,
      beforeSend: scrubEvent,
      integrations: [
        // Keep Node's default crash-on-unhandled-rejection behavior (Sentry's default only warns).
        Sentry.onUnhandledRejectionIntegration({ mode: "strict" }),
        // 5xx reporting is done once per request by registerObservability; avoid a second report.
        Sentry.fastifyIntegration({ shouldHandleError: () => false }),
      ],
    });
  } catch (err) {
    console.error("[observability] error tracking disabled:", err instanceof Error ? err.message : err);
  }
}
