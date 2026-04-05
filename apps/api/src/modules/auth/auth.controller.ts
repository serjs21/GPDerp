import fp from "fastify-plugin";
import cookie from "@fastify/cookie";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../env";
import { AUTH_CODES, AUTH_COOKIE_NAMES, AUTH_HEADER_NAMES, AUTH_MESSAGES } from "./constants";
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

  const denyWithAuthCookiesCleared = (reply: FastifyReply, statusCode = 401) => {
    tokenService.clearAuthCookies(reply);
    reply.code(statusCode).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
  };

  // Shared: verifies access JWT from the `access_token` cookie and checks that the
  // associated server-side session is still active (not revoked/expired).
  const verifyAccessTokenForRequest = async (request: FastifyRequest): Promise<boolean> => {
    const token = request.cookies[AUTH_COOKIE_NAMES.accessToken];
    if (!token) return false;

    try {
      const { payload } = await jwtVerify(token, accessJwtSecret, {
        algorithms: ["HS256"],
      });

      const sub = payload.sub;
      const sid = (payload as Record<string, unknown>).sid;

      if (typeof sub !== "string" || typeof sid !== "string") {
        return false;
      }

      const session = await authRepository.findActiveAuthSessionById(sid);
      if (!session || session.userId !== sub) return false;
      request.user = { sub, sid };
      return true;
    } catch {
      return false;
    }
  };

  // Route guard for session-style endpoints (401 when not logged in).
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    const ok = await verifyAccessTokenForRequest(request);
    if (ok) return;
    return denyWithAuthCookiesCleared(reply, 401);
  };

  // Stricter guard for resources that must not run without a valid user (403).
  const requireAuthenticated = async (request: FastifyRequest, reply: FastifyReply) => {
    const ok = await verifyAccessTokenForRequest(request);
    if (ok) return;
    tokenService.clearAuthCookies(reply);
    return reply.code(403).send({ ok: false, error: AUTH_MESSAGES.unauthorized });
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
      avatar?: string;
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
      return respondAuthError(request, reply, error, "register_manual");
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
