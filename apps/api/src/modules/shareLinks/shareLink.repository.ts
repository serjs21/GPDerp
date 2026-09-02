import { prismaClient } from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma";

export const shareLinkRepository = {
  create(data: {
    shareHash: string;
    createdByUserId: string;
    sharedHaikuId: string;
    haikuSubject: string;
    expirationDate: Date | null;
    maxViews: number | null;
  }) {
    return prismaClient.shareLink.create({
      data: {
        shareHash: data.shareHash,
        createdByUserId: data.createdByUserId,
        sharedHaikuId: data.sharedHaikuId,
        haikuSubject: data.haikuSubject,
        expirationDate: data.expirationDate,
        maxViews: data.maxViews,
      },
      select: {
        id: true,
        shareHash: true,
        createdAt: true,
        expirationDate: true,
        maxViews: true,
        viewCount: true,
        disabled: true,
        sharedHaikuId: true,
        haikuSubject: true,
      },
    });
  },

  findById(id: string) {
    return prismaClient.shareLink.findUnique({
      where: { id },
    });
  },

  findByShareHash(shareHash: string) {
    return prismaClient.shareLink.findUnique({
      where: { shareHash },
      select: {
        id: true,
        shareHash: true,
        createdByUserId: true,
        sharedHaikuId: true,
        expirationDate: true,
        maxViews: true,
        viewCount: true,
        disabled: true,
        createdAt: true,
        createdBy: {
          select: {
            userName: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  deleteById(id: string) {
    return prismaClient.shareLink.delete({
      where: { id },
    });
  },

  listForCreator(params: {
    createdByUserId: string;
    where?: Prisma.ShareLinkWhereInput;
    offset: number;
    pageSize: number;
  }) {
    return prismaClient.shareLink.findMany({
      where: {
        createdByUserId: params.createdByUserId,
        ...(params.where ?? {}),
      },
      orderBy: { createdAt: "desc" },
      skip: params.offset,
      take: params.pageSize,
      select: {
        id: true,
        shareHash: true,
        createdAt: true,
        expirationDate: true,
        maxViews: true,
        viewCount: true,
        disabled: true,
        haikuSubject: true,
      },
    });
  },

  countForCreator(params: {
    createdByUserId: string;
    where?: Prisma.ShareLinkWhereInput;
  }) {
    return prismaClient.shareLink.count({
      where: {
        createdByUserId: params.createdByUserId,
        ...(params.where ?? {}),
      },
    });
  },

  refreshById(params: {
    id: string;
    expirationDate: Date | null;
    maxViews: number | null;
  }) {
    return prismaClient.shareLink.update({
      where: { id: params.id },
      data: {
        expirationDate: params.expirationDate,
        maxViews: params.maxViews,
        viewCount: 0,
      },
      select: {
        id: true,
        shareHash: true,
        createdAt: true,
        expirationDate: true,
        maxViews: true,
        viewCount: true,
        disabled: true,
        haikuSubject: true,
      },
    });
  },

  updateDisabledById(params: { id: string; disabled: boolean }) {
    return prismaClient.shareLink.update({
      where: { id: params.id },
      data: { disabled: params.disabled },
      select: {
        id: true,
        shareHash: true,
        createdAt: true,
        expirationDate: true,
        maxViews: true,
        viewCount: true,
        disabled: true,
        haikuSubject: true,
      },
    });
  },
};
