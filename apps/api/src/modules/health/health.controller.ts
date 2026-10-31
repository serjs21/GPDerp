import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { READYZ_DB_TIMEOUT_MS } from "../../consts/server";
import { prismaClient } from "../../lib/prisma";

const timeout = (ms: number) =>
  new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`database check timed out after ${ms}ms`)), ms).unref();
  });

/** Liveness: the process is up and serving HTTP. Never touches the database. */
const live = async () => ({ ok: true });

/** Readiness: the database answers a trivial query within READYZ_DB_TIMEOUT_MS. Errors are logged, never returned. */
const ready = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await Promise.race([prismaClient.$queryRaw`SELECT 1`, timeout(READYZ_DB_TIMEOUT_MS)]);
    return { ok: true, db: "up" };
  } catch (err) {
    request.log.warn({ err }, "readyz: database check failed");
    return reply.code(503).send({ ok: false, db: "down" });
  }
};

const healthPluginImpl = async (app: FastifyInstance) => {
  app.get("/healthz", live);
  app.get("/health/live", live);
  app.get("/readyz", ready);
  app.get("/health/ready", ready);
};

export const healthPlugin = fp(healthPluginImpl);
