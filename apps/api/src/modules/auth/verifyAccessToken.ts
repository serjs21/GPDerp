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

/**
 * Verifies the access JWT from cookies and checks the session is still active.
 * Safe to call from HTTP and WebSocket handshake requests.
 */
export async function verifyAccessTokenFromRequest(request: FastifyRequest): Promise<boolean> {
  const token =
    request.cookies?.[AUTH_COOKIE_NAMES.accessToken] ??
    readCookieValue(request.headers.cookie, AUTH_COOKIE_NAMES.accessToken);
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
}
