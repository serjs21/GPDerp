import type { FastifyReply } from "fastify";

declare module "fastify" {
  type AuthenticatedUser = { sub: string; sid: string };

  interface FastifyRequest {
    user?: AuthenticatedUser;
    rawBody?: string | Buffer;
  }

  interface FastifyContextConfig {
    rawBody?: boolean;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireAuthenticated: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
