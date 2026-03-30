import type { FastifyReply } from "fastify";
import { AUTH_COOKIE_NAMES } from "./constants";
import { addSeconds, generateOpaqueToken } from "./utils";
import { env } from "../../env";
import { SignJWT } from "jose";
import { TextEncoder } from "node:util";

type AccessTokenPayload = {
  sub: string;
  sid: string;
};

const cookieSameSite = (() => {
  // Browsers reject `SameSite=None` unless `Secure` is also set.
  if (env.COOKIE_SAME_SITE === "none" && !env.COOKIE_SECURE) return "lax";
  return env.COOKIE_SAME_SITE;
})();

const accessCookieBase = {
  // Intentionally non-HttpOnly so the frontend can do an initial JWT presence/expiry check.
  // Authoritative auth still happens server-side on `/auth/me` and in `fastify.authenticate`.
  httpOnly: false,
  secure: env.COOKIE_SECURE,
  sameSite: cookieSameSite,
  domain: env.COOKIE_DOMAIN,
  priority: "high" as const,
} as const;

const refreshCookieBase = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: cookieSameSite,
  domain: env.COOKIE_DOMAIN,
  priority: "high" as const,
} as const;

const csrfCookieBase = {
  httpOnly: false,
  secure: env.COOKIE_SECURE,
  sameSite: cookieSameSite,
  domain: env.COOKIE_DOMAIN,
  priority: "high" as const,
} as const;

export const tokenService = {
  async createAccessToken(payload: AccessTokenPayload) {
    const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
    const nowSec = Math.floor(Date.now() / 1000);
    const expSec = nowSec + env.ACCESS_TOKEN_TTL_SECONDS;

    // HS256 symmetric JWT.
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(nowSec)
      .setExpirationTime(expSec)
      .sign(secret);
  },

  createRefreshToken() {
    return generateOpaqueToken(64);
  },

  createCsrfToken() {
    return generateOpaqueToken(32);
  },

  accessExpiresAt() {
    return addSeconds(env.ACCESS_TOKEN_TTL_SECONDS);
  },

  refreshExpiresAt() {
    return addSeconds(env.REFRESH_TOKEN_TTL_SECONDS);
  },

  sessionExpiresAt() {
    return addSeconds(env.SESSION_TTL_SECONDS);
  },

  setAuthCookies(
    reply: FastifyReply,
    params: { accessToken: string; refreshToken: string; csrfToken: string },
  ) {
    const { accessToken, refreshToken, csrfToken } = params;

    reply.setCookie(AUTH_COOKIE_NAMES.accessToken, accessToken, {
      ...accessCookieBase,
      path: "/",
      maxAge: env.ACCESS_TOKEN_TTL_SECONDS,
    });

    reply.setCookie(AUTH_COOKIE_NAMES.refreshToken, refreshToken, {
      ...refreshCookieBase,
      path: "/auth",
      maxAge: env.REFRESH_TOKEN_TTL_SECONDS,
    });

    // Double-submit CSRF: frontend reads this non-HttpOnly cookie and sends it as `x-csrf-token`.
    reply.setCookie(AUTH_COOKIE_NAMES.csrfToken, csrfToken, {
      ...csrfCookieBase,
      path: "/",
      maxAge: env.SESSION_TTL_SECONDS,
    });
  },

  clearAuthCookies(reply: FastifyReply) {
    reply.clearCookie(AUTH_COOKIE_NAMES.accessToken, {
      path: "/",
      ...accessCookieBase,
    });
    reply.clearCookie(AUTH_COOKIE_NAMES.refreshToken, {
      path: "/auth",
      ...refreshCookieBase,
    });
    reply.clearCookie(AUTH_COOKIE_NAMES.csrfToken, {
      path: "/",
      ...csrfCookieBase,
    });
  },
};
