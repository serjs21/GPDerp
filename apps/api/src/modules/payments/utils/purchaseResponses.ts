import { noGenerationsLeftMessage } from "./purchaseMessages";

export type ConfirmPurchaseStatus = "granted" | "duplicate" | "not_found";

/** 402 body for `POST /beer_me_haiku` when the user has no generation credits. */
export function insufficientCreditsBody(purchasesCount: number) {
  return {
    ok: false as const,
    error: "insufficient_credits" as const,
    message: noGenerationsLeftMessage(purchasesCount),
  };
}

/** Success body for `POST /payments/confirm`. */
export function confirmPurchaseBody(params: {
  credits: number;
  status: ConfirmPurchaseStatus;
  message: string;
}) {
  return {
    ok: true as const,
    data: { credits: params.credits, status: params.status, message: params.message },
  };
}
