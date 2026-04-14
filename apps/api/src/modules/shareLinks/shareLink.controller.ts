import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isUuid } from "../../utils/uuid";
import { shareLinkService } from "./shareLink.service";

const shareLinkPluginImpl = async (app: FastifyInstance) => {
  app.get(
    "/share_links",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }
      const q = req.query as Record<string, string | undefined>;
      const pageSize = Math.max(1, Math.min(Number(q.pageSize ?? "50") || 50, 50));
      const offset = Math.max(0, Number(q.offset ?? "0") || 0);
      const filterRaw = (q.filter ?? "").trim().toLowerCase();
      const filter =
        filterRaw === "active" ||
        filterRaw === "inactive" ||
        filterRaw === "expired" ||
        filterRaw === "view_limit_reached"
          ? filterRaw
          : undefined;
      const search = (q.search ?? "").trim();

      const result = await shareLinkService.listShareLinksForUser({
        userId,
        pageSize,
        offset,
        filter,
        search: search || undefined,
      });

      res.send({
        ok: true,
        data: {
          items: result.items,
          total: result.total,
          pageSize: result.pageSize,
          offset: result.offset,
        },
      });
    },
  );

  app.post(
    "/share_link",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const body = (req.body as {
        haikuId?: string;
        expirationDate?: string | null;
        maxViews?: number | null;
      }) ?? {};

      const haikuId = body.haikuId?.trim() ?? "";
      if (!isUuid(haikuId)) {
        res.code(400).send({ ok: false, error: "Invalid haiku id" });
        return;
      }

      let expirationDate: Date | null = null;
      if (body.expirationDate != null && body.expirationDate !== "") {
        expirationDate = new Date(body.expirationDate);
      }

      const maxViews =
        body.maxViews === undefined || body.maxViews === null ? null : body.maxViews;

      const result = await shareLinkService.createShareLink({
        userId,
        haikuId,
        expirationDate,
        maxViews,
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Haiku not found" });
          return;
        }
        if (result.reason === "forbidden") {
          res.code(403).send({ ok: false, error: "You cannot share this haiku" });
          return;
        }
        if (result.reason === "invalid_expiry") {
          res.code(400).send({ ok: false, error: "Expiration must be a future date and time" });
          return;
        }
        if (result.reason === "invalid_max_views") {
          res.code(400).send({ ok: false, error: "maxViews must be a positive integer" });
          return;
        }
        res.code(400).send({ ok: false, error: "Invalid request" });
        return;
      }

      res.code(201).send({ ok: true, data: result.shareLink });
    },
  );

  app.delete(
    "/share_link/:share_link_id",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const { share_link_id } = req.params as { share_link_id: string };
      if (!isUuid(share_link_id)) {
        res.code(400).send({ ok: false, error: "Invalid share link id" });
        return;
      }

      const result = await shareLinkService.deleteShareLink({
        userId,
        shareLinkId: share_link_id,
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Share link not found" });
          return;
        }
        res.code(403).send({ ok: false, error: "Only the creator can delete this share link" });
        return;
      }

      res.send({ ok: true });
    },
  );

  app.patch(
    "/share_link/:share_link_id/refresh",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      const { share_link_id } = req.params as { share_link_id: string };
      if (!isUuid(share_link_id)) {
        res.code(400).send({ ok: false, error: "Invalid share link id" });
        return;
      }

      const body = (req.body as { expirationDate?: string | null; maxViews?: number | null } | undefined) ?? {};
      let expirationDate: Date | null = null;
      if (body.expirationDate != null && body.expirationDate !== "") {
        expirationDate = new Date(body.expirationDate);
      }
      const maxViews = body.maxViews === undefined || body.maxViews === null ? null : body.maxViews;

      const result = await shareLinkService.refreshShareLink({
        userId,
        shareLinkId: share_link_id,
        expirationDate,
        maxViews,
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Share link not found" });
          return;
        }
        if (result.reason === "forbidden") {
          res.code(403).send({ ok: false, error: "Only the creator can refresh this share link" });
          return;
        }
        if (result.reason === "invalid_expiry") {
          res.code(400).send({ ok: false, error: "Expiration must be a future date and time" });
          return;
        }
        if (result.reason === "invalid_max_views") {
          res.code(400).send({ ok: false, error: "maxViews must be a positive integer" });
          return;
        }
        res.code(400).send({ ok: false, error: "Invalid request" });
        return;
      }

      res.send({ ok: true, data: result.shareLink });
    },
  );

  app.get("/share_link/:share_link_id", async (req: FastifyRequest, res: FastifyReply) => {
    const { share_link_id } = req.params as { share_link_id: string };
    const token = share_link_id?.trim() ?? "";
    if (!token) {
      res.code(400).send({ ok: false, error: "Missing share token" });
      return;
    }

    const result = await shareLinkService.resolveSharedHaiku(token);
    if (!result.ok) {
      res.code(404).send({ ok: false, error: result.reason });
      return;
    }

    res.send({
      ok: true,
      data: {
        haiku: result.haiku,
        remainingViews: result.remainingViews,
        permanent: result.permanent,
        sharedByUserName: result.sharedByUserName,
      },
    });
  });
};

export const shareLinkPlugin = fp(shareLinkPluginImpl, { name: "share-link-routes" });
