import type { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  type AuthenticatedUser = { sub: string; sid: string };

  interface FastifyRequest {
    user?: AuthenticatedUser;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
