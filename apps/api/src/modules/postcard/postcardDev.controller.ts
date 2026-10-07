import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { PostcardMessageTooLongError, renderPostcardBackPng } from "./postcardBackRenderer";

export const isPostcardDevRouteEnabled = (env: NodeJS.ProcessEnv = process.env) =>
  env.NODE_ENV !== "production";

type PostcardBackQuery = { message?: string; senderName?: string };

/** Dev-only: the exact back PNG the email worker would attach, for visual parity with the web component. */
export const postcardDevPlugin = fp(async (app: FastifyInstance) => {
  app.get("/dev/postcard_back.png", async (req: FastifyRequest, res: FastifyReply) => {
    const { message = "", senderName = "Someone" } = req.query as PostcardBackQuery;
    try {
      const png = await renderPostcardBackPng({ message, senderName });
      res.header("Content-Type", "image/png").header("Cache-Control", "no-store").send(png);
    } catch (err) {
      if (err instanceof PostcardMessageTooLongError) {
        res.code(400).send({ ok: false, error: err.message });
        return;
      }
      throw err;
    }
  });
});
