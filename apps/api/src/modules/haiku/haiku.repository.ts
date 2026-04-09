import { prismaClient } from "../../lib/prisma";

const TITLE_MAX_LEN = 200;

export const haikuRepository = {
  async createFromGeneration(params: {
    accountId: string;
    createdById: string;
    subject: string;
    body: string;
  }) {
    const rawTitle = params.subject.trim() || "Haiku";
    const title = rawTitle.length > TITLE_MAX_LEN ? rawTitle.slice(0, TITLE_MAX_LEN) : rawTitle;

    const agg = await prismaClient.haiku.aggregate({
      where: { accountId: params.accountId, title },
      _max: { titleSuffix: true },
    });
    const titleSuffix = (agg._max.titleSuffix ?? -1) + 1;

    return prismaClient.haiku.create({
      data: {
        accountId: params.accountId,
        createdById: params.createdById,
        title,
        titleSuffix,
        body: params.body.trim(),
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
          },
        },
      },
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
