import { authRepository } from "../auth/repository";
import { haikuRepository } from "../haiku/haiku.repository";
import { haikuService } from "../haiku/haiku.service";
import type { HaikuLinkedLabel } from "../haiku/haikuLabelPlacement";
import { labelRepository } from "./label.repository";
import { normalizeLabelShape } from "./labelShape";

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
    shape?: string;
  }): Promise<
    | { ok: true; label: Awaited<ReturnType<typeof labelRepository.createForAccount>> }
    | { ok: false; reason: "forbidden" | "invalid_name" | "duplicate" }
  > {
    const { userId, accountId } = params;
    const rawName = params.name.trim();
    const color = (params.color || "default").trim() || "default";
    const shape = normalizeLabelShape(params.shape);
    if (rawName.length < 3) return { ok: false, reason: "invalid_name" };

    const allowed = await authRepository.findAccountIdForUser(userId, accountId);
    if (!allowed) return { ok: false, reason: "forbidden" };

    try {
      const label = await labelRepository.createForAccount(accountId, rawName, color, shape);
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
    | { ok: true; labels: HaikuLinkedLabel[] }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_labels" | "too_many_labels" }
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
    return haikuService.updateHaikuLabelPlacementForUser(params);
  },
};
