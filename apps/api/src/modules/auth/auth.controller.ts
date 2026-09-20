import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../env";
import { AUTH_CODES, AUTH_COOKIE_NAMES, AUTH_HEADER_NAMES, AUTH_MESSAGES } from "./constants";
import { authService } from "./auth.service";
import { userService } from "../user/user.service";
import { tokenService } from "./tokenService";
import { isAuthError } from "./errors";
import { safeEqual } from "./utils";
import { diagnoseAccessTokenFromRequest } from "./verifyAccessToken";
import {
  isDebugAuthLoggingEnabled,
  recordDebugAuthLog,
  type DebugAuthLogInput,
} from "./debugAuthLog";

const authPluginImpl = async (app: FastifyInstance) => {
  await app.register(cookie);

  const requestAuthMeta = (request: FastifyRequest) => ({
    route: request.routeOptions.url,
    method: request.method,
    ip: request.ip,
    origin: request.headers.origin,
    hasCookieHeader: Boolean(request.headers.cookie),
    contentType: request.headers["content-type"],
  });

  const respondAuthError = (
    request: FastifyRequest,
    reply: FastifyReply,
    error: unknown,
    context: string,
  ) => {
    if (isAuthError(error)) {
      app.log.warn(
        {
          ...requestAuthMeta(request),
          authFailure: true,
          context,
          statusCode: error.statusCode,
          code: error.code,
          expose: error.expose,
          message: error.message,
        },
        "auth: request failed with known auth error",
      );
      return reply.code(error.statusCode).send({
        ok: false,
        error: error.expose ? error.message : AUTH_MESSAGES.unauthorized,
        ...(error.code ? { code: error.code } : {}),
      });
    }

    app.log.error(
      {
        ...requestAuthMeta(request),
        authFailure: true,
        context,
        err: error,
      },
      "auth: request failed with unexpected error",
    );
    return reply.code(400).send({ ok: false, error: AUTH_MESSAGES.invalidAuthRequest });
  };

  const denyWithAuthCookiesCleared = (
    request: FastifyRequest,
    reply: FastifyReply,
    meta: {
      reason: string;
      message: string;
      userId?: string | null;
      sessionId?: string | null;
      detail?: DebugAuthLogInput["detail"];
    },
    statusCode = 401,
  ) => {
    void recordDebugAuthLog(
      {
        source: "api",
        event: "cookies_cleared",
        reason: meta.reason,
        message: meta.message,
        userId: meta.userId,
        sessionId: meta.sessionId,
        requestPath: request.routeOptions.url,
        method: request.method,
        ip: request.ip,
        userAgent: typeof request.headers["user-agent"] === "string"
          ? request.headers["user-agent"]
          : null,
        tabId:
          typeof request.headers["x-tab-id"] === "string" ? request.headers["x-tab-id"] : null,
        detail: meta.detail,
      },
      app.log,
    );
    tokenService.clearAuthCookies(reply);
    reply.code(statusCode).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
  };

  // Route guard for session-style endpoints (401 when not logged in).
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await diagnoseAccessTokenFromRequest(request);
    if (result.ok) return;
    return denyWithAuthCookiesCleared(request, reply, {
      reason: result.reason,
      message: `auth: access denied — ${result.reason}`,
      userId: result.userId,
      sessionId: result.sessionId,
    });
  };

  // Guard for resources that require a logged-in user (401 when not authenticated).
  const requireAuthenticated = async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await diagnoseAccessTokenFromRequest(request);
    if (result.ok) return;
    return denyWithAuthCookiesCleared(request, reply, {
      reason: result.reason,
      message: `auth: access denied — ${result.reason}`,
      userId: result.userId,
      sessionId: result.sessionId,
    });
  };

  app.decorate("authenticate", authenticate);
  app.decorate("requireAuthenticated", requireAuthenticated);

  const expectedWebOrigin = (() => {
    try {
      return new URL(env.CLIENT_URL).origin;
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
      return denyWithAuthCookiesCleared(request, reply, {
        reason: "csrf_origin",
        message: "auth: cookies cleared — Origin mismatch on CSRF-protected route",
        detail: { origin: request.headers.origin, expectedWebOrigin },
      });
    }

    if (!csrfCookie || !csrfHeader || !safeEqual(csrfCookie, csrfHeader)) {
      return denyWithAuthCookiesCleared(request, reply, {
        reason: "csrf_mismatch",
        message: "auth: cookies cleared — CSRF cookie/header mismatch",
        detail: {
          hasCsrfCookie: Boolean(csrfCookie),
          hasCsrfHeader: Boolean(csrfHeader),
        },
      });
    }
  };

  app.post("/auth/register", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    try {
      const result = await authService.registerManual(app, request, body);
      if (result.status === "session") {
        tokenService.setAuthCookies(reply, {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          csrfToken: result.tokens.csrfToken,
        });
      }
      return reply.code(201).send({ ok: true });
    } catch (error) {
      return respondAuthError(request, reply, error, "register_manual");
    }
  });

  app.post(
    "/auth/complete-registration",
    { preHandler: [requireCsrf, app.requireAuthenticated] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = (request.body as { userName?: string } | undefined) ?? {};
      try {
        const tokens = await authService.completeRegistrationUsername(app, request, body.userName ?? "");
        tokenService.setAuthCookies(reply, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          csrfToken: tokens.csrfToken,
        });
        return reply.send({ ok: true });
      } catch (error) {
        return respondAuthError(request, reply, error, "complete_registration");
      }
    },
  );

  app.get("/auth/check-email", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { email?: string };
    const result = await userService.checkEmailForPasswordRegistration(query.email ?? "");
    return reply.send({ ok: true, data: result });
  });

  app.get("/auth/check-username", async (request: FastifyRequest, reply: FastifyReply) => {
    const q = request.query as { username?: string };
    const result = await userService.checkUsernameAvailable(q.username ?? "");
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

  app.post("/auth/google/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { token: string };
    try {
      const result = await authService.loginGoogleForLoginFlow(app, request, body);
      if (result.status === "signup_required") {
        return reply.code(409).send({
          ok: false,
          error: AUTH_MESSAGES.googleSignupRequired,
          code: AUTH_CODES.GOOGLE_SIGNUP_REQUIRED,
          data: result.profile,
        });
      }
      tokenService.setAuthCookies(reply, {
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        csrfToken: result.tokens.csrfToken,
      });
      return reply.send({ ok: true });
    } catch (error) {
      return respondAuthError(request, reply, error, "login_google_flow");
    }
  });

  app.post("/auth/google/register", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      token: string;
      userName: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
    try {
      const tokens = await authService.registerGoogleWithUsername(app, request, body);
      tokenService.setAuthCookies(reply, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        csrfToken: tokens.csrfToken,
      });
      return reply.code(201).send({ ok: true });
    } catch (error) {
      return respondAuthError(request, reply, error, "register_google_with_username");
    }
  });

  app.post("/auth/refresh", { preHandler: [requireCsrf] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const refreshToken = request.cookies[AUTH_COOKIE_NAMES.refreshToken];
    if (!refreshToken) {
      return denyWithAuthCookiesCleared(request, reply, {
        reason: "refresh_cookie_missing",
        message: "auth: refresh rejected — refresh_token cookie missing",
      });
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
      // Service already wrote debug_auth_logs for the rejection reason.
      tokenService.clearAuthCookies(reply);
      return reply.code(401).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
    }
  });

  app.post("/auth/logout", { preHandler: [requireCsrf] }, async (request: FastifyRequest, reply: FastifyReply) => {
    await authService.logout(request.cookies[AUTH_COOKIE_NAMES.refreshToken]);
    tokenService.clearAuthCookies(reply);
    return reply.send({ ok: true });
  });

  app.post("/auth/debug-auth-log", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!isDebugAuthLoggingEnabled()) {
      return reply.code(204).send();
    }
    const body = (request.body as Partial<DebugAuthLogInput> | undefined) ?? {};
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const event = typeof body.event === "string" ? body.event.trim() : "client_auth_required";
    if (!reason || !message) {
      return reply.code(400).send({ ok: false, error: "reason and message are required" });
    }
    await recordDebugAuthLog(
      {
        source: "web",
        event,
        reason,
        message,
        userId: typeof body.userId === "string" ? body.userId : null,
        sessionId: typeof body.sessionId === "string" ? body.sessionId : null,
        requestPath: typeof body.requestPath === "string" ? body.requestPath : null,
        method: typeof body.method === "string" ? body.method : null,
        ip: request.ip,
        userAgent:
          typeof request.headers["user-agent"] === "string" ? request.headers["user-agent"] : null,
        tabId:
          typeof body.tabId === "string"
            ? body.tabId
            : typeof request.headers["x-tab-id"] === "string"
              ? request.headers["x-tab-id"]
              : null,
        detail: (body.detail as DebugAuthLogInput["detail"]) ?? null,
      },
      app.log,
    );
    return reply.code(204).send();
  });

  app.get("/auth/me", { preHandler: [app.authenticate] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        return denyWithAuthCookiesCleared(request, reply, {
          reason: "unauthenticated_me",
          message: "auth: /auth/me denied — request.user missing after authenticate",
        });
      }
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
    const q = request.query as { token?: string };
    if (!q.token) {
      return reply.code(400).send({
        ok: false,
        error: AUTH_MESSAGES.invalidToken,
      });
    }
    try {
      const result = await authService.verifyEmail(app, q.token);
      return reply.send({ ok: true, data: result });
    } catch (error) {
      return respondAuthError(request, reply, error, "verify_email");
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
      return respondAuthError(request, reply, error, "confirm_password_reset");
    }
  });
};

export const authPlugin = fp(authPluginImpl);
