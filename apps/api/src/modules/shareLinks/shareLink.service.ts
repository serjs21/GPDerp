import { randomBytes } from "node:crypto";
import type { Prisma } from "../../generated/prisma";
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
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 50;

const resolveDisplayName = (createdBy: {
  userName: string | null;
  firstName: string;
  lastName: string;
  email: string;
}): string => {
  const userName = createdBy.userName?.trim();
  if (userName) return userName;

  const first = createdBy.firstName?.trim() ?? "";
  const last = createdBy.lastName?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  if (full) return full;

  const emailPrefix = createdBy.email?.split("@")[0]?.trim();
  return emailPrefix || "Unknown author";
};

export const shareLinkService = {
  async userCanAccessHaiku(userId: string, haikuId: string): Promise<boolean> {
    const haiku = await haikuRepository.findFullById(haikuId);
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

    const haiku = await haikuRepository.findFullById(haikuId);
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
      haikuSubject: haiku.title,
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

  async listShareLinksForUser(params: {
    userId: string;
    pageSize: number;
    offset: number;
    filter?: "active" | "inactive" | "expired" | "view_limit_reached";
    search?: string;
  }): Promise<{
    ok: true;
    items: Array<{
      id: string;
      shareHash: string;
      shareUrl: string;
      haikuSubject: string;
      createdAt: string;
      expirationDate: string | null;
      maxViews: number | null;
      viewCount: number;
    }>;
    total: number;
    pageSize: number;
    offset: number;
  }> {
    const pageSize = Math.max(1, Math.min(params.pageSize || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE));
    const offset = Math.max(0, params.offset || 0);
    const now = new Date();
    const where: Prisma.ShareLinkWhereInput = {};
    const search = params.search?.trim();
    if (search) {
      where.haikuSubject = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (params.filter === "active") {
      where.AND = [
        { OR: [{ expirationDate: null }, { expirationDate: { gt: now } }] },
        { OR: [{ maxViews: null }, { viewCount: { lt: prismaClient.shareLink.fields.maxViews } }] },
      ];
    } else if (params.filter === "inactive") {
      where.OR = [
        { expirationDate: { lte: now } },
        {
          AND: [{ maxViews: { not: null } }, { viewCount: { gte: prismaClient.shareLink.fields.maxViews } }],
        },
      ];
    } else if (params.filter === "expired") {
      where.expirationDate = { lte: now };
    } else if (params.filter === "view_limit_reached") {
      where.AND = [{ maxViews: { not: null } }, { viewCount: { gte: prismaClient.shareLink.fields.maxViews } }];
    }

    const [rows, total] = await Promise.all([
      shareLinkRepository.listForCreator({
        createdByUserId: params.userId,
        where,
        pageSize,
        offset,
      }),
      shareLinkRepository.countForCreator({
        createdByUserId: params.userId,
        where,
      }),
    ]);

    return {
      ok: true,
      items: rows.map((row) => ({
        id: row.id,
        shareHash: row.shareHash,
        shareUrl: `${env.WEB_APP_URL.replace(/\/$/, "")}/share/${row.shareHash}`,
        haikuSubject: row.haikuSubject,
        createdAt: row.createdAt.toISOString(),
        expirationDate: row.expirationDate ? row.expirationDate.toISOString() : null,
        maxViews: row.maxViews,
        viewCount: row.viewCount,
      })),
      total,
      pageSize,
      offset,
    };
  },

  async refreshShareLink(params: {
    userId: string;
    shareLinkId: string;
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
          viewCount: number;
        };
      }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_expiry" | "invalid_max_views" }
  > {
    const row = await shareLinkRepository.findById(params.shareLinkId);
    if (!row) return { ok: false, reason: "not_found" };
    if (row.createdByUserId !== params.userId) return { ok: false, reason: "forbidden" };

    if (params.expirationDate != null) {
      if (
        !(params.expirationDate instanceof Date) ||
        Number.isNaN(params.expirationDate.getTime()) ||
        params.expirationDate.getTime() <= Date.now()
      ) {
        return { ok: false, reason: "invalid_expiry" };
      }
    }
    if (params.maxViews != null && (!Number.isInteger(params.maxViews) || params.maxViews < 1)) {
      return { ok: false, reason: "invalid_max_views" };
    }

    const updated = await shareLinkRepository.refreshById({
      id: params.shareLinkId,
      expirationDate: params.expirationDate,
      maxViews: params.maxViews,
    });

    return {
      ok: true,
      shareLink: {
        id: updated.id,
        shareHash: updated.shareHash,
        shareUrl: `${env.WEB_APP_URL.replace(/\/$/, "")}/share/${updated.shareHash}`,
        expirationDate: updated.expirationDate ? updated.expirationDate.toISOString() : null,
        maxViews: updated.maxViews,
        viewCount: updated.viewCount,
      },
    };
  },

  async resolveSharedHaiku(shareToken: string): Promise<
    | {
        ok: true;
        haiku: ReturnType<typeof haikuPayload>;
        remainingViews: number | null;
        permanent: boolean;
        sharedByUserName: string;
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
      sharedByUserName: resolveDisplayName(row.createdBy),
    };
  },
};
