import type { Prisma } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";

const labelSelect = {
  id: true,
  name: true,
  color: true,
  shape: true,
  accountId: true,
  createdAt: true,
} as const;

function accountLabelWhere(accountId: string, q?: string): Prisma.LabelWhereInput {
  const trimmed = q?.trim();
  return {
    accountId,
    ...(trimmed
      ? { name: { contains: trimmed, mode: "insensitive" as const } }
      : null),
  };
}

export const labelRepository = {
  listForAccount(accountId: string) {
    return prismaClient.label.findMany({
      where: { accountId },
      orderBy: [{ name: "asc" }, { createdAt: "desc" }],
      select: labelSelect,
    });
  },

  listForAccountPaged(accountId: string, take: number, skip: number, q?: string) {
    return prismaClient.label.findMany({
      where: accountLabelWhere(accountId, q),
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      take,
      skip,
      select: labelSelect,
    });
  },

  countForAccount(accountId: string, q?: string) {
    return prismaClient.label.count({ where: accountLabelWhere(accountId, q) });
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

  listConnectedHaikus(labelId: string, take: number) {
    return prismaClient.label.findUnique({
      where: { id: labelId },
      select: {
        accountId: true,
        _count: { select: { haikus: true } },
        haikus: {
          take,
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, body: true },
        },
      },
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
