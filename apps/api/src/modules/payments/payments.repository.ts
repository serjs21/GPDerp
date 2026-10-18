import { GenerationPurchaseStatus } from "../../generated/prisma";
import { prismaClient } from "../../lib/prisma";
import { isUniqueConstraintError } from "../../utils/prismaErrors";
import {
  getGenerationCredits,
  grantGenerationCreditsWithTx,
  trySpendGenerationCreditsWithTx,
  type SpendGenerationCreditResult,
} from "../wallet/wallet.repository";
import { GENERATION_PACK_CREDITS, GENERATION_PACK_PRODUCT_KEY } from "./constants";

export type { SpendGenerationCreditResult } from "../wallet/wallet.repository";

export type FulfillCompletedPurchaseResult =
  | { status: "granted"; userId: string; credits: number }
  | { status: "duplicate" }
  | { status: "not_found" };

export type ConfirmationContext = {
  /** Already-stored copy; when set, the other fields are not computed. */
  confirmationMessage: string | null;
  /** 1-based position of this purchase among the user's completed purchases. */
  ordinal: number;
  /** Most recent stored copy from an earlier purchase. */
  previousMessage: string | null;
};

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
  getCredits(userId: string): Promise<number | null> {
    return getGenerationCredits(userId);
  },

  countCompletedPurchases(userId: string): Promise<number> {
    return prismaClient.generationPurchase.count({
      where: { userId, status: GenerationPurchaseStatus.COMPLETED },
    });
  },

  /** `null` unless the purchase exists and is COMPLETED. */
  async findConfirmationContext(purchaseId: string): Promise<ConfirmationContext | null> {
    const purchase = await prismaClient.generationPurchase.findUnique({
      where: { id: purchaseId },
      select: { userId: true, status: true, completedAt: true, confirmationMessage: true },
    });
    if (!purchase || purchase.status !== GenerationPurchaseStatus.COMPLETED || !purchase.completedAt) {
      return null;
    }
    if (purchase.confirmationMessage) {
      return { confirmationMessage: purchase.confirmationMessage, ordinal: 0, previousMessage: null };
    }

    const [ordinal, previous] = await Promise.all([
      prismaClient.generationPurchase.count({
        where: {
          userId: purchase.userId,
          status: GenerationPurchaseStatus.COMPLETED,
          completedAt: { lte: purchase.completedAt },
        },
      }),
      prismaClient.generationPurchase.findFirst({
        where: {
          userId: purchase.userId,
          id: { not: purchaseId },
          status: GenerationPurchaseStatus.COMPLETED,
          completedAt: { lte: purchase.completedAt },
          confirmationMessage: { not: null },
        },
        orderBy: { completedAt: "desc" },
        select: { confirmationMessage: true },
      }),
    ]);

    return {
      confirmationMessage: null,
      ordinal,
      previousMessage: previous?.confirmationMessage ?? null,
    };
  },

  /** First writer wins; returns whatever is stored afterwards. */
  async saveConfirmationMessage(purchaseId: string, message: string): Promise<string> {
    await prismaClient.generationPurchase.updateMany({
      where: { id: purchaseId, confirmationMessage: null },
      data: { confirmationMessage: message },
    });
    const stored = await prismaClient.generationPurchase.findUnique({
      where: { id: purchaseId },
      select: { confirmationMessage: true },
    });
    return stored?.confirmationMessage ?? message;
  },

  /**
   * Atomically debit generation credits when the balance is high enough.
   * Safe under concurrent `/beer_me_haiku` requests.
   */
  trySpendGenerationCredit(userId: string, amount: number): Promise<SpendGenerationCreditResult> {
    return prismaClient.$transaction((tx) => trySpendGenerationCreditsWithTx(tx, userId, amount));
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

        const credits = await grantGenerationCreditsWithTx(tx, purchase.userId, purchase.credits);
        return { status: "granted" as const, userId: purchase.userId, credits };
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) return { status: "duplicate" };
      throw error;
    }
  },
};
