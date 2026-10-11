import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { userService } from "./user.service";

const userPluginImpl = async (app: FastifyInstance) => {
  app.get(
    "/user/profile",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const profile = await userService.getOwnProfile(userId);
      if (!profile) return res.code(404).send({ ok: false, error: "User not found" });
      return res.send({ ok: true, data: profile });
    },
  );

  app.patch(
    "/user/profile",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const payload = (req.body as Record<string, unknown> | undefined) ?? {};
      const result = await userService.updateOwnProfile({ userId, payload });
      if (!result.ok) return res.code(404).send({ ok: false, error: "User not found" });
      return res.send({ ok: true, data: result.profile });
    },
  );

  app.patch(
    "/user/profile/avatar",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const body = (req.body as { avatar?: unknown } | undefined) ?? {};
      const result = await userService.updateOwnAvatar({ userId, avatarRaw: body.avatar });
      if (!result.ok) {
        if (result.reason === "invalid_avatar") {
          return res.code(400).send({ ok: false, error: "Invalid avatar URL" });
        }
        return res.code(404).send({ ok: false, error: "User not found" });
      }
      return res.send({ ok: true, data: result.profile });
    },
  );

  app.post(
    "/user/change-email/request",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const body = (req.body as { newEmail?: string } | undefined) ?? {};
      const result = await userService.createEmailChangeRequest({
        userId,
        nextEmailRaw: body.newEmail ?? "",
      });
      if (!result.ok) {
        if (result.reason === "forbidden_google") {
          return res.code(400).send({ ok: false, error: "Email change is disabled for Google sign-in users" });
        }
        return res.code(400).send({ ok: false, error: "Invalid email" });
      }
      return res.send({ ok: true, data: { pendingEmail: result.pendingEmail } });
    },
  );

  app.post(
    "/user/change-email/resend",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const body = (req.body as { newEmail?: string } | undefined) ?? {};
      const result = await userService.resendEmailChangeRequest({
        userId,
        maybeNextEmailRaw: body.newEmail,
      });
      if (!result.ok) {
        if (result.reason === "forbidden_google") {
          return res.code(400).send({ ok: false, error: "Email change is disabled for Google sign-in users" });
        }
        if (result.reason === "missing_request") {
          return res.code(404).send({ ok: false, error: "No pending email change request found" });
        }
        return res.code(400).send({ ok: false, error: "Invalid email" });
      }
      return res.send({ ok: true, data: { pendingEmail: result.pendingEmail } });
    },
  );

  app.get("/user/change-email/verify", async (req: FastifyRequest, res: FastifyReply) => {
    const q = (req.query as { token?: string } | undefined) ?? {};
    const token = q.token?.trim() ?? "";
    if (!token) return res.code(400).send({ ok: false, error: "Missing token" });
    const result = await userService.verifyEmailChange(token);
    if (result.status === "invalid") return res.code(400).send({ ok: false, error: "Invalid token" });
    if (result.status === "expired") return res.code(400).send({ ok: false, error: "Token expired" });
    return res.send({ ok: true, data: { status: "verified" } });
  });

  app.patch(
    "/user/configuration",
    { preHandler: [app.requireAuthenticated] },
    async (req: FastifyRequest, res: FastifyReply) => {
      const userId = req.user?.sub;
      if (!userId) return res.code(401).send({ ok: false, error: "Unauthorized" });
      const payload = (req.body as Record<string, unknown> | undefined) ?? {};
      const result = await userService.updateOwnConfiguration({ userId, payload });
      if (!result.ok) {
        if (result.reason === "invalid_theme") {
          return res.code(400).send({ ok: false, error: "Invalid theme" });
        }
        if (result.reason === "invalid_language") {
          return res.code(400).send({ ok: false, error: "Invalid language" });
        }
        if (result.reason === "invalid_celestial_slot") {
          return res.code(400).send({ ok: false, error: "Invalid celestial slot" });
        }
        return res.code(404).send({ ok: false, error: "User not found" });
      }
      return res.send({ ok: true, data: result.configuration });
    },
  );
};

export const userPlugin = fp(userPluginImpl, { name: "user-routes" });
