import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { sentryErrorReporter, type ErrorReporter } from "./errorReporter";
import { REQUEST_ID_HEADER } from "./requestId";

export type ObservabilityOptions = {
  release?: string;
  reporter?: ErrorReporter;
};

/** Probe routes: logged at debug so uptime/health checks don't flood the request log. */
export const HEALTH_ROUTES = new Set(["/health", "/healthz", "/readyz", "/health/live", "/health/ready"]);

const UNMATCHED_ROUTE = "(unmatched)";

const kThrownError = Symbol("observability.thrownError");
type RequestWithError = FastifyRequest & { [kThrownError]?: unknown };

const logLevelFor = (statusCode: number, route: string) => {
  if (statusCode >= 500) return "error" as const;
  if (HEALTH_ROUTES.has(route)) return "debug" as const;
  return "info" as const;
};

/**
 * Request correlation and error reporting:
 * - echoes the request id as `x-request-id` on every response;
 * - writes one structured line per request (route pattern, method, status, duration, release);
 * - reports each 5xx exactly once: the thrown error when there is one, otherwise a message
 *   (handlers that send a 500 themselves). 4xx responses are expected and never reported.
 * Error handling and response bodies are left to Fastify and the route handlers.
 */
async function observabilityPlugin(app: FastifyInstance, options: ObservabilityOptions) {
  const reporter = options.reporter ?? sentryErrorReporter;
  const release = options.release;

  app.addHook("onRequest", async (request, reply) => {
    reply.header(REQUEST_ID_HEADER, request.id);
  });

  app.addHook("onError", async (request, _reply, error) => {
    (request as RequestWithError)[kThrownError] = error;
  });

  app.addHook("onResponse", async (request, reply) => {
    const statusCode = reply.statusCode;
    const route = request.routeOptions.url ?? UNMATCHED_ROUTE;
    const method = request.method;
    const thrown = (request as RequestWithError)[kThrownError];
    // disableRequestLogging also silences Fastify's own 5xx error log, so the stack goes on this line.
    const err = statusCode >= 500 ? thrown : undefined;

    request.log[logLevelFor(statusCode, route)](
      { route, method, statusCode, durationMs: Math.round(reply.elapsedTime), release, ...(err ? { err } : {}) },
      "request completed",
    );

    if (statusCode < 500) return;
    const context = { requestId: String(request.id), route, method, statusCode };
    if (thrown !== undefined) reporter.captureException(thrown, context);
    else reporter.captureMessage(`HTTP ${statusCode} ${method} ${route}`, context);
  });
}

export const registerObservability = fp(observabilityPlugin, { name: "observability" });
