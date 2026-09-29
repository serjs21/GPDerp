import { prismaClient } from "../../lib/prisma";
import type { Prisma, ShareLinkDeactivationReason } from "../../generated/prisma";

const shareLinkSelect = {
  id: true,
  shareHash: true,
  createdAt: true,
  expirationDate: true,
  maxViews: true,
  viewCount: true,
  disabled: true,
  deactivationReason: true,
  showLabels: true,
  sharedHaikuId: true,
  haikuSubject: true,
} as const;

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
      select: shareLinkSelect,
    });
  },

  findById(id: string) {
    return prismaClient.shareLink.findUnique({
      where: { id },
    });
  },

  findBySharedHaikuId(sharedHaikuId: string) {
    return prismaClient.shareLink.findUnique({
      where: { sharedHaikuId },
      select: {
        ...shareLinkSelect,
        createdByUserId: true,
      },
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
        haikuSubject: true,
        expirationDate: true,
        maxViews: true,
        viewCount: true,
        disabled: true,
        deactivationReason: true,
        showLabels: true,
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
    offset?: number;
    pageSize?: number;
  }) {
    return prismaClient.shareLink.findMany({
      where: {
        createdByUserId: params.createdByUserId,
        ...(params.where ?? {}),
      },
      orderBy: { createdAt: "desc" },
      skip: params.offset,
      take: params.pageSize,
      select: shareLinkSelect,
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
      select: shareLinkSelect,
    });
  },

  updateDisabledById(params: {
    id: string;
    disabled: boolean;
    deactivationReason: ShareLinkDeactivationReason | null;
  }) {
    return prismaClient.shareLink.update({
      where: { id: params.id },
      data: {
        disabled: params.disabled,
        deactivationReason: params.deactivationReason,
      },
      select: shareLinkSelect,
    });
  },

  updateShowLabelsById(params: { id: string; showLabels: boolean }) {
    return prismaClient.shareLink.update({
      where: { id: params.id },
      data: { showLabels: params.showLabels },
      select: shareLinkSelect,
    });
  },

  markDeactivatedById(params: {
    id: string;
    deactivationReason: ShareLinkDeactivationReason;
  }) {
    return prismaClient.shareLink.update({
      where: { id: params.id },
      data: {
        disabled: true,
        deactivationReason: params.deactivationReason,
      },
      select: shareLinkSelect,
    });
  },
};
