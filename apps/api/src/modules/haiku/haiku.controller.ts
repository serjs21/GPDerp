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
import { GENERATION_CREDITS_SOCKET_KIND, HAIKU_GENERATION_CREDIT_COST } from "../payments/constants";
import { paymentsService } from "../payments/payments.service";
import { noGenerationsLeftMessage } from "../payments/utils/purchaseMessages";
import { haikuService, type HaikuStreamYield } from "./haiku.service";

const haikuPluginImpl = async (app: FastifyInstance) => {
  app.get(
    "/haiku/manage_labels/account",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }
      const accountId = await haikuService.getManageLabelsAccountIdForUser(userId);
      if (!accountId) {
        res.code(404).send({ ok: false, error: "No account found" });
        return;
      }
      res.send({ ok: true, data: { accountId } });
    },
  );

  app.get(
    "/haiku/labels/:accountId",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }
      const { accountId } = req.params as { accountId: string };
      if (!isUuid(accountId)) {
        res.code(400).send({ ok: false, error: "Invalid accountId" });
        return;
      }
      const q = req.query as Record<string, string | undefined>;
      const pageSize = Math.max(1, Math.min(Number(q.pageSize ?? "50") || 50, 100));
      const offset = Math.max(0, Number(q.offset ?? "0") || 0);
      const search = (q.q ?? "").trim() || undefined;
      const includeConnectedHaikus =
        q.includeConnectedHaikus === "1" ||
        q.includeConnectedHaikus === "true" ||
        q.includeConnectedHaikus === "yes";
      const connectedHaikuLimitRaw = Number(q.connectedHaikuLimit ?? "");
      const connectedHaikuLimit =
        Number.isFinite(connectedHaikuLimitRaw) && connectedHaikuLimitRaw > 0
          ? Math.floor(connectedHaikuLimitRaw)
          : undefined;
      const result = await haikuService.listLabelsForUser({
        userId,
        accountId,
        pageSize,
        offset,
        q: search,
        includeConnectedHaikus,
        connectedHaikuLimit,
      });
      if (!result.ok) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }
      res.send({
        ok: true,
        data: {
          labels: result.labels,
          total: result.total,
          pageSize: result.pageSize,
          offset: result.offset,
        },
      });
    },
  );

  app.post(
    "/haiku/label/:accountId",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }
      const { accountId } = req.params as { accountId: string };
      if (!isUuid(accountId)) {
        res.code(400).send({ ok: false, error: "Invalid accountId" });
        return;
      }
      const body = (req.body as { name?: string; color?: string; shape?: string } | undefined) ?? {};
      const result = await haikuService.createLabelForUser({
        userId,
        accountId,
        name: (body.name ?? "").trim(),
        color: (body.color ?? "default").trim(),
        shape: body.shape,
      });
      if (!result.ok) {
        if (result.reason === "invalid_name") {
          res.code(400).send({ ok: false, error: "Label name must be at least 3 characters" });
          return;
        }
        if (result.reason === "duplicate") {
          res.code(409).send({ ok: false, error: "Label already exists" });
          return;
        }
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }
      res.code(201).send({ ok: true, data: { label: result.label } });
    },
  );

  app.patch(
    "/haiku/label/:labelId",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }
      const { labelId } = req.params as { labelId: string };
      if (!isUuid(labelId)) {
        res.code(400).send({ ok: false, error: "Invalid labelId" });
        return;
      }
      const body = (req.body as { name?: string; color?: string; shape?: string } | undefined) ?? {};
      const result = await haikuService.updateLabelForUser({
        userId,
        labelId,
        name: (body.name ?? "").trim(),
        color: (body.color ?? "default").trim(),
        shape: body.shape,
      });
      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Not found" });
          return;
        }
        if (result.reason === "invalid_name") {
          res.code(400).send({ ok: false, error: "Label name must be at least 3 characters" });
          return;
        }
        if (result.reason === "duplicate") {
          res.code(409).send({ ok: false, error: "Label already exists" });
          return;
        }
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }
      res.send({ ok: true, data: { label: result.label } });
    },
  );

  app.delete(
    "/haiku/label/:labelId",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }
      const { labelId } = req.params as { labelId: string };
      if (!isUuid(labelId)) {
        res.code(400).send({ ok: false, error: "Invalid labelId" });
        return;
      }
      const result = await haikuService.deleteLabelForUser({ userId, labelId });
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

  app.get(
    "/haiku/label/:labelId/haikus",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }
      const { labelId } = req.params as { labelId: string };
      if (!isUuid(labelId)) {
        res.code(400).send({ ok: false, error: "Invalid labelId" });
        return;
      }
      const rawLimit = (req.query as { limit?: unknown } | undefined)?.limit;
      const parsedLimit =
        typeof rawLimit === "string" && rawLimit.trim() !== ""
          ? Number(rawLimit)
          : typeof rawLimit === "number"
            ? rawLimit
            : undefined;
      const limit =
        parsedLimit != null && Number.isFinite(parsedLimit) ? Math.floor(parsedLimit) : undefined;

      const result = await haikuService.listConnectedHaikusForUser({
        userId,
        labelId,
        limit,
      });
      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Not found" });
          return;
        }
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }
      res.send({ ok: true, data: { total: result.total, items: result.items } });
    },
  );

  app.get(
    "/haiku",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
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

  app.post(
    "/haiku/batch",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const body = (req.body as { ids?: unknown } | undefined) ?? {};
      const rawIds = Array.isArray(body.ids) ? body.ids : [];
      const ids = rawIds.filter((id): id is string => typeof id === "string" && isUuid(id));
      if (ids.length === 0 && rawIds.length > 0) {
        res.code(400).send({ ok: false, error: "Invalid haiku ids" });
        return;
      }

      const result = await haikuService.getHaikusByIdsForUser({ userId, ids });
      res.send({ ok: true, data: { haikus: result.haikus } });
    },
  );

  app.delete(
    "/haiku/:haikuId",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
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
    "/share_haiku_email",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const body =
        (req.body as
          | {
              haikuId?: string;
              emails?: string[];
              message?: string;
            }
          | undefined) ?? {};

      const haikuId = (body.haikuId ?? "").trim();
      if (!isUuid(haikuId)) {
        res.code(400).send({ ok: false, error: "Invalid haikuId" });
        return;
      }

      const emails = Array.isArray(body.emails) ? body.emails : [];
      if (emails.length === 0) {
        res.code(400).send({ ok: false, error: "At least one recipient email is required" });
        return;
      }

      const result = await haikuService.shareHaikuByEmailForUser({
        userId,
        haikuId,
        recipients: emails,
        personalMessage: (body.message ?? "").trim(),
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Haiku not found" });
          return;
        }
        if (result.reason === "invalid_recipients") {
          res.code(400).send({ ok: false, error: "One or more recipient emails are invalid" });
          return;
        }
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      res.send({ ok: true, data: { sentCount: result.sentCount } });
    },
  );

  app.post(
    "/beer_me_haiku",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const body = req.body as { subject?: string } | undefined;
      let stream: AsyncIterable<HaikuStreamYield> | null = null;

      const userId = req.user?.sub;
      if (!userId) {
        res.code(401).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const preferredAccountId = req.headers[ACCOUNT_HEADER_KEY]?.toString();
      const accountId = await authRepository.findAccountIdForUser(userId, preferredAccountId || null);
      if (!accountId) {
        res.code(403).send({ ok: false, error: "No workspace access for this account" });
        return;
      }

      const credits = await paymentsService.getCredits(userId);
      if (!credits.ok) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }
      if (credits.credits < HAIKU_GENERATION_CREDIT_COST) {
        const purchasesCount = await paymentsService.countCompletedPurchases(userId);
        res.code(402).send({
          ok: false,
          error: "insufficient_credits",
          message: noGenerationsLeftMessage(purchasesCount),
        });
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

        const sendToUid = app.sendToUid;
        const broadcastToUser = app.broadcastToUser;

        let savedCreditsRemaining: number | null = null;
        for await (const chunk of stream as AsyncIterable<HaikuStreamYield>) {
          if (typeof chunk === "string") {
            if (uid && sendToUid) {
              sendToUid(uid, {
                id: req.id,
                kind: "delta",
                data: { delta: chunk, subject },
              });
            }
            process.stdout.write(chunk);
          } else if (chunk.type === "saved") {
            savedCreditsRemaining = chunk.creditsRemaining;
            if (broadcastToUser) {
              broadcastToUser(userId, {
                kind: GENERATION_CREDITS_SOCKET_KIND,
                data: { credits: chunk.creditsRemaining },
              });
            }
            if (uid && sendToUid) {
              sendToUid(uid, {
                id: req.id,
                kind: "saved",
                data: { haiku: chunk.haiku, subject },
              });
            }
          }
        }

        if (uid && sendToUid && savedCreditsRemaining === null) {
          sendToUid(uid, {
            id: req.id,
            kind: "complete",
            data: { subject },
          });
        }

        let remaining = savedCreditsRemaining;
        if (remaining === null) {
          const latest = await paymentsService.getCredits(userId);
          remaining = latest.ok ? latest.credits : credits.credits;
        }
        res.status(200).send({ ok: true, creditsRemaining: remaining });
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

