import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { READYZ_DB_TIMEOUT_MS } from "../../consts/server";
import { prismaClient } from "../../lib/prisma";

const timeout = (ms: number) =>
  new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`database check timed out after ${ms}ms`)), ms).unref();
  });

const healthPluginImpl = async (app: FastifyInstance) => {
  /** Liveness: the process is up and serving HTTP. Never touches the database. */
  app.get("/healthz", async () => ({ ok: true }));

  /** Readiness: the database answers. Errors are logged, never returned. */
  app.get("/readyz", async (request, reply) => {
    try {
      await Promise.race([prismaClient.$queryRaw`SELECT 1`, timeout(READYZ_DB_TIMEOUT_MS)]);
      return { ok: true, db: "up" };
    } catch (err) {
      request.log.warn({ err }, "readyz: database check failed");
      return reply.code(503).send({ ok: false, db: "down" });
    }
  });
};

export const healthPlugin = fp(healthPluginImpl);
