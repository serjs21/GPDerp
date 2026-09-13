/**
 * DEV-ONLY auto-login for a fixed user.
 *
 * Removal: delete this file and remove its imports/call sites from `auth.controller.ts`
 * (and `DEV_USER_ID` from `env.ts` / `.env`). No frontend changes are tied to this.
 *
 * Enabled when `DEV_USER_ID` is set and `NODE_ENV !== "production"`.
 */
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../../env";
import { AUTH_COOKIE_NAMES } from "./constants";
import { authRepository } from "./repository";
import { tokenService } from "./tokenService";
import { hashToken } from "./utils";

export function isDevAutoLoginEnabled(): boolean {
  return Boolean(env.DEV_USER_ID) && process.env.NODE_ENV !== "production";
}

/**
 * Mint a real session for `DEV_USER_ID`, set auth cookies, and attach `request.user`.
 * Returns false when disabled, user missing, or not applicable.
 */
export async function tryDevAutoLogin(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  if (!isDevAutoLoginEnabled()) return false;

  const userId = env.DEV_USER_ID!;
  const user = await authRepository.findUserById(userId);
  if (!user) return false;

  const session = await authRepository.createSession({
    userId,
    ip: request.ip,
    userAgent: request.headers["user-agent"],
    expiresAt: tokenService.sessionExpiresAt(),
  });
  const refreshToken = tokenService.createRefreshToken();
  await authRepository.createRefreshToken({
    sessionId: session.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: tokenService.refreshExpiresAt(),
  });
  const csrfToken = tokenService.createCsrfToken();
  const accessToken = await tokenService.createAccessToken({
    sub: userId,
    sid: session.id,
    userName: user.userName ?? "",
    avatar: user.avatar ?? "",
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
  });

  tokenService.setAuthCookies(reply, { accessToken, refreshToken, csrfToken });
  request.user = { sub: userId, sid: session.id };
  return true;
}

/**
 * `/auth/refresh` cold-start: FE always POSTs refresh when no access JWT.
 * If there is no refresh cookie, mint the dev session and respond `{ ok: true }`
 * (skipping CSRF). Returns true when the reply was already sent.
 */
export async function tryDevAutoLoginOnRefresh(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<boolean> {
  if (!isDevAutoLoginEnabled()) return false;
  if (request.cookies[AUTH_COOKIE_NAMES.refreshToken]) return false;

  const ok = await tryDevAutoLogin(request, reply);
  if (!ok) return false;

  reply.send({ ok: true });
  return true;
}
