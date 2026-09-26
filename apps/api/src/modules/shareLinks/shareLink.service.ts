import { randomBytes } from "node:crypto";
import type { Prisma, ShareLinkDeactivationReason } from "../../generated/prisma";
import { env } from "../../env";
import { prismaClient } from "../../lib/prisma";
import { isUniqueConstraintError } from "../../utils/prismaErrors";
import { authRepository } from "../auth/repository";
import { haikuRepository } from "../haiku/haiku.repository";
import { shareLinkRepository } from "./shareLink.repository";
import {
  sortShareLinkRows,
  type ShareLinkSortCategoryId,
  type ShareLinkSortDirection,
} from "./shareLinkSort";

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

type ShareLinkListRow = {
  id: string;
  shareHash: string;
  createdAt: Date;
  expirationDate: Date | null;
  maxViews: number | null;
  viewCount: number;
  disabled: boolean;
  deactivationReason?: ShareLinkDeactivationReason | null;
  haikuSubject: string;
  sharedHaikuId: string;
};

const isShareLinkExpired = (row: { expirationDate: Date | null }, now = new Date()) =>
  row.expirationDate != null && row.expirationDate <= now;

const isShareLinkViewLimitReached = (row: { maxViews: number | null; viewCount: number }) =>
  row.maxViews != null && row.viewCount >= row.maxViews;

const withinShareLinkLimits = (
  row: { expirationDate: Date | null; maxViews: number | null; viewCount: number },
  now = new Date(),
) => !isShareLinkExpired(row, now) && !isShareLinkViewLimitReached(row);

const resolveDeactivationReason = (
  row: ShareLinkListRow,
  now = new Date(),
): ShareLinkDeactivationReason | null => {
  if (row.deactivationReason) return row.deactivationReason;
  if (isShareLinkExpired(row, now)) return "timeout";
  if (isShareLinkViewLimitReached(row)) return "limit_reached";
  if (row.disabled) return "manual";
  return null;
};

export type ShareLinkListItem = ReturnType<typeof shareLinkItemFromRow>;

export type ShareLinkRealtimeSnapshot = {
  createdByUserId: string;
  shareLink: ShareLinkListItem;
};

const shareLinkItemFromRow = (row: ShareLinkListRow) => ({
  id: row.id,
  shareHash: row.shareHash,
  shareUrl: `${env.WEB_APP_URL.replace(/\/$/, "")}/share/${row.shareHash}`,
  sharedHaikuId: row.sharedHaikuId,
  haikuSubject: row.haikuSubject,
  createdAt: row.createdAt.toISOString(),
  expirationDate: row.expirationDate ? row.expirationDate.toISOString() : null,
  maxViews: row.maxViews,
  viewCount: row.viewCount,
  disabled: row.disabled,
  deactivationReason: resolveDeactivationReason(row),
});

const snapshotFromOwnerRow = (
  createdByUserId: string,
  row: ShareLinkListRow,
): ShareLinkRealtimeSnapshot => ({
  createdByUserId,
  shareLink: shareLinkItemFromRow(row),
});

export const shareLinkService = {
  async userCanAccessHaiku(userId: string, haikuId: string): Promise<boolean> {
    const haiku = await haikuRepository.findFullById(haikuId);
    if (!haiku) return false;
    const member = await authRepository.findAccountIdForUser(userId, haiku.accountId);
    return Boolean(member);
  },

  async getShareLinkForHaiku(params: {
    userId: string;
    haikuId: string;
  }): Promise<
    | { ok: true; shareLink: ReturnType<typeof shareLinkItemFromRow> | null }
    | { ok: false; reason: "not_found" | "forbidden" }
  > {
    const haiku = await haikuRepository.findFullById(params.haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    const allowed = await shareLinkService.userCanAccessHaiku(params.userId, params.haikuId);
    if (!allowed) return { ok: false, reason: "forbidden" };

    const row = await shareLinkRepository.findBySharedHaikuId(params.haikuId);
    if (!row) return { ok: true, shareLink: null };

    return { ok: true, shareLink: shareLinkItemFromRow(row) };
  },

  async createShareLink(params: {
    userId: string;
    haikuId: string;
    expirationDate: Date | null;
    maxViews: number | null;
  }): Promise<
    | {
        ok: true;
        created: boolean;
        shareLink: ReturnType<typeof shareLinkItemFromRow>;
      }
    | { ok: false; reason: "not_found" | "forbidden" | "invalid_expiry" | "invalid_max_views" }
  > {
    const { userId, haikuId, expirationDate, maxViews } = params;

    const haiku = await haikuRepository.findFullById(haikuId);
    if (!haiku) return { ok: false, reason: "not_found" };

    const allowed = await shareLinkService.userCanAccessHaiku(userId, haikuId);
    if (!allowed) return { ok: false, reason: "forbidden" };

    const existing = await shareLinkRepository.findBySharedHaikuId(haikuId);
    if (existing) {
      return { ok: true, created: false, shareLink: shareLinkItemFromRow(existing) };
    }

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
      const hashRow = await shareLinkRepository.findByShareHash(shareHash);
      if (!hashRow) break;
      shareHash = newShareHash();
    }

    try {
      const row = await shareLinkRepository.create({
        shareHash,
        createdByUserId: userId,
        sharedHaikuId: haikuId,
        haikuSubject: haiku.title,
        expirationDate,
        maxViews,
      });

      return {
        ok: true,
        created: true,
        shareLink: shareLinkItemFromRow(row),
      };
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error;
      const raced = await shareLinkRepository.findBySharedHaikuId(haikuId);
      if (!raced) throw error;
      return { ok: true, created: false, shareLink: shareLinkItemFromRow(raced) };
    }
  },

  async setShareLinkDisabled(params: {
    userId: string;
    shareLinkId: string;
    disabled: boolean;
  }): Promise<
    | { ok: true; shareLink: ReturnType<typeof shareLinkItemFromRow> }
    | { ok: false; reason: "not_found" | "forbidden" | "limits_reached" }
  > {
    const row = await shareLinkRepository.findById(params.shareLinkId);
    if (!row) return { ok: false, reason: "not_found" };
    if (row.createdByUserId !== params.userId) return { ok: false, reason: "forbidden" };

    if (!params.disabled && !withinShareLinkLimits(row)) {
      return { ok: false, reason: "limits_reached" };
    }

    const updated = await shareLinkRepository.updateDisabledById({
      id: params.shareLinkId,
      disabled: params.disabled,
      deactivationReason: params.disabled ? "manual" : null,
    });

    return { ok: true, shareLink: shareLinkItemFromRow(updated) };
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
    filters?: Array<"active" | "inactive" | "expired" | "view_limit_reached">;
    search?: string;
    sortCategoryId?: ShareLinkSortCategoryId | null;
    sortDirection?: ShareLinkSortDirection;
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
      disabled: boolean;
      deactivationReason: ShareLinkDeactivationReason | null;
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

    const ALL_FILTERS = ["active", "inactive", "expired", "view_limit_reached"] as const;
    const filters = [...new Set(params.filters ?? [])].filter((f) =>
      (ALL_FILTERS as readonly string[]).includes(f),
    ) as Array<(typeof ALL_FILTERS)[number]>;
    const applyStatusFilter = filters.length > 0 && filters.length < ALL_FILTERS.length;

    if (applyStatusFilter) {
      const statusOr: Prisma.ShareLinkWhereInput[] = [];

      if (filters.includes("active")) {
        statusOr.push({
          AND: [
            { disabled: false },
            { OR: [{ expirationDate: null }, { expirationDate: { gt: now } }] },
            {
              OR: [{ maxViews: null }, { viewCount: { lt: prismaClient.shareLink.fields.maxViews } }],
            },
          ],
        });
      }
      if (filters.includes("inactive")) {
        statusOr.push({
          AND: [
            { disabled: true },
            {
              OR: [{ deactivationReason: null }, { deactivationReason: "manual" }],
            },
          ],
        });
      }
      if (filters.includes("expired")) {
        statusOr.push({
          OR: [{ expirationDate: { lte: now } }, { deactivationReason: "timeout" }],
        });
      }
      if (filters.includes("view_limit_reached")) {
        statusOr.push({
          OR: [
            {
              AND: [
                { maxViews: { not: null } },
                { viewCount: { gte: prismaClient.shareLink.fields.maxViews } },
              ],
            },
            { deactivationReason: "limit_reached" },
          ],
        });
      }

      if (statusOr.length === 1) {
        Object.assign(where, statusOr[0]);
      } else if (statusOr.length > 1) {
        where.OR = statusOr;
      }
    }

    const rows = await shareLinkRepository.listForCreator({
      createdByUserId: params.userId,
      where,
    });

    const sorted = sortShareLinkRows(
      rows,
      {
        categoryId: params.sortCategoryId ?? null,
        direction: params.sortDirection ?? "asc",
      },
      now,
    );
    const total = sorted.length;
    const page = sorted.slice(offset, offset + pageSize);

    return {
      ok: true,
      items: page.map((row) => shareLinkItemFromRow(row)),
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
    | { ok: true; shareLink: ReturnType<typeof shareLinkItemFromRow> }
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
      shareLink: shareLinkItemFromRow(updated),
    };
  },

  async resolveSharedHaiku(shareToken: string): Promise<
    | {
        ok: true;
        haiku: ReturnType<typeof haikuPayload>;
        remainingViews: number | null;
        permanent: boolean;
        sharedByUserName: string;
        createdByUserId: string;
        shareLink: ShareLinkListItem;
      }
    | { ok: false; reason: string; createdByUserId?: string; shareLink?: ShareLinkListItem }
  > {
    const row = await shareLinkRepository.findByShareHash(shareToken);
    if (!row) return { ok: false, reason: "Share link not found" };

    if (row.disabled) {
      return { ok: false, reason: "This share link is disabled" };
    }

    const now = new Date();
    if (row.expirationDate && row.expirationDate <= now) {
      const deactivated = await shareLinkRepository.markDeactivatedById({
        id: row.id,
        deactivationReason: "timeout",
      });
      const snapshot = snapshotFromOwnerRow(row.createdByUserId, deactivated);
      return {
        ok: false,
        reason: "This share link has expired",
        createdByUserId: snapshot.createdByUserId,
        shareLink: snapshot.shareLink,
      };
    }

    if (row.maxViews != null && row.viewCount >= row.maxViews) {
      const deactivated = await shareLinkRepository.markDeactivatedById({
        id: row.id,
        deactivationReason: "limit_reached",
      });
      const snapshot = snapshotFromOwnerRow(row.createdByUserId, deactivated);
      return {
        ok: false,
        reason: "This share link has reached its view limit",
        createdByUserId: snapshot.createdByUserId,
        shareLink: snapshot.shareLink,
      };
    }

    const updated = await prismaClient.$transaction(async (tx) => {
      const current = await tx.shareLink.findUnique({ where: { id: row.id } });
      if (!current) return null;
      if (current.disabled) return null;
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
    let liveRow: ShareLinkListRow = {
      id: updated.id,
      shareHash: updated.shareHash,
      createdAt: updated.createdAt,
      expirationDate: updated.expirationDate,
      maxViews: updated.maxViews,
      viewCount: updated.viewCount,
      disabled: updated.disabled,
      deactivationReason: updated.deactivationReason,
      haikuSubject: updated.haikuSubject,
      sharedHaikuId: updated.sharedHaikuId,
    };
    const remainingViews =
      row.maxViews != null ? Math.max(0, row.maxViews - liveRow.viewCount) : null;

    if (row.maxViews != null && liveRow.viewCount >= row.maxViews) {
      liveRow = await shareLinkRepository.markDeactivatedById({
        id: row.id,
        deactivationReason: "limit_reached",
      });
    }

    const snapshot = snapshotFromOwnerRow(row.createdByUserId, liveRow);
    return {
      ok: true,
      haiku: haikuPayload(haikuRow),
      remainingViews,
      permanent,
      sharedByUserName: resolveDisplayName(row.createdBy),
      createdByUserId: snapshot.createdByUserId,
      shareLink: snapshot.shareLink,
    };
  },
};
