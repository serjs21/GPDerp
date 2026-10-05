/**
 * Copy shown in the web NoGenerationsLeftModal / PurchaseConfirmModal,
 * picked by how many completed purchases the user has.
 * Placeholders — final copy pending.
 */

export function noGenerationsLeftMessage(purchasesCount: number): string {
  if (purchasesCount <= 0) return "TODO: no generations left (0 purchases)";
  if (purchasesCount === 1) return "TODO: no generations left (1 purchase)";
  return "TODO: no generations left (2+ purchases)";
}

/** `purchasesCount` includes the purchase that was just confirmed. */
export function purchaseConfirmedMessage(purchasesCount: number): string {
  if (purchasesCount <= 1) return "TODO: purchase confirmed (first purchase)";
  if (purchasesCount === 2) return "TODO: purchase confirmed (second purchase)";
  return "TODO: purchase confirmed (3+ purchases)";
}
