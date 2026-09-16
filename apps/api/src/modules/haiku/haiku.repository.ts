import { prismaClient } from "../../lib/prisma";
import { HAIKU_GENERATION_CREDIT_COST } from "../payments/constants";
import { trySpendGenerationCreditWithTx } from "../payments/payments.repository";

const TITLE_MAX_LEN = 200;

const generationHaikuSelect = {
  id: true,
  title: true,
  titleSuffix: true,
  body: true,
  createdAt: true,
  accountId: true,
  createdById: true,
  labels: {
    select: {
      id: true,
      name: true,
      color: true,
      shape: true,
    },
  },
} as const;

export type GeneratedHaikuRow = {
  id: string;
  title: string;
  titleSuffix: number;
  body: string;
  createdAt: Date;
  accountId: string;
  createdById: string;
  labels: Array<{ id: string; name: string; color: string; shape: string }>;
};

export type CreateFromGenerationResult =
  | { ok: true; haiku: GeneratedHaikuRow; creditsRemaining: number }
  | { ok: false; reason: "insufficient" | "not_found" };

export const haikuRepository = {
  async createFromGeneration(params: {
    accountId: string;
    createdById: string;
    subject: string;
    body: string;
  }): Promise<CreateFromGenerationResult> {
    const rawTitle = params.subject.trim() || "Haiku";
    const title = rawTitle.length > TITLE_MAX_LEN ? rawTitle.slice(0, TITLE_MAX_LEN) : rawTitle;

    return prismaClient.$transaction(async (tx) => {
      const spend = await trySpendGenerationCreditWithTx(
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

      return { ok: true as const, haiku, creditsRemaining: spend.creditsRemaining };
    });
  },

  listForAccounts(accountIds: string[], take: number, skip: number) {
    if (accountIds.length === 0) {
      return Promise.resolve([]);
    }
    return prismaClient.haiku.findMany({
      where: { accountId: { in: accountIds } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
      select: {
        id: true,
        title: true,
        titleSuffix: true,
        body: true,
        createdAt: true,
        accountId: true,
        createdById: true,
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
            shape: true,
          },
        },
      },
    });
  },

  countForAccounts(accountIds: string[]) {
    if (accountIds.length === 0) {
      return Promise.resolve(0);
    }
    return prismaClient.haiku.count({
      where: { accountId: { in: accountIds } },
    });
  },

  findById(id: string) {
    return prismaClient.haiku.findUnique({
      where: { id },
      select: {
        id: true,
        accountId: true,
        createdById: true,
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
            shape: true,
          },
        },
      },
    });
  },

  /** Full row for API payloads (e.g. public share view). */
  findFullById(id: string) {
    return prismaClient.haiku.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        titleSuffix: true,
        body: true,
        createdAt: true,
        accountId: true,
        createdById: true,
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
            shape: true,
          },
        },
      },
    });
  },

  findFullByIdsForAccounts(ids: string[], accountIds: string[]) {
    if (ids.length === 0 || accountIds.length === 0) {
      return Promise.resolve([]);
    }
    return prismaClient.haiku.findMany({
      where: {
        id: { in: ids },
        accountId: { in: accountIds },
      },
      select: {
        id: true,
        title: true,
        titleSuffix: true,
        body: true,
        createdAt: true,
        accountId: true,
        createdById: true,
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
            shape: true,
          },
        },
      },
    });
  },

  setLabels(id: string, labelIds: string[]) {
    return prismaClient.haiku.update({
      where: { id },
      data: {
        labels: {
          set: labelIds.map((labelId) => ({ id: labelId })),
        },
      },
      select: {
        id: true,
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
            shape: true,
          },
        },
      },
    });
  },

  deleteById(id: string) {
    return prismaClient.haiku.delete({
      where: { id },
    });
  },
};
