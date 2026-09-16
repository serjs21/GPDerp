import type { FastifyRequest } from "fastify";
import { HAIKU_STREAM_ANONYMOUS_UID } from "../../consts/haiku";
import { TAB_HEADER_KEY } from "../../consts/ids";
import { runHaikuAgentStream } from "../../agent";
import { runHaikuAgentStreamMock } from "../../mocks/textStream";
import { authRepository } from "../auth/repository";
import { haikuRepository, type GeneratedHaikuRow } from "./haiku.repository";
import { labelRepository } from "../label/label.repository";
import { normalizeLabelShape } from "../label/labelShape";
import { mailService } from "../email/mailService";
import { buildShareHaikuEmail } from "../email/templates/shareHaikuTemplate";

const chunkToString = (chunk: string | Buffer): string =>
  typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf-8");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const resolveSenderName = (user: {
  userName?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
}) => {
  const userName = user.userName?.trim();
  if (userName) return userName;
  const fullName = `${user.firstName?.trim() ?? ""} ${user.lastName?.trim() ?? ""}`.trim();
  if (fullName) return fullName;
  const emailPrefix = user.email?.split("@")[0]?.trim();
  return emailPrefix || "Someone";
};

export type HaikuStreamContext = {
  accountId: string;
  createdById: string;
};

/** Serialized row matching GET /haiku list items — sent over WS when persist completes. */
export type HaikuPersistedPayload = {
  id: string;
  title: string;
  titleSuffix: number;
  body: string;
  createdAt: string;
  accountId: string;
  createdById: string;
  labels: Array<{ id: string; name: string; color: string; shape: string }>;
};

export type HaikuStreamYield =
  | string
  | { type: "saved"; haiku: HaikuPersistedPayload; creditsRemaining: number };

function toPersistedPayload(row: GeneratedHaikuRow): HaikuPersistedPayload {
  return {
    id: row.id,
    title: row.title,
    titleSuffix: row.titleSuffix,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
    accountId: row.accountId,
    createdById: row.createdById,
    labels: row.labels,
  };
}

export const haikuService = {
  async getManageLabelsAccountIdForUser(userId: string): Promise<string | null> {
    return authRepository.findDefaultWorkspaceAccountIdForUser(userId);
  },

  async listLabelsForUser(params: {
    userId: string;
    accountId: string;
    pageSize: number;
    offset: number;
    q?: string;
  }): Promise<
    | { ok: false; reason: "forbidden" }
    | {
        ok: true;
        labels: Awaited<ReturnType<typeof labelRepository.listForAccountPaged>>;
        total: number;
        pageSize: number;
        offset: number;
      }
  > {
    const { userId, accountId, pageSize, offset, q } = params;
    const allowed = await authRepository.findAccountIdForUser(userId, accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };
    const [labels, total] = await Promise.all([
      labelRepository.listForAccountPaged(accountId, pageSize, offset, q),
      labelRepository.countForAccount(accountId, q),
    ]);
    return { ok: true, labels, total, pageSize, offset };
  },

  async createLabelForUser(params: {
    userId: string;
    accountId: string;
    name: string;
    color: string;
    shape?: string;
  }): Promise<
    | { ok: false; reason: "forbidden" | "invalid_name" | "duplicate" }
    | { ok: true; label: Awaited<ReturnType<typeof labelRepository.createForAccount>> }
  > {
    const { userId, accountId } = params;
    const name = params.name.trim();
    const color = params.color.trim() || "default";
    const shape = normalizeLabelShape(params.shape);
    if (name.length < 3) return { ok: false, reason: "invalid_name" };
    const allowed = await authRepository.findAccountIdForUser(userId, accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };
    try {
      const label = await labelRepository.createForAccount(accountId, name, color, shape);
      return { ok: true, label };
    } catch (e: any) {
      if (e?.code === "P2002") return { ok: false, reason: "duplicate" };
      throw e;
    }
  },

  async updateLabelForUser(params: {
    userId: string;
    labelId: string;
    name: string;
    color: string;
    shape?: string;
  }): Promise<
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_name" | "duplicate" }
    | { ok: true; label: Awaited<ReturnType<typeof labelRepository.updateById>> }
  > {
    const { userId, labelId } = params;
    const name = params.name.trim();
    const color = params.color.trim() || "default";
    const shape = normalizeLabelShape(params.shape);
    if (name.length < 3) return { ok: false, reason: "invalid_name" };
    const existing = await labelRepository.findById(labelId);
    if (!existing) return { ok: false, reason: "not_found" };
    const allowed = await authRepository.findAccountIdForUser(userId, existing.accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };
    try {
      const label = await labelRepository.updateById(labelId, { name, color, shape });
      return { ok: true, label };
    } catch (e: any) {
      if (e?.code === "P2002") return { ok: false, reason: "duplicate" };
      throw e;
    }
  },

  async deleteLabelForUser(params: {
    userId: string;
    labelId: string;
  }): Promise<{ ok: true } | { ok: false; reason: "not_found" | "forbidden" }> {
    const { userId, labelId } = params;
    const existing = await labelRepository.findById(labelId);
    if (!existing) return { ok: false, reason: "not_found" };
    const allowed = await authRepository.findAccountIdForUser(userId, existing.accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };
    await labelRepository.deleteById(labelId);
    return { ok: true };
  },

  async createHaikuStream(
    subject: string,
    request: FastifyRequest,
    streamContext: HaikuStreamContext,
    useRealAgent: boolean = false,
  ): Promise<AsyncIterable<HaikuStreamYield>> {
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

    return (async function* (): AsyncGenerator<HaikuStreamYield> {
      const assembled: string[] = [];
      for await (const chunk of baseStream as AsyncIterable<string | Buffer | null>) {
        if (chunk === null) continue;
        const s = chunkToString(chunk);
        assembled.push(s);
        yield s;
      }

      const body = assembled.join("");
      if (body.trim()) {
        const persisted = await haikuRepository.createFromGeneration({
          accountId: streamContext.accountId,
          createdById: streamContext.createdById,
          subject,
          body,
        });
        if (persisted.ok) {
          yield {
            type: "saved",
            haiku: toPersistedPayload(persisted.haiku),
            creditsRemaining: persisted.creditsRemaining,
          };
        }
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

  async getHaikusByIdsForUser(params: {
    userId: string;
    ids: string[];
  }): Promise<{ ok: true; haikus: HaikuPersistedPayload[] }> {
    const uniqueIds = [...new Set(params.ids)].slice(0, 50);
    if (uniqueIds.length === 0) {
      return { ok: true, haikus: [] };
    }

    const accountIds = await authRepository.listAccountIdsForUser(params.userId);
    if (accountIds.length === 0) {
      return { ok: true, haikus: [] };
    }

    const rows = await haikuRepository.findFullByIdsForAccounts(uniqueIds, accountIds);
    return {
      ok: true,
      haikus: rows.map((row) => ({
        id: row.id,
        title: row.title,
        titleSuffix: row.titleSuffix,
        body: row.body,
        createdAt: row.createdAt.toISOString(),
        accountId: row.accountId,
        createdById: row.createdById,
        labels: row.labels,
      })),
    };
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

  async setHaikuLabelsForUser(params: {
    userId: string;
    haikuId: string;
    labelIds: string[];
    accountLabelIds: Set<string>;
  }): Promise<
    | { ok: true; labels: Array<{ id: string; name: string; color: string; shape: string }> }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_labels" }
  > {
    const { userId, haikuId, labelIds, accountLabelIds } = params;
    const haiku = await haikuRepository.findById(haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    if (haiku.createdById !== userId) {
      const membership = await authRepository.findMembershipRoleForAccount(userId, haiku.accountId);
      const role = membership?.role;
      if (role !== "ADMIN" && role !== "OWNER") {
        return { ok: false, reason: "forbidden" };
      }
    }

    const uniqueIds = [...new Set(labelIds)];
    if (!uniqueIds.every((id) => accountLabelIds.has(id))) {
      return { ok: false, reason: "invalid_labels" };
    }

    const updated = await haikuRepository.setLabels(haikuId, uniqueIds);
    return { ok: true, labels: updated.labels };
  },

  async shareHaikuByEmailForUser(params: {
    userId: string;
    haikuId: string;
    recipients: string[];
    personalMessage: string;
  }): Promise<
    | { ok: true; sentCount: number }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_recipients" }
  > {
    const normalizedRecipients = [...new Set(params.recipients.map((v) => v.trim().toLowerCase()))].filter(Boolean);
    if (normalizedRecipients.length === 0 || !normalizedRecipients.every((email) => EMAIL_REGEX.test(email))) {
      return { ok: false, reason: "invalid_recipients" };
    }

    const haiku = await haikuRepository.findFullById(params.haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    const allowed = await authRepository.findAccountIdForUser(params.userId, haiku.accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };
    const sender = await authRepository.findUserById(params.userId);
    if (!sender) return { ok: false, reason: "forbidden" };

    const senderName = resolveSenderName(sender);
    const emailPayload = buildShareHaikuEmail({
      senderName,
      personalMessage: params.personalMessage,
      title: haiku.title,
      body: haiku.body,
    });

    await Promise.all(
      normalizedRecipients.map((to) =>
        mailService.sendEmail({
          to,
          subject: emailPayload.subject,
          text: emailPayload.text,
          html: emailPayload.html,
          replyTo: sender.email,
        }),
      ),
    );

    return { ok: true, sentCount: normalizedRecipients.length };
  },
};

