import { GenerationPurchaseStatus, type Prisma } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";
import { isUniqueConstraintError } from "../../utils/prismaErrors";
import { GENERATION_PACK_CREDITS, GENERATION_PACK_PRODUCT_KEY } from "./constants";

export type SpendGenerationCreditResult =
  | { ok: true; creditsRemaining: number }
  | { ok: false; reason: "insufficient" | "not_found" };

export type FulfillCompletedPurchaseResult =
  | { status: "granted"; userId: string; credits: number }
  | { status: "duplicate" }
  | { status: "not_found" };

export async function trySpendGenerationCreditWithTx(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
): Promise<SpendGenerationCreditResult> {
  if (!Number.isInteger(amount) || amount < 1) {
    throw new Error("Credit spend amount must be a positive integer");
  }

  const claimed = await tx.user.updateMany({
    where: { id: userId, generationCredits: { gte: amount } },
    data: { generationCredits: { decrement: amount } },
  });
  if (claimed.count === 1) {
    const after = await tx.user.findUnique({
      where: { id: userId },
      select: { generationCredits: true },
    });
    return { ok: true, creditsRemaining: after!.generationCredits };
  }

  const exists = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!exists) return { ok: false, reason: "not_found" };
  return { ok: false, reason: "insufficient" };
}

const pendingPurchaseSelect = {
  id: true,
  userId: true,
  status: true,
  productKey: true,
  credits: true,
  paddleTransactionId: true,
  paddleEventId: true,
  createdAt: true,
  completedAt: true,
} as const;

export const paymentsRepository = {
  async getCredits(userId: string): Promise<number | null> {
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
      select: { generationCredits: true },
    });
    return user?.generationCredits ?? null;
  },

  /**
   * Atomically debit generation credits when the balance is high enough.
   * Safe under concurrent `/beer_me_haiku` requests.
   */
  trySpendGenerationCredit(userId: string, amount: number): Promise<SpendGenerationCreditResult> {
    return prismaClient.$transaction((tx) => trySpendGenerationCreditWithTx(tx, userId, amount));
  },

  createPendingPurchase(userId: string) {
    return prismaClient.generationPurchase.create({
      data: {
        userId,
        productKey: GENERATION_PACK_PRODUCT_KEY,
        credits: GENERATION_PACK_CREDITS,
        status: GenerationPurchaseStatus.PENDING,
      },
      select: pendingPurchaseSelect,
    });
  },

  findById(purchaseReference: string) {
    return prismaClient.generationPurchase.findUnique({
      where: { id: purchaseReference },
      select: pendingPurchaseSelect,
    });
  },

  async fulfillCompletedPurchase(params: {
    purchaseReference: string;
    paddleTransactionId: string;
    paddleEventId: string;
  }): Promise<FulfillCompletedPurchaseResult> {
    try {
      return await prismaClient.$transaction(async (tx) => {
        const byEvent = await tx.generationPurchase.findUnique({
          where: { paddleEventId: params.paddleEventId },
          select: { id: true },
        });
        if (byEvent) return { status: "duplicate" as const };

        const byTxn = await tx.generationPurchase.findUnique({
          where: { paddleTransactionId: params.paddleTransactionId },
          select: { id: true },
        });
        if (byTxn) return { status: "duplicate" as const };

        const purchase = await tx.generationPurchase.findUnique({
          where: { id: params.purchaseReference },
          select: { id: true, userId: true, status: true, credits: true },
        });
        if (!purchase) return { status: "not_found" as const };
        if (purchase.status === GenerationPurchaseStatus.COMPLETED) return { status: "duplicate" as const };

        const claimed = await tx.generationPurchase.updateMany({
          where: { id: purchase.id, status: GenerationPurchaseStatus.PENDING },
          data: {
            status: GenerationPurchaseStatus.COMPLETED,
            paddleTransactionId: params.paddleTransactionId,
            paddleEventId: params.paddleEventId,
            completedAt: new Date(),
          },
        });
        if (claimed.count !== 1) return { status: "duplicate" as const };

        await tx.user.update({
          where: { id: purchase.userId },
          data: { generationCredits: { increment: purchase.credits } },
        });
        const after = await tx.user.findUnique({
          where: { id: purchase.userId },
          select: { generationCredits: true },
        });
        return {
          status: "granted" as const,
          userId: purchase.userId,
          credits: after!.generationCredits,
        };
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) return { status: "duplicate" };
      throw error;
    }
  },
};
