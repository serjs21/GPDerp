import { authRepository } from "../auth/repository";
import { haikuRepository } from "../haiku/haiku.repository";
import { haikuService } from "../haiku/haiku.service";
import { labelRepository } from "./label.repository";

export const labelService = {
  async listLabelsForAccount(params: {
    userId: string;
    accountId: string;
  }): Promise<
    | { ok: true; labels: Awaited<ReturnType<typeof labelRepository.listForAccount>> }
    | { ok: false; reason: "forbidden" }
  > {
    const { userId, accountId } = params;
    const allowed = await authRepository.findAccountIdForUser(userId, accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };
    const labels = await labelRepository.listForAccount(accountId);
    return { ok: true, labels };
  },

  async createLabelForAccount(params: {
    userId: string;
    accountId: string;
    name: string;
    color: string;
  }): Promise<
    | { ok: true; label: Awaited<ReturnType<typeof labelRepository.createForAccount>> }
    | { ok: false; reason: "forbidden" | "invalid_name" | "duplicate" }
  > {
    const { userId, accountId } = params;
    const rawName = params.name.trim();
    const color = (params.color || "default").trim() || "default";
    if (rawName.length < 3) return { ok: false, reason: "invalid_name" };

    const allowed = await authRepository.findAccountIdForUser(userId, accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };

    try {
      const label = await labelRepository.createForAccount(accountId, rawName, color);
      return { ok: true, label };
    } catch (e: any) {
      // accountId + name is unique in Prisma schema
      if (e?.code === "P2002") return { ok: false, reason: "duplicate" };
      throw e;
    }
  },

  async setHaikuLabelsForUser(params: {
    userId: string;
    haikuId: string;
    labelIds: string[];
  }): Promise<
    | { ok: true; labels: Array<{ id: string; name: string; color: string }> }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_labels" }
  > {
    const { userId, haikuId, labelIds } = params;
    const haiku = await haikuRepository.findById(haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    const allowed = await authRepository.findAccountIdForUser(userId, haiku.accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };

    const accountLabels = await labelRepository.listForAccount(haiku.accountId);
    const accountLabelIds = new Set(accountLabels.map((l) => l.id));
    return haikuService.setHaikuLabelsForUser({
      userId,
      haikuId,
      labelIds,
      accountLabelIds,
    });
  },
};
