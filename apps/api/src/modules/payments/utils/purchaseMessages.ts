import { PURCHASE_MESSAGES } from "../constants";

const NO_GENERATIONS_LEFT_LAST_INDEX = Object.keys(PURCHASE_MESSAGES.noGenerationsLeft).length - 1;
export const STATIC_PURCHASE_CONFIRMED_COUNT = Object.keys(PURCHASE_MESSAGES.purchaseConfirmed).length;

/** Copy for the web NoGenerationsLeftModal; repeats the last entry once the user has bought that many times. */
export function noGenerationsLeftMessage(purchasesCount: number): string {
  const index = Math.min(Math.max(Math.trunc(purchasesCount), 0), NO_GENERATIONS_LEFT_LAST_INDEX);
  return PURCHASE_MESSAGES.noGenerationsLeft[String(index)];
}

/**
 * Hand-written confirmation for the user's `ordinal`-th purchase (1-based),
 * or `null` once the written sequence runs out.
 */
export function staticPurchaseConfirmedMessage(ordinal: number): string | null {
  if (!Number.isInteger(ordinal) || ordinal < 1 || ordinal > STATIC_PURCHASE_CONFIRMED_COUNT) return null;
  return PURCHASE_MESSAGES.purchaseConfirmed[String(ordinal - 1)];
}

/** Last hand-written confirmation; seeds generation when no earlier message is stored. */
export function lastStaticPurchaseConfirmedMessage(): string {
  return PURCHASE_MESSAGES.purchaseConfirmed[String(STATIC_PURCHASE_CONFIRMED_COUNT - 1)];
}
