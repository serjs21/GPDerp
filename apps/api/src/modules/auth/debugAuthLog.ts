import type { FastifyBaseLogger } from "fastify";
import type { Prisma } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";

export type DebugAuthLogInput = {
  source: "api" | "web";
  event: string;
  reason: string;
  message: string;
  userId?: string | null;
  sessionId?: string | null;
  requestPath?: string | null;
  method?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  tabId?: string | null;
  detail?: Prisma.InputJsonValue | null;
};

export function isDebugAuthLoggingEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.DEBUG_AUTH_LOGS === "true") return true;
  if (env.DEBUG_AUTH_LOGS === "false") return false;
  return env.NODE_ENV !== "production";
}

/**
 * Fire-and-forget insert for involuntary auth drops. Never throws into callers.
 */
export async function recordDebugAuthLog(
  input: DebugAuthLogInput,
  log?: FastifyBaseLogger,
): Promise<void> {
  if (!isDebugAuthLoggingEnabled()) return;
  try {
    await prismaClient.debugAuthLog.create({
      data: {
        source: input.source,
        event: input.event,
        reason: input.reason,
        message: input.message,
        userId: input.userId ?? null,
        sessionId: input.sessionId ?? null,
        requestPath: input.requestPath ?? null,
        method: input.method ?? null,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        tabId: input.tabId ?? null,
        detail: input.detail ?? undefined,
      },
    });
  } catch (err) {
    log?.warn({ err, reason: input.reason }, "debug_auth_logs: insert failed");
  }
}
