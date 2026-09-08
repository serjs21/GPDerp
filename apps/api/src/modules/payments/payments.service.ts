import { EventName, type EventEntity, type TransactionNotification } from "@paddle/paddle-node-sdk";
import { env } from "../../env";
import { isUuid } from "../../utils/uuid";
import { GENERATION_PACK_CREDITS, PURCHASE_REFERENCE_CUSTOM_DATA_KEY } from "./constants";
import { paymentsRepository } from "./payments.repository";

const readPurchaseReference = (customData: unknown): string | null => {
  if (!customData || typeof customData !== "object") return null;
  const value = (customData as Record<string, unknown>)[PURCHASE_REFERENCE_CUSTOM_DATA_KEY];
  return typeof value === "string" && isUuid(value) ? value : null;
};

const transactionHasExpectedPrice = (transaction: TransactionNotification, priceId: string) =>
  transaction.items.some((item) => item.price?.id === priceId);

export const paymentsService = {
  async createCheckout(userId: string) {
    const purchase = await paymentsRepository.createPendingPurchase(userId, GENERATION_PACK_CREDITS);
    return {
      purchaseReference: purchase.id,
      priceId: env.PADDLE_PRICE_ID,
      credits: purchase.credits,
    };
  },

  async getCredits(userId: string) {
    const credits = await paymentsRepository.getCredits(userId);
    if (credits === null) return { ok: false as const, reason: "not_found" as const };
    return { ok: true as const, credits };
  },

  async handleVerifiedEvent(event: EventEntity) {
    if (event.eventType !== EventName.TransactionCompleted) {
      return { status: "ignored" as const };
    }

    const transaction = event.data as TransactionNotification;
    const purchaseReference = readPurchaseReference(transaction.customData);
    if (!purchaseReference) {
      return { status: "ignored" as const, reason: "missing_reference" as const };
    }

    if (!transactionHasExpectedPrice(transaction, env.PADDLE_PRICE_ID)) {
      return { status: "ignored" as const, reason: "price_mismatch" as const };
    }

    const result = await paymentsRepository.fulfillCompletedPurchase({
      purchaseReference,
      paddleTransactionId: transaction.id,
      paddleEventId: event.eventId,
    });
    return { status: result };
  },
};
