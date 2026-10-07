import type { FastifyRequest } from "fastify";
import { HAIKU_STREAM_ANONYMOUS_UID } from "../../consts/haiku";
import { TAB_HEADER_KEY } from "../../consts/ids";
import { runHaikuAgentStream } from "../../agent";
import { runHaikuAgentStreamMock } from "../../mocks/textStream";
import { authRepository } from "../auth/repository";
import { haikuRepository, type GeneratedHaikuRow } from "./haiku.repository";
import type { HaikuLinkedLabel } from "./haikuLabelPlacement";
import { HAIKU_LABELS_MAX } from "./haikuLabelPlacement";
import { labelRepository } from "../label/label.repository";
import { normalizeLabelShape } from "../label/labelShape";
import { postcardBatchRepository } from "../postcard/postcardBatch.repository";
import { enqueuePostcardEmails } from "../postcard/postcardQueue";
import { postcardMessageFits } from "../postcard/postcardTextWrap";
import { normalizeShareRecipient } from "./utils/shareHaikuEmailRequest";

const chunkToString = (chunk: string | Buffer): string =>
  typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf-8");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const resolveSenderName = (user: {
  userName?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
}) => {
  const fullName = `${user.firstName?.trim() ?? ""} ${user.lastName?.trim() ?? ""}`.trim();
  if (fullName) return fullName;
  const userName = user.userName?.trim();
  if (userName) return userName;
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
  labels: HaikuLinkedLabel[];
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
    includeConnectedHaikus?: boolean;
    connectedHaikuLimit?: number;
  }): Promise<
    | { ok: false; reason: "forbidden" }
    | {
        ok: true;
        labels: Array<
          Awaited<ReturnType<typeof labelRepository.listForAccountPaged>>[number] & {
            connectedHaikus?: {
              total: number;
              items: Array<{ id: string; title: string; body: string }>;
            };
          }
        >;
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

    if (!params.includeConnectedHaikus || labels.length === 0) {
      return { ok: true, labels, total, pageSize, offset };
    }

    const connectedLimit = Math.min(
      10,
      Math.max(1, Math.floor(params.connectedHaikuLimit ?? 3)),
    );
    const connectedRows = await labelRepository.listConnectedHaikusForLabels(
      labels.map((label) => label.id),
      connectedLimit,
    );
    const byId = new Map(connectedRows.map((row) => [row.id, row]));
    const labelsWithConnected = labels.map((label) => {
      const row = byId.get(label.id);
      return {
        ...label,
        connectedHaikus: {
          total: row?._count.haikus ?? 0,
          items: row?.haikus ?? [],
        },
      };
    });

    return { ok: true, labels: labelsWithConnected, total, pageSize, offset };
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

  async listConnectedHaikusForUser(params: {
    userId: string;
    labelId: string;
    limit?: number;
  }): Promise<
    | {
        ok: true;
        total: number;
        items: Array<{ id: string; title: string; body: string }>;
      }
    | { ok: false; reason: "not_found" | "forbidden" }
  > {
    const { userId, labelId } = params;
    const limit = Math.min(10, Math.max(1, Math.floor(params.limit ?? 3)));
    const row = await labelRepository.listConnectedHaikus(labelId, limit);
    if (!row) return { ok: false, reason: "not_found" };
    const allowed = await authRepository.findAccountIdForUser(userId, row.accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };
    return {
      ok: true,
      total: row._count.haikus,
      items: row.haikus,
    };
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
    /** Case-insensitive title substring filter. */
    q?: string;
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
    const { userId, accountIdParam, pageSize, offset, q } = params;

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
      haikuRepository.listForAccounts(accountIds, pageSize, offset, q),
      haikuRepository.countForAccounts(accountIds, q),
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
    | { ok: true; labels: HaikuLinkedLabel[] }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_labels" | "too_many_labels" }
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
    if (uniqueIds.length > HAIKU_LABELS_MAX) {
      return { ok: false, reason: "too_many_labels" };
    }
    if (!uniqueIds.every((id) => accountLabelIds.has(id))) {
      return { ok: false, reason: "invalid_labels" };
    }

    const updated = await haikuRepository.setLabels(haikuId, uniqueIds);
    return { ok: true, labels: updated.labels };
  },

  async updateHaikuLabelPlacementForUser(params: {
    userId: string;
    haikuId: string;
    labelId: string;
    rotateDeg: number;
    xPercent: number;
    yPercent: number;
    connectionPointId?: string;
  }): Promise<
    | { ok: true; label: HaikuLinkedLabel }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_placement" }
  > {
    const { userId, haikuId, labelId, rotateDeg, xPercent, yPercent, connectionPointId } =
      params;
    if (
      !Number.isFinite(rotateDeg) ||
      !Number.isFinite(xPercent) ||
      !Number.isFinite(yPercent) ||
      xPercent < 0 ||
      xPercent > 100 ||
      yPercent < 0 ||
      yPercent > 100
    ) {
      return { ok: false, reason: "invalid_placement" };
    }

    const haiku = await haikuRepository.findById(haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    if (haiku.createdById !== userId) {
      const membership = await authRepository.findMembershipRoleForAccount(userId, haiku.accountId);
      const role = membership?.role;
      if (role !== "ADMIN" && role !== "OWNER") {
        return { ok: false, reason: "forbidden" };
      }
    }

    if (!haiku.labels.some((label) => label.id === labelId)) {
      return { ok: false, reason: "not_found" };
    }

    const updated = await haikuRepository.updateLabelPlacement(haikuId, labelId, {
      ...(connectionPointId?.trim() ? { connectionPointId: connectionPointId.trim() } : {}),
      rotateDeg,
      xPercent,
      yPercent,
    });
    if (!updated) return { ok: false, reason: "not_found" };
    return { ok: true, label: updated };
  },

  async shareHaikuByEmailForUser(params: {
    userId: string;
    haikuId: string;
    recipients: string[];
    personalMessage: string;
    /** Browser-rendered postcard front shared by all recipients; the back is rendered on the server. */
    front?: Buffer;
  }): Promise<
    | { ok: true; queuedCount: number }
    | {
        ok: false;
        reason:
          | "not_found"
          | "forbidden"
          | "invalid_recipients"
          | "message_too_long"
          | "enqueue_failed";
      }
  > {
    const normalizedRecipients = [...new Set(params.recipients.map(normalizeShareRecipient))].filter(Boolean);
    if (normalizedRecipients.length === 0 || !normalizedRecipients.every((email) => EMAIL_REGEX.test(email))) {
      return { ok: false, reason: "invalid_recipients" };
    }
    const personalMessage = params.personalMessage.trim();
    if (!postcardMessageFits(personalMessage)) {
      return { ok: false, reason: "message_too_long" };
    }

    const haiku = await haikuRepository.findFullById(params.haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    const allowed = await authRepository.findAccountIdForUser(params.userId, haiku.accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };
    const sender = await authRepository.findUserById(params.userId);
    if (!sender) return { ok: false, reason: "forbidden" };

    const batch = await postcardBatchRepository.create({
      userId: params.userId,
      haikuId: params.haikuId,
      haikuTitle: haiku.title,
      haikuBody: haiku.body,
      senderName: resolveSenderName(sender),
      senderEmail: sender.email,
      message: personalMessage,
      frontPng: params.front,
      recipientCount: normalizedRecipients.length,
    });

    try {
      const queuedCount = await enqueuePostcardEmails(batch.id, normalizedRecipients);
      return { ok: true, queuedCount };
    } catch (err) {
      console.error("[shareHaikuByEmail] enqueue failed", err);
      await postcardBatchRepository.deleteById(batch.id);
      return { ok: false, reason: "enqueue_failed" };
    }
  },
};

