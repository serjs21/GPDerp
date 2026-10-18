import type { Prisma } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";
import { HAIKU_GENERATION_CREDIT_COST } from "../payments/constants";
import { trySpendGenerationCreditsWithTx } from "../wallet/wallet.repository";
import {
  haikuLabelLinkSelect,
  mapHaikuLabelLinks,
  pickLeastOccupiedLabelPlacement,
  type HaikuLinkedLabel,
} from "./haikuLabelPlacement";
import {
  DEFAULT_HAIKU_LIST_SORT,
  haikuListOrderBy,
  type HaikuListSort,
} from "./utils/haikuListSort";
import { HAIKU_TITLE_MAX_CHARS } from "../../consts/haiku";

const generationHaikuSelect = {
  id: true,
  title: true,
  titleSuffix: true,
  body: true,
  createdAt: true,
  accountId: true,
  createdById: true,
  haikuLabels: { select: haikuLabelLinkSelect },
} as const;

const fullHaikuSelect = {
  id: true,
  title: true,
  titleSuffix: true,
  body: true,
  createdAt: true,
  accountId: true,
  createdById: true,
  haikuLabels: { select: haikuLabelLinkSelect },
} as const;

type HaikuRowWithLinks = {
  id: string;
  title: string;
  titleSuffix: number;
  body: string;
  createdAt: Date;
  accountId: string;
  createdById: string;
  haikuLabels: Array<{
    connectionPointId: string;
    rotateDeg: number;
    xPercent: number;
    yPercent: number;
    label: { id: string; name: string; color: string; shape: string };
  }>;
};

function accountsHaikuWhere(accountIds: string[], q?: string): Prisma.HaikuWhereInput {
  const trimmed = q?.trim();
  return {
    accountId: { in: accountIds },
    ...(trimmed ? { title: { contains: trimmed, mode: "insensitive" as const } } : null),
  };
}

function toHaikuWithLabels<T extends HaikuRowWithLinks>(row: T): Omit<T, "haikuLabels"> & {
  labels: HaikuLinkedLabel[];
} {
  const { haikuLabels, ...rest } = row;
  return { ...rest, labels: mapHaikuLabelLinks(haikuLabels ?? []) };
}

export type GeneratedHaikuRow = {
  id: string;
  title: string;
  titleSuffix: number;
  body: string;
  createdAt: Date;
  accountId: string;
  createdById: string;
  labels: HaikuLinkedLabel[];
};

export type CreateFromGenerationResult =
  | { ok: true; haiku: GeneratedHaikuRow; creditsRemaining: number }
  | { ok: false; reason: "insufficient" | "not_found" };

export type LabelPlacementInput = {
  labelId: string;
  connectionPointId?: string;
  rotateDeg?: number;
  xPercent?: number;
  yPercent?: number;
};

export const haikuRepository = {
  async createFromGeneration(params: {
    accountId: string;
    createdById: string;
    subject: string;
    body: string;
  }): Promise<CreateFromGenerationResult> {
    const rawTitle = params.subject.trim() || "Haiku";
    const title =
      rawTitle.length > HAIKU_TITLE_MAX_CHARS
        ? rawTitle.slice(0, HAIKU_TITLE_MAX_CHARS).trimEnd()
        : rawTitle;

    return prismaClient.$transaction(async (tx) => {
      const spend = await trySpendGenerationCreditsWithTx(
        tx,
        params.createdById,
        HAIKU_GENERATION_CREDIT_COST,
      );
      if (!spend.ok) return spend;

      const agg = await tx.haiku.aggregate({
        where: { accountId: params.accountId, title },
        _max: { titleSuffix: true },
      });
      const titleSuffix = (agg._max.titleSuffix ?? -1) + 1;

      const haiku = await tx.haiku.create({
        data: {
          accountId: params.accountId,
          createdById: params.createdById,
          title,
          titleSuffix,
          body: params.body.trim(),
        },
        select: generationHaikuSelect,
      });

      return {
        ok: true as const,
        haiku: toHaikuWithLabels(haiku),
        creditsRemaining: spend.creditsRemaining,
      };
    });
  },

  async listForAccounts(
    accountIds: string[],
    take: number,
    skip: number,
    q?: string,
    sort: HaikuListSort = DEFAULT_HAIKU_LIST_SORT,
  ) {
    if (accountIds.length === 0) {
      return [];
    }
    const rows = await prismaClient.haiku.findMany({
      where: accountsHaikuWhere(accountIds, q),
      orderBy: haikuListOrderBy(sort),
      take,
      skip,
      select: fullHaikuSelect,
    });
    return rows.map(toHaikuWithLabels);
  },

  countForAccounts(accountIds: string[], q?: string) {
    if (accountIds.length === 0) {
      return Promise.resolve(0);
    }
    return prismaClient.haiku.count({
      where: accountsHaikuWhere(accountIds, q),
    });
  },

  async findById(id: string) {
    const row = await prismaClient.haiku.findUnique({
      where: { id },
      select: {
        id: true,
        accountId: true,
        createdById: true,
        haikuLabels: { select: haikuLabelLinkSelect },
      },
    });
    if (!row) return null;
    const { haikuLabels, ...rest } = row;
    return { ...rest, labels: mapHaikuLabelLinks(haikuLabels) };
  },

  /** Full row for API payloads (e.g. public share view). */
  async findFullById(id: string) {
    const row = await prismaClient.haiku.findUnique({
      where: { id },
      select: fullHaikuSelect,
    });
    return row ? toHaikuWithLabels(row) : null;
  },

  async findFullByIdsForAccounts(ids: string[], accountIds: string[]) {
    if (ids.length === 0 || accountIds.length === 0) {
      return [];
    }
    const rows = await prismaClient.haiku.findMany({
      where: {
        id: { in: ids },
        accountId: { in: accountIds },
      },
      select: fullHaikuSelect,
    });
    return rows.map(toHaikuWithLabels);
  },

  /**
   * Replace haiku↔label membership. Keeps placement for labels that remain;
   * assigns least-occupied free % for newly linked labels.
   */
  async setLabels(id: string, labelIds: string[]): Promise<{ id: string; labels: HaikuLinkedLabel[] }> {
    const uniqueIds = [...new Set(labelIds)];
    const existing = await prismaClient.haikuLabel.findMany({
      where: { haikuId: id },
      select: {
        labelId: true,
        connectionPointId: true,
        rotateDeg: true,
        xPercent: true,
        yPercent: true,
      },
    });
    const existingByLabel = new Map(existing.map((row) => [row.labelId, row]));
    const nextIds = new Set(uniqueIds);
    const toDelete = existing.filter((row) => !nextIds.has(row.labelId)).map((row) => row.labelId);
    const toCreate = uniqueIds.filter((labelId) => !existingByLabel.has(labelId));

    const occupiedCenters = uniqueIds
      .map((labelId) => existingByLabel.get(labelId))
      .filter((row): row is NonNullable<typeof row> => Boolean(row))
      .map((row) => ({ xPercent: row.xPercent, yPercent: row.yPercent }));

    await prismaClient.$transaction(async (tx) => {
      if (toDelete.length > 0) {
        await tx.haikuLabel.deleteMany({
          where: { haikuId: id, labelId: { in: toDelete } },
        });
      }
      for (const labelId of toCreate) {
        const placement = pickLeastOccupiedLabelPlacement(occupiedCenters);
        occupiedCenters.push({
          xPercent: placement.xPercent,
          yPercent: placement.yPercent,
        });
        await tx.haikuLabel.create({
          data: {
            haikuId: id,
            labelId,
            connectionPointId: placement.connectionPointId,
            rotateDeg: placement.rotateDeg,
            xPercent: placement.xPercent,
            yPercent: placement.yPercent,
          },
        });
      }
    });

    const rows = await prismaClient.haikuLabel.findMany({
      where: { haikuId: id },
      select: haikuLabelLinkSelect,
    });
    return { id, labels: mapHaikuLabelLinks(rows) };
  },

  /** Update placement for one linked label (focus-out / drag commit). */
  async updateLabelPlacement(
    haikuId: string,
    labelId: string,
    placement: {
      connectionPointId?: string;
      rotateDeg: number;
      xPercent: number;
      yPercent: number;
    },
  ): Promise<HaikuLinkedLabel | null> {
    try {
      const row = await prismaClient.haikuLabel.update({
        where: { haikuId_labelId: { haikuId, labelId } },
        data: {
          ...(placement.connectionPointId != null
            ? { connectionPointId: placement.connectionPointId }
            : {}),
          rotateDeg: placement.rotateDeg,
          xPercent: placement.xPercent,
          yPercent: placement.yPercent,
        },
        select: haikuLabelLinkSelect,
      });
      return mapHaikuLabelLinks([row])[0] ?? null;
    } catch {
      return null;
    }
  },

  deleteById(id: string) {
    return prismaClient.haiku.delete({
      where: { id },
    });
  },
};
