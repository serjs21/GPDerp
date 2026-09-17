import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { iconUploadService } from "./iconUpload.service";

type PresignBody = {
  contentType?: string;
  sizeBytes?: number;
};

const iconUploadPluginImpl = async (app: FastifyInstance) => {
  // Dev sanity check: if this404s, the API process is stale or not running this build.
  app.get("/icon_upload/ping", async () => ({ ok: true as const, route: "icon-upload" }));

  app.post(
    "/icon_upload",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        return res.code(401).send({ ok: false, error: "Unauthorized" });
      }

      try {
        const file = await req.file({
          limits: { fileSize: iconUploadService.maxUploadSizeBytes },
        });
        if (!file) {
          return res.code(400).send({ ok: false, error: "Missing file field (expected multipart field: file)" });
        }

        const buffer = await file.toBuffer();
        const contentType = file.mimetype || "application/octet-stream";

        if (process.env.ICON_UPLOAD_DEBUG === "true") {
          req.log.info(
            { userId, fieldname: file.fieldname, mimetype: file.mimetype, byteLength: buffer.length },
            "icon direct upload",
          );
        }

        const result = await iconUploadService.uploadIconBuffer({ buffer, contentType });

        if (!result.ok) {
          if (result.error === "invalid_mime_type") {
            return res.code(400).send({
              ok: false,
              error: "Invalid image MIME type. Allowed: image/png, image/jpeg, image/webp",
            });
          }
          if (result.error === "invalid_size") {
            return res.code(400).send({
              ok: false,
              error: `Invalid image size. Max allowed is ${iconUploadService.maxUploadSizeBytes} bytes`,
            });
          }
          return res.code(500).send({ ok: false, error: "Could not store icon" });
        }

        return res.send({
          ok: true,
          data: {
            key: result.key,
            publicUrl: result.publicUrl,
          },
        });
      } catch (err: unknown) {
        const code = err && typeof err === "object" && "code" in err ? String((err as { code: unknown }).code) : "";
        if (code === "FST_REQ_FILE_TOO_LARGE") {
          return res.code(413).send({
            ok: false,
            error: `File too large. Max allowed is ${iconUploadService.maxUploadSizeBytes} bytes`,
          });
        }
        req.log.error({ err }, "icon direct upload failed");
        return res.code(500).send({ ok: false, error: "Could not store icon" });
      }
    },
  );

  app.post(
    "/icon_upload/presign",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) {
        return res.code(401).send({ ok: false, error: "Unauthorized" });
      }

      const body = (req.body as PresignBody | undefined) ?? {};
      const contentType = typeof body.contentType === "string" ? body.contentType : "";
      const normalizedContentType =
        contentType.trim().toLowerCase() === "image/jpg"
          ? "image/jpeg"
          : contentType.trim().toLowerCase();
      const sizeBytes = typeof body.sizeBytes === "number" ? body.sizeBytes : Number(body.sizeBytes ?? 0);
      if (process.env.ICON_UPLOAD_DEBUG === "true") {
        req.log.info(
          { userId, rawBody: body, normalizedContentType, sizeBytes },
          "icon presign request",
        );
      }
      const result = await iconUploadService.createPresignedUpload({
        contentType: normalizedContentType,
        sizeBytes,
      });

      if (!result.ok) {
        if (process.env.ICON_UPLOAD_DEBUG === "true") {
          req.log.info({ err: result.error, contentType: normalizedContentType, sizeBytes }, "icon presign rejected");
        }
        if (result.error === "invalid_mime_type") {
          return res.code(400).send({
            ok: false,
            error: "Invalid image MIME type. Allowed: image/png, image/jpeg, image/webp",
          });
        }
        if (result.error === "invalid_size") {
          return res.code(400).send({
            ok: false,
            error: `Invalid image size. Max allowed is ${iconUploadService.maxUploadSizeBytes} bytes`,
          });
        }
        return res.code(500).send({ ok: false, error: "Could not generate upload URL" });
      }

      if (process.env.ICON_UPLOAD_DEBUG === "true") {
        try {
          const host = new URL(result.uploadUrl).host;
          req.log.info({ host, key: result.key }, "icon presign ok");
        } catch {
          req.log.info({ uploadUrlPrefix: result.uploadUrl.slice(0, 80) }, "icon presign ok (url parse failed)");
        }
      }

      return res.send({
        ok: true,
        data: {
          uploadUrl: result.uploadUrl,
          method: "PUT",
          uploadHeaders: {
            "Content-Type": normalizedContentType,
          },
          key: result.key,
          publicUrl: result.publicUrl,
          expiresInSeconds: result.expiresInSeconds,
          maxUploadSizeBytes: result.maxUploadSizeBytes,
          allowedMimeTypes: iconUploadService.allowedMimeTypes,
        },
      });
    },
  );
};

// No fixed `name`: avoids fastify-plugin dedup skipping re-registration on some hot-reload setups.
export const iconUploadPlugin = fp(iconUploadPluginImpl);
