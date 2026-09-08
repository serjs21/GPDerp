import { GenerationPurchaseStatus } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";
import { isUniqueConstraintError } from "../../utils/prismaErrors";

export const paymentsRepository = {
  async getCredits(userId: string): Promise<number | null> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { generationCredits: true },
    });
    return user?.generationCredits ?? null;
  },

  createPendingPurchase(userId: string, credits: number) {
    return prismaClient.generationPurchase.create({
      data: {
        userId,
        credits,
        status: GenerationPurchaseStatus.PENDING,
      },
      select: { id: true, credits: true },
    });
  },

  async fulfillCompletedPurchase(params: {
    purchaseReference: string;
    paddleTransactionId: string;
    paddleEventId: string;
  }): Promise<"granted" | "duplicate" | "not_found"> {
    try {
      return await prismaClient.$transaction(async (tx) => {
        const byEvent = await tx.generationPurchase.findUnique({
          where: { paddleEventId: params.paddleEventId },
          select: { id: true },
        });
        if (byEvent) return "duplicate";

        const byTxn = await tx.generationPurchase.findUnique({
          where: { paddleTransactionId: params.paddleTransactionId },
          select: { id: true },
        });
        if (byTxn) return "duplicate";

        const purchase = await tx.generationPurchase.findUnique({
          where: { id: params.purchaseReference },
          select: { id: true, userId: true, status: true, credits: true },
        });
        if (!purchase) return "not_found";
        if (purchase.status === GenerationPurchaseStatus.COMPLETED) return "duplicate";

        const claimed = await tx.generationPurchase.updateMany({
          where: { id: purchase.id, status: GenerationPurchaseStatus.PENDING },
          data: {
            status: GenerationPurchaseStatus.COMPLETED,
            paddleTransactionId: params.paddleTransactionId,
            paddleEventId: params.paddleEventId,
            completedAt: new Date(),
          },
        });
        if (claimed.count !== 1) return "duplicate";

        await tx.user.update({
          where: { id: purchase.userId },
          data: { generationCredits: { increment: purchase.credits } },
        });
        return "granted";
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) return "duplicate";
      throw error;
    }
  },
};
