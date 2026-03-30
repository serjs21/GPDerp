import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { TAB_HEADER_KEY } from "../../consts/ids";
import { haikuService } from "./haiku.service";

const haikuPluginImpl = async (app: FastifyInstance) => {
  app.post("/beer_me_haiku", async (req: FastifyRequest, res: FastifyReply) => {
    const body = req.body as { subject?: string } | undefined;
    let stream: AsyncIterable<string | null> | null = null;

    try {
      const subject = body?.subject || "random morbit subject";
      app.log.info({ subject }, "Creating haiku");

      stream = await haikuService.createHaikuStream(subject, req);
    } catch (e: any) {
      res.code(500).send({
        ok: false,
        error: e?.message ?? "agent start failed",
      });
      return;
    }

    try {
      if (!stream) throw new Error("No stream available");

      const subject = body?.subject || "random morbit subject";
      const uid = req.headers?.[TAB_HEADER_KEY]?.toString();

      if (!uid) app.log.warn("No uid found in headers");

      const sendToUid = (app as any).sendToUid as undefined | ((uid: string, msg: unknown) => void);

      for await (const chunk of stream) {
        if (chunk === null) continue;
        const s = chunk;

        if (uid && sendToUid) {
          sendToUid(uid, {
            data: { delta: Buffer.from(s).toString("utf-8"), subject },
            id: req.id,
          });
        }

        process.stdout.write(s);
      }

      res.status(200).send({ ok: true });
    } catch (e: any) {
      res.code(500).send({
        ok: false,
        error: e?.message ?? "stream failed",
      });
    }
  });
};

export const haikuPlugin = fp(haikuPluginImpl);

