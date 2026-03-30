import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../env";
import { AUTH_COOKIE_NAMES, AUTH_HEADER_NAMES, AUTH_MESSAGES } from "./constants";
import { authService } from "./auth.service";
import { authRepository } from "./repository";
import { tokenService } from "./tokenService";
import { isAuthError } from "./errors";
import { safeEqual } from "./utils";
import { jwtVerify } from "jose";
import { TextEncoder } from "node:util";

const authPluginImpl = async (app: FastifyInstance) => {
  await app.register(cookie);
  const accessJwtSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

  const respondAuthError = (reply: FastifyReply, error: unknown) => {
    if (isAuthError(error)) {
      return reply.code(error.statusCode).send({
        ok: false,
        error: error.expose ? error.message : AUTH_MESSAGES.unauthorized,
        ...(error.code ? { code: error.code } : {}),
      });
    }

    return reply.code(400).send({ ok: false, error: AUTH_MESSAGES.invalidAuthRequest });
  };

  const denyWithAuthCookiesCleared = (reply: FastifyReply, statusCode = 401) => {
    tokenService.clearAuthCookies(reply);
    reply.code(statusCode).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
  };

  // Route guard: verifies access JWT from the `access_token` cookie and checks that the
  // associated server-side session is still active (not revoked/expired).
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies[AUTH_COOKIE_NAMES.accessToken];
    if (!token) return denyWithAuthCookiesCleared(reply, 401);

    try {
      const { payload } = await jwtVerify(token, accessJwtSecret, {
        algorithms: ["HS256"],
      });

      const sub = payload.sub;
      const sid = (payload as Record<string, unknown>).sid;

      if (typeof sub !== "string" || typeof sid !== "string") {
        return denyWithAuthCookiesCleared(reply, 401);
      }

      const session = await authRepository.findActiveAuthSessionById(sid);
      if (!session || session.userId !== sub) return denyWithAuthCookiesCleared(reply, 401);
      request.user = { sub, sid };
    } catch {
      return denyWithAuthCookiesCleared(reply, 401);
    }
  };

  app.decorate("authenticate", authenticate);

  const expectedWebOrigin = (() => {
    try {
      return new URL(env.WEB_APP_URL).origin;
    } catch {
      return null;
    }
  })();

  // CSRF protection for cookie-authenticated state-changing endpoints.
  // We use a double-submit cookie: `csrf_token` (readable by JS) + `x-csrf-token` header.
  const requireCsrf = async (request: FastifyRequest, reply: FastifyReply) => {
    const csrfCookie = request.cookies[AUTH_COOKIE_NAMES.csrfToken];
    const csrfHeader = request.headers[AUTH_HEADER_NAMES.csrf] as string | undefined;

    // Best-effort origin check in production.
    if (
      process.env.NODE_ENV === "production" &&
      expectedWebOrigin &&
      request.headers.origin &&
      request.headers.origin !== expectedWebOrigin
    ) {
      tokenService.clearAuthCookies(reply);
      return reply.code(403).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
    }

    if (!csrfCookie || !csrfHeader || !safeEqual(csrfCookie, csrfHeader)) {
      tokenService.clearAuthCookies(reply);
      return reply.code(403).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
    }
  };

  app.post("/auth/register", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      email: string;
      password: string;
      userName: string;
      firstName?: string;
      lastName?: string;
    };
    try {
      const tokens = await authService.registerManual(app, request, body);
      tokenService.setAuthCookies(reply, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        csrfToken: tokens.csrfToken,
      });
      return reply.code(201).send({ ok: true });
    } catch (error) {
      return respondAuthError(reply, error);
    }
  });

  app.get("/auth/check-email", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { email?: string };
    const result = await authService.checkEmailForPasswordRegistration(query.email ?? "");
    return reply.send({ ok: true, data: result });
  });

  app.get("/auth/check-username", async (request: FastifyRequest, reply: FastifyReply) => {
    const q = request.query as { username?: string };
    const result = await authService.checkUsernameAvailable(q.username ?? "");
    return reply.send({ ok: true, data: result });
  });

  app.post("/auth/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { email: string; password: string };
    try {
      const tokens = await authService.loginManual(app, request, body);
      tokenService.setAuthCookies(reply, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        csrfToken: tokens.csrfToken,
      });
      return reply.send({ ok: true });
    } catch (error) {
      if (isAuthError(error)) {
        return reply.code(error.statusCode).send({
          ok: false,
          error: error.expose ? error.message : AUTH_MESSAGES.invalidCredentials,
          ...(error.code ? { code: error.code } : {}),
        });
      }
      return reply.code(401).send({ ok: false, error: AUTH_MESSAGES.invalidCredentials });
    }
  });

  app.post("/auth/google", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { token: string };
    try {
      const tokens = await authService.loginGoogle(app, request, body);
      tokenService.setAuthCookies(reply, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        csrfToken: tokens.csrfToken,
      });
      return reply.send({ ok: true });
    } catch {
      return reply.code(401).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
    }
  });

  app.post("/auth/refresh", { preHandler: [requireCsrf] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies[AUTH_COOKIE_NAMES.refreshToken];
    if (!refreshToken) {
      tokenService.clearAuthCookies(reply);
      return reply.code(401).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
    }
    try {
      const tokens = await authService.refresh(app, refreshToken);
      tokenService.setAuthCookies(reply, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        csrfToken: tokens.csrfToken,
      });
      return reply.send({ ok: true });
    } catch {
      tokenService.clearAuthCookies(reply);
      return reply.code(401).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
    }
  });

  app.post("/auth/logout", { preHandler: [requireCsrf] }, async (request: FastifyRequest, reply: FastifyReply) => {
    await authService.logout(request.cookies[AUTH_COOKIE_NAMES.refreshToken]);
    tokenService.clearAuthCookies(reply);
    return reply.send({ ok: true });
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) return denyWithAuthCookiesCleared(reply, 401);
      const me = await authService.me(app, request.user.sub);
      return reply.send({ ok: true, data: me });
    } catch {
      return reply.code(401).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
    }
  });

  app.post("/auth/verify-email/resend", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { email: string };
    await authService.resendVerification(app, body.email);
    return reply.send({ ok: true });
  });

  app.get("/auth/verify-email", async (request: FastifyRequest, reply: FastifyReply) => {
    const q = request.query as { token: string };
    try {
      await authService.verifyEmail(app, q.token);
      return reply.send({ ok: true });
    } catch (error) {
      return respondAuthError(reply, error);
    }
  });

  app.post("/auth/reset/request", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { email: string };
    await authService.requestPasswordReset(body.email);
    return reply.send({ ok: true });
  });

  app.post("/auth/reset/confirm", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { token: string; password: string };
    try {
      await authService.confirmPasswordReset(app, body);
      return reply.send({ ok: true });
    } catch (error) {
      return respondAuthError(reply, error);
    }
  });
};

export const authPlugin = fp(authPluginImpl);
