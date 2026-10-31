import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

/** Off in production unless MONITORING_DEV_ROUTES=true (e.g. a one-off check that errors reach Better Stack). */
export const isMonitoringDevRouteEnabled = (env: NodeJS.ProcessEnv = process.env) =>
  env.NODE_ENV !== "production" || env.MONITORING_DEV_ROUTES === "true";

export class MonitoringTestError extends Error {
  constructor() {
    super("Intentional test error from /dev/monitoring/throw");
    this.name = "MonitoringTestError";
  }
}

/** Dev-only triggers for verifying error reporting and request correlation end to end. */
export const monitoringDevPlugin = fp(async (app: FastifyInstance) => {
  // Thrown error: Fastify's default 500 response, reported once as an exception.
  app.get("/dev/monitoring/throw", async () => {
    throw new MonitoringTestError();
  });

  // Handler-sent 500 (no exception): reported once as a message.
  app.get("/dev/monitoring/handled-500", async (_request, reply) =>
    reply.code(500).send({ ok: false, error: "Intentional handled 500 from /dev/monitoring/handled-500" }),
  );
});
