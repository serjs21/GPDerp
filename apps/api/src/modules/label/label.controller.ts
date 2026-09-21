import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { isUuid } from "../../utils/uuid";
import { labelService } from "./label.service";

const labelPluginImpl = async (app: FastifyInstance) => {
  app.get(
    "/labels/:accountId",
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

      const result = await labelService.listLabelsForAccount({ userId, accountId });
      if (!result.ok) {
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      res.send({ ok: true, data: { labels: result.labels } });
    },
  );

  app.post(
    "/label/:accountId",
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

      const { name, color, shape } =
        (req.body as { name?: string; color?: string; shape?: string } | undefined) ?? {};
      const result = await labelService.createLabelForAccount({
        userId,
        accountId,
        name: (name ?? "").trim(),
        color: (color ?? "default").trim(),
        shape,
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

  app.put(
    "/label/haiku/:haikuId",
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

      const labelIds = ((req.body as { labelIds?: unknown } | undefined)?.labelIds ?? []) as unknown;
      if (!Array.isArray(labelIds) || !labelIds.every((id) => typeof id === "string" && isUuid(id))) {
        res.code(400).send({ ok: false, error: "labelIds must be an array of UUIDs" });
        return;
      }

      const result = await labelService.setHaikuLabelsForUser({
        userId,
        haikuId,
        labelIds,
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Not found" });
          return;
        }
        if (result.reason === "invalid_labels") {
          res.code(400).send({ ok: false, error: "One or more labels do not belong to this account" });
          return;
        }
        if (result.reason === "too_many_labels") {
          res.code(400).send({ ok: false, error: "A haiku can have at most 10 labels" });
          return;
        }
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      res.send({ ok: true, data: { labels: result.labels } });
    },
  );

  app.patch(
    "/label/haiku/:haikuId/placement",
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

      const body =
        (req.body as
          | {
              labelId?: unknown;
              connectionPointId?: unknown;
              rotateDeg?: unknown;
              xPercent?: unknown;
              yPercent?: unknown;
            }
          | undefined) ?? {};
      const labelId = body.labelId;
      const connectionPointId = body.connectionPointId;
      const rotateDeg = body.rotateDeg;
      const xPercent = body.xPercent;
      const yPercent = body.yPercent;
      if (typeof labelId !== "string" || !isUuid(labelId)) {
        res.code(400).send({ ok: false, error: "labelId must be a UUID" });
        return;
      }
      if (typeof rotateDeg !== "number" || !Number.isFinite(rotateDeg)) {
        res.code(400).send({ ok: false, error: "rotateDeg must be a finite number" });
        return;
      }
      if (typeof xPercent !== "number" || !Number.isFinite(xPercent)) {
        res.code(400).send({ ok: false, error: "xPercent must be a finite number" });
        return;
      }
      if (typeof yPercent !== "number" || !Number.isFinite(yPercent)) {
        res.code(400).send({ ok: false, error: "yPercent must be a finite number" });
        return;
      }

      const result = await labelService.updateHaikuLabelPlacementForUser({
        userId,
        haikuId,
        labelId,
        rotateDeg,
        xPercent,
        yPercent,
        ...(typeof connectionPointId === "string" ? { connectionPointId } : {}),
      });

      if (!result.ok) {
        if (result.reason === "not_found") {
          res.code(404).send({ ok: false, error: "Not found" });
          return;
        }
        if (result.reason === "invalid_placement") {
          res.code(400).send({ ok: false, error: "Invalid placement" });
          return;
        }
        res.code(403).send({ ok: false, error: "Unauthorized" });
        return;
      }

      res.send({ ok: true, data: { label: result.label } });
    },
  );
};

export const labelPlugin = fp(labelPluginImpl);
