import type { FastifyRequest } from "fastify";
import { HAIKU_STREAM_ANONYMOUS_UID } from "../../consts/haiku";
import { TAB_HEADER_KEY } from "../../consts/ids";
import { runHaikuAgentStream } from "../../agent";
import { runHaikuAgentStreamMock } from "../../mocks/textStream";
import { authRepository } from "../auth/repository";
import { haikuRepository } from "./haiku.repository";

const chunkToString = (chunk: string | Buffer): string =>
  typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf-8");

export type HaikuStreamContext = {
  accountId: string;
  createdById: string;
};

export const haikuService = {
  async createHaikuStream(
    subject: string,
    request: FastifyRequest,
    streamContext: HaikuStreamContext,
    useRealAgent: boolean = false,
  ) {
    const uid = request.headers?.[TAB_HEADER_KEY]?.toString();

    // Default behavior: use the mock stream.
    // Enable the real agent by setting `USE_HAIKU_AGENT=true`.
    const baseStream = !useRealAgent
      ? runHaikuAgentStreamMock()
      : await runHaikuAgentStream(subject, {
          context: {
            uid: uid ?? HAIKU_STREAM_ANONYMOUS_UID,
            isProUser: true,
          },
        });

    return (async function* () {
      const assembled: string[] = [];
      for await (const chunk of baseStream as AsyncIterable<string | Buffer | null>) {
        if (chunk === null) continue;
        const s = chunkToString(chunk);
        assembled.push(s);
        yield s;
      }

      const body = assembled.join("");
      if (body.trim()) {
        await haikuRepository.createFromGeneration({
          accountId: streamContext.accountId,
          createdById: streamContext.createdById,
          subject,
          body,
        });
      }
    })();
  },

  async listHaikusForUser(params: {
    userId: string;
    accountIdParam: string | undefined;
    pageSize: number;
    offset: number;
  }): Promise<
    | { ok: false; reason: "forbidden" }
    | {
        ok: true;
        items: Awaited<ReturnType<typeof haikuRepository.listForAccounts>>;
        total: number;
        pageSize: number;
        offset: number;
      }
  > {
    const { userId, accountIdParam, pageSize, offset } = params;

    let accountIds: string[];

    if (!accountIdParam) {
      accountIds = await authRepository.listAccountIdsForUser(userId);
    } else if (accountIdParam === "default") {
      const id = await authRepository.findDefaultWorkspaceAccountIdForUser(userId);
      accountIds = id ? [id] : [];
    } else {
      const allowed = await authRepository.findAccountIdForUser(userId, accountIdParam);
      if (!allowed) return { ok: false, reason: "forbidden" };
      accountIds = [allowed];
    }

    if (accountIds.length === 0) {
      return { ok: true, items: [], total: 0, pageSize, offset };
    }

    const [items, total] = await Promise.all([
      haikuRepository.listForAccounts(accountIds, pageSize, offset),
      haikuRepository.countForAccounts(accountIds),
    ]);

    return { ok: true, items, total, pageSize, offset };
  },

  async deleteHaikuForUser(params: {
    userId: string;
    haikuId: string;
  }): Promise<{ ok: true } | { ok: false; reason: "not_found" | "forbidden" }> {
    const { userId, haikuId } = params;

    const haiku = await haikuRepository.findById(haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    if (haiku.createdById === userId) {
      await haikuRepository.deleteById(haikuId);
      return { ok: true };
    }

    const membership = await authRepository.findMembershipRoleForAccount(userId, haiku.accountId);
    const role = membership?.role;
    if (role === "ADMIN" || role === "OWNER") {
      await haikuRepository.deleteById(haikuId);
      return { ok: true };
    }

    return { ok: false, reason: "forbidden" };
  },
};

