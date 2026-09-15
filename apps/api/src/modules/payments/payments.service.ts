import { EventName, type EventEntity, type TransactionNotification } from "@paddle/paddle-node-sdk";
import { env } from "../../env";
import { isUuid } from "../../utils/uuid";
import { PURCHASE_REFERENCE_CUSTOM_DATA_KEY } from "./constants";
import { getPaddle } from "./paddleWebhook";
import { paymentsRepository } from "./payments.repository";

const PAID_STATUSES = new Set(["paid", "completed"]);

const readPurchaseReference = (customData: unknown): string | null => {
  if (!customData || typeof customData !== "object") return null;
  const value = (customData as Record<string, unknown>)[PURCHASE_REFERENCE_CUSTOM_DATA_KEY];
  return typeof value === "string" && isUuid(value) ? value : null;
};

const transactionHasExpectedPrice = (
  items: Array<{ price?: { id?: string | null } | null }>,
  priceId: string,
) => items.some((item) => item.price?.id === priceId);

export const paymentsService = {
  createPendingPurchaseForUser(userId: string) {
    return paymentsRepository.createPendingPurchase(userId);
  },

  findPurchaseByReference(purchaseReference: string) {
    if (!isUuid(purchaseReference)) return Promise.resolve(null);
    return paymentsRepository.findById(purchaseReference);
  },

  async createCheckout(userId: string) {
    const purchase = await paymentsService.createPendingPurchaseForUser(userId);
    const transaction = await getPaddle().transactions.create({
      items: [{ priceId: env.PADDLE_PRICE_ID_100_HAIKUS, quantity: 1 }],
      customData: { [PURCHASE_REFERENCE_CUSTOM_DATA_KEY]: purchase.id },
    });
    if (!transaction?.id?.startsWith("txn_")) {
      throw new Error("Paddle did not return a transaction id");
    }
    return {
      purchaseReference: purchase.id,
      transactionId: transaction.id,
      priceId: env.PADDLE_PRICE_ID_100_HAIKUS,
      credits: purchase.credits,
      checkoutUrl: transaction.checkout?.url ?? null,
    };
  },

  async getCredits(userId: string) {
    const credits = await paymentsRepository.getCredits(userId);
    if (credits === null) return { ok: false as const, reason: "not_found" as const };
    return { ok: true as const, credits };
  },

  /**
   * Client-side completion path: verify the Paddle transaction server-side and grant credits.
   * Complements webhooks so the UI can refresh immediately after overlay checkout.
   */
  async confirmCompletedCheckout(userId: string, transactionId: string) {
    const trimmed = transactionId.trim();
    if (!trimmed.startsWith("txn_")) {
      return { ok: false as const, reason: "invalid_transaction" as const };
    }

    const transaction = await getPaddle().transactions.get(trimmed);
    if (!PAID_STATUSES.has(transaction.status)) {
      return { ok: false as const, reason: "not_paid" as const };
    }
    if (!transactionHasExpectedPrice(transaction.items, env.PADDLE_PRICE_ID_100_HAIKUS)) {
      return { ok: false as const, reason: "price_mismatch" as const };
    }

    const purchaseReference = readPurchaseReference(transaction.customData);
    if (!purchaseReference) {
      return { ok: false as const, reason: "missing_reference" as const };
    }

    const purchase = await paymentsRepository.findById(purchaseReference);
    if (!purchase || purchase.userId !== userId) {
      return { ok: false as const, reason: "not_found" as const };
    }

    const result = await paymentsRepository.fulfillCompletedPurchase({
      purchaseReference,
      paddleTransactionId: transaction.id,
      // Client confirm has no webhook event id; reuse transaction id for idempotency.
      paddleEventId: `client-confirm:${transaction.id}`,
    });

    const credits = await paymentsRepository.getCredits(userId);
    if (credits === null) return { ok: false as const, reason: "not_found" as const };

    return { ok: true as const, status: result, credits };
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

    if (!transactionHasExpectedPrice(transaction.items, env.PADDLE_PRICE_ID_100_HAIKUS)) {
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
