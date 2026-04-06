import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  DEFAULT_HAIKU_PAGE_SIZE,
  DEFAULT_HAIKU_SUBJECT,
  MAX_HAIKU_PAGE_SIZE,
} from "../../consts/haiku";
import { ACCOUNT_HEADER_KEY, TAB_HEADER_KEY } from "../../consts/ids";
import { isUuid } from "../../utils/uuid";
import { authRepository } from "../auth/repository";
import { haikuService } from "./haiku.service";

const haikuPluginImpl = async (app: FastifyInstance) => {
  app.get(
    "/haiku",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const q = req.query as Record<string, string | undefined>;
      const rawAccountId = q.accountId?.trim();
      const accountIdParam = rawAccountId === "" ? undefined : rawAccountId;

      if (accountIdParam && accountIdParam !== "default" && !isUuid(accountIdParam)) {
        res.code(400).send({ ok: false, error: "Invalid accountId" });
        return;
      }

      let pageSize = DEFAULT_HAIKU_PAGE_SIZE;
      if (q.pageSize !== undefined) {
        const n = Number(q.pageSize);
        if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
          res.code(400).send({ ok: false, error: "Invalid pageSize" });
          return;
        }
        pageSize = Math.min(n, MAX_HAIKU_PAGE_SIZE);
      }

      let offset = 0;
      if (q.offset !== undefined) {
        const n = Number(q.offset);
        if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
          res.code(400).send({ ok: false, error: "Invalid offset" });
          return;
        }
        offset = n;
      }

      const result = await haikuService.listHaikusForUser({
        userId,
        accountIdParam,
        pageSize,
        offset,
      });

      if (!result.ok) {
        res.code(403).send({ ok: false, error: "No access to this account" });
        return;
      }

      res.send({
        ok: true,
        data: {
          haikus: result.items,
          total: result.total,
          pageSize: result.pageSize,
          offset: result.offset,
        },
      });
    },
  );

  app.delete(
    "/haiku/:haikuId",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const { haikuId } = req.params as { haikuId: string };
      if (!isUuid(haikuId)) {
        res.code(400).send({ ok: false, error: "Invalid haiku id" });
        return;
      }

      const result = await haikuService.deleteHaikuForUser({ userId, haikuId });

      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Not found" });
          return;
        }
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      res.send({ ok: true });
    },
  );

  app.post(
    "/beer_me_haiku",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const body = req.body as { subject?: string } | undefined;
      let stream: AsyncIterable<string> | null = null;

      const userId = req.user?.sub;
      if (!userId) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const preferredAccountId = req.headers[ACCOUNT_HEADER_KEY]?.toString();
      const accountId = await authRepository.findAccountIdForUser(userId, preferredAccountId || null);
      if (!accountId) {
        res.code(403).send({ ok: false, error: "No workspace access for this account" });
        return;
      }

      try {
        const subject = body?.subject || DEFAULT_HAIKU_SUBJECT;
        app.log.info({ subject }, "Creating haiku");

        stream = await haikuService.createHaikuStream(subject, req, {
          accountId,
          createdById: userId,
        });
      } catch (e: any) {
        res.code(500).send({
          ok: false,
          error: e?.message ?? "agent start failed",
        });
        return;
      }

      try {
        if (!stream) throw new Error("No stream available");

        const subject = body?.subject || DEFAULT_HAIKU_SUBJECT;
        const uid = req.headers?.[TAB_HEADER_KEY]?.toString();

        if (!uid) app.log.warn("No uid found in headers");

        const sendToUid = (app as any).sendToUid as undefined | ((uid: string, msg: unknown) => void);

        for await (const chunk of stream) {
          if (uid && sendToUid) {
            sendToUid(uid, {
              data: { delta: chunk, subject },
              id: req.id,
            });
          }

          process.stdout.write(chunk);
        }

        res.status(200).send({ ok: true });
      } catch (e: any) {
        res.code(500).send({
          ok: false,
          error: e?.message ?? "stream failed",
        });
      }
    },
  );
};

export const haikuPlugin = fp(haikuPluginImpl);

