import { prismaClient } from "../../lib/prisma";

export const labelRepository = {
  listForAccount(accountId: string) {
    return prismaClient.label.findMany({
      where: { accountId },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        color: true,
        accountId: true,
        createdAt: true,
      },
    });
  },

  listForAccountPaged(accountId: string, take: number, skip: number) {
    return prismaClient.label.findMany({
      where: { accountId },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      take,
      skip,
      select: {
        id: true,
        name: true,
        color: true,
        accountId: true,
        createdAt: true,
      },
    });
  },

  countForAccount(accountId: string) {
    return prismaClient.label.count({ where: { accountId } });
  },

  createForAccount(accountId: string, name: string, color: string) {
    return prismaClient.label.create({
      data: {
        accountId,
        name,
        color,
      },
      select: {
        id: true,
        name: true,
        color: true,
        accountId: true,
        createdAt: true,
      },
    });
  },

  findById(id: string) {
    return prismaClient.label.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        color: true,
        accountId: true,
        createdAt: true,
      },
    });
  },

  updateById(id: string, data: { name: string; color: string }) {
    return prismaClient.label.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        color: true,
        accountId: true,
        createdAt: true,
      },
    });
  },

  deleteById(id: string) {
    return prismaClient.label.delete({
      where: { id },
    });
  },
};
