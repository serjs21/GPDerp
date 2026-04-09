import { prismaClient } from "../../lib/prisma";

export const shareLinkRepository = {
  create(data: {
    shareHash: string;
    createdByUserId: string;
    sharedHaikuId: string;
    expirationDate: Date | null;
    maxViews: number | null;
  }) {
    return prismaClient.shareLink.create({
      data: {
        shareHash: data.shareHash,
        createdByUserId: data.createdByUserId,
        sharedHaikuId: data.sharedHaikuId,
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
        sharedHaikuId: true,
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
    });
  },

  deleteById(id: string) {
    return prismaClient.shareLink.delete({
      where: { id },
    });
  },
};
