import type { FastifyRequest } from "fastify";
import { jwtVerify } from "jose";
import { TextEncoder } from "node:util";
import { env } from "../../env";
import { AUTH_COOKIE_NAMES } from "./constants";
import { authRepository } from "./repository";

const accessJwtSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export function readCookieValue(
  cookieHeader: string | undefined,
  name: string,
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    if (key !== name) continue;
    try {
      return decodeURIComponent(trimmed.slice(eq + 1));
    } catch {
      return trimmed.slice(eq + 1);
    }
  }
  return undefined;
}

export type AccessTokenDiagnoseResult =
  | { ok: true; userId: string; sessionId: string }
  | {
      ok: false;
      reason: "access_token_missing" | "access_token_invalid" | "session_inactive";
      userId?: string;
      sessionId?: string;
    };

/**
 * Verifies the access JWT from cookies and checks the session is still active.
 * Safe to call from HTTP and WebSocket handshake requests.
 */
export async function diagnoseAccessTokenFromRequest(
  request: FastifyRequest,
): Promise<AccessTokenDiagnoseResult> {
  const token =
    request.cookies?.[AUTH_COOKIE_NAMES.accessToken] ??
    readCookieValue(request.headers.cookie, AUTH_COOKIE_NAMES.accessToken);
  if (!token) return { ok: false, reason: "access_token_missing" };

  try {
    const { payload } = await jwtVerify(token, accessJwtSecret, {
      algorithms: ["HS256"],
    });

    const sub = payload.sub;
    const sid = (payload as Record<string, unknown>).sid;

    if (typeof sub !== "string" || typeof sid !== "string") {
      return { ok: false, reason: "access_token_invalid" };
    }

    const session = await authRepository.findActiveAuthSessionById(sid);
    if (!session || session.userId !== sub) {
      return {
        ok: false,
        reason: "session_inactive",
        userId: sub,
        sessionId: sid,
      };
    }
    request.user = { sub, sid };
    return { ok: true, userId: sub, sessionId: sid };
  } catch {
    return { ok: false, reason: "access_token_invalid" };
  }
}

export async function verifyAccessTokenFromRequest(request: FastifyRequest): Promise<boolean> {
  const result = await diagnoseAccessTokenFromRequest(request);
  return result.ok;
}
