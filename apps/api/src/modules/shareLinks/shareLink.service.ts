import { randomBytes } from "node:crypto";
import { env } from "../../env";
import { prismaClient } from "../../lib/prisma";
import { authRepository } from "../auth/repository";
import { haikuRepository } from "../haiku/haiku.repository";
import { shareLinkRepository } from "./shareLink.repository";

const haikuPayload = (
  row: NonNullable<Awaited<ReturnType<typeof haikuRepository.findFullById>>>,
) => ({
  id: row.id,
  title: row.title,
  titleSuffix: row.titleSuffix,
  body: row.body,
  createdAt: row.createdAt.toISOString(),
  accountId: row.accountId,
  createdById: row.createdById,
  labels: row.labels,
});

const newShareHash = (): string => randomBytes(18).toString("base64url");

export const shareLinkService = {
  async userCanAccessHaiku(userId: string, haikuId: string): Promise<boolean> {
    const haiku = await haikuRepository.findById(haikuId);
    if (!haiku) return false;
    const member = await authRepository.findAccountIdForUser(userId, haiku.accountId);
    return Boolean(member);
  },

  async createShareLink(params: {
    userId: string;
    haikuId: string;
    expirationDate: Date | null;
    maxViews: number | null;
  }): Promise<
    | {
        ok: true;
        shareLink: {
          id: string;
          shareHash: string;
          shareUrl: string;
          expirationDate: string | null;
          maxViews: number | null;
        };
      }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_expiry" | "invalid_max_views" }
  > {
    const { userId, haikuId, expirationDate, maxViews } = params;

    const haiku = await haikuRepository.findById(haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    const allowed = await shareLinkService.userCanAccessHaiku(userId, haikuId);
    if (!allowed) return { ok: false, reason: "forbidden" };

    if (expirationDate != null) {
      if (!(expirationDate instanceof Date) || Number.isNaN(expirationDate.getTime())) {
        return { ok: false, reason: "invalid_expiry" };
      }
      if (expirationDate.getTime() <= Date.now()) {
        return { ok: false, reason: "invalid_expiry" };
      }
    }

    if (maxViews != null) {
      if (!Number.isInteger(maxViews) || maxViews < 1) {
        return { ok: false, reason: "invalid_max_views" };
      }
    }

    let shareHash = newShareHash();
    for (let i = 0; i < 8; i++) {
      const existing = await shareLinkRepository.findByShareHash(shareHash);
      if (!existing) break;
      shareHash = newShareHash();
    }

    const row = await shareLinkRepository.create({
      shareHash,
      createdByUserId: userId,
      sharedHaikuId: haikuId,
      expirationDate,
      maxViews,
    });

    const shareUrl = `${env.WEB_APP_URL.replace(/\/$/, "")}/share/${row.shareHash}`;

    return {
      ok: true,
      shareLink: {
        id: row.id,
        shareHash: row.shareHash,
        shareUrl,
        expirationDate: row.expirationDate ? row.expirationDate.toISOString() : null,
        maxViews: row.maxViews,
      },
    };
  },

  async deleteShareLink(params: {
    userId: string;
    shareLinkId: string;
  }): Promise<{ ok: true } | { ok: false; reason: "not_found" | "forbidden" }> {
    const row = await shareLinkRepository.findById(params.shareLinkId);
    if (!row) return { ok: false, reason: "not_found" };
    if (row.createdByUserId !== params.userId) return { ok: false, reason: "forbidden" };
    await shareLinkRepository.deleteById(params.shareLinkId);
    return { ok: true };
  },

  async resolveSharedHaiku(shareToken: string): Promise<
    | {
        ok: true;
        haiku: ReturnType<typeof haikuPayload>;
        remainingViews: number | null;
        permanent: boolean;
      }
    | { ok: false; reason: string }
  > {
    const row = await shareLinkRepository.findByShareHash(shareToken);
    if (!row) return { ok: false, reason: "Share link not found" };

    const now = new Date();
    if (row.expirationDate && row.expirationDate <= now) {
      return { ok: false, reason: "This share link has expired" };
    }

    if (row.maxViews != null && row.viewCount >= row.maxViews) {
      return { ok: false, reason: "This share link has reached its view limit" };
    }

    const updated = await prismaClient.$transaction(async (tx) => {
      const current = await tx.shareLink.findUnique({ where: { id: row.id } });
      if (!current) return null;
      if (current.expirationDate && current.expirationDate <= new Date()) return null;
      if (current.maxViews != null && current.viewCount >= current.maxViews) return null;

      return tx.shareLink.update({
        where: { id: row.id },
        data: { viewCount: { increment: 1 } },
      });
    });

    if (!updated) {
      return { ok: false, reason: "This share link is no longer available" };
    }

    const haikuRow = await haikuRepository.findFullById(row.sharedHaikuId);
    if (!haikuRow) {
      return { ok: false, reason: "Shared haiku no longer exists" };
    }

    const permanent = row.expirationDate == null && row.maxViews == null;
    const newCount = updated.viewCount;
    const remainingViews =
      row.maxViews != null ? Math.max(0, row.maxViews - newCount) : null;

    return {
      ok: true,
      haiku: haikuPayload(haikuRow),
      remainingViews,
      permanent,
    };
  },
};
