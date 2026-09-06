import { prismaClient } from "../../lib/prisma";

const labelSelect = {
  id: true,
  name: true,
  color: true,
  shape: true,
  accountId: true,
  createdAt: true,
} as const;

export const labelRepository = {
  listForAccount(accountId: string) {
    return prismaClient.label.findMany({
      where: { accountId },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: labelSelect,
    });
  },

  listForAccountPaged(accountId: string, take: number, skip: number) {
    return prismaClient.label.findMany({
      where: { accountId },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      take,
      skip,
      select: labelSelect,
    });
  },

  countForAccount(accountId: string) {
    return prismaClient.label.count({ where: { accountId } });
  },

  createForAccount(accountId: string, name: string, color: string, shape: string) {
    return prismaClient.label.create({
      data: {
        accountId,
        name,
        color,
        shape,
      },
      select: labelSelect,
    });
  },

  findById(id: string) {
    return prismaClient.label.findUnique({
      where: { id },
      select: labelSelect,
    });
  },

  updateById(id: string, data: { name: string; color: string; shape: string }) {
    return prismaClient.label.update({
      where: { id },
      data,
      select: labelSelect,
    });
  },

  deleteById(id: string) {
    return prismaClient.label.delete({
      where: { id },
    });
  },
};
