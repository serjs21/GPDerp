import axios from "axios";

export type PendingPurchaseResponse = {
  purchaseId: string;
};

export type CheckoutResponse = {
  purchaseId: string;
  transactionId: string;
  priceId: string;
  credits: number;
};

export type CreditsResponse = {
  credits: number;
};

export type ConfirmPurchaseResponse = {
  credits: number;
  status: "granted" | "duplicate" | "not_found";
};

export const GENERATION_CREDITS_UPDATED_EVENT = "generation-credits-updated";
export const GENERATION_PURCHASE_CONFIRMED_EVENT = "generation-purchase-confirmed";

export type GenerationCreditsUpdatedDetail = {
  credits: number;
};

export function notifyGenerationCreditsUpdated(credits: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<GenerationCreditsUpdatedDetail>(GENERATION_CREDITS_UPDATED_EVENT, {
      detail: { credits },
    }),
  );
}

export function notifyGenerationPurchaseConfirmed() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(GENERATION_PURCHASE_CONFIRMED_EVENT));
}

type PurchaseApiResponse = { ok: true; data: PendingPurchaseResponse } | { ok: false; error: string };
type CheckoutApiResponse =
  | {
      ok: true;
      data: {
        purchaseReference: string;
        transactionId: string;
        priceId: string;
        credits: number;
      };
    }
  | { ok: false; error: string };
type CreditsApiResponse = { ok: true; data: CreditsResponse } | { ok: false; error: string };
type ConfirmApiResponse = { ok: true; data: ConfirmPurchaseResponse } | { ok: false; error: string };

export async function createPendingPurchase(): Promise<PendingPurchaseResponse> {
  const { data } = await axios.post<PurchaseApiResponse>("/payments/purchase");
  if (!data.ok) throw new Error(data.error ?? "Failed to start purchase");
  return data.data;
}

export async function createCheckout(): Promise<CheckoutResponse> {
  const { data } = await axios.post<CheckoutApiResponse>("/payments/checkout", {});
  if (!data.ok) throw new Error(data.error ?? "Failed to start checkout");
  const transactionId = data.data.transactionId;
  if (typeof transactionId !== "string" || !transactionId.startsWith("txn_")) {
    throw new Error("Checkout did not return a Paddle transaction id");
  }
  return {
    purchaseId: data.data.purchaseReference,
    transactionId,
    priceId: data.data.priceId,
    credits: data.data.credits,
  };
}

export async function fetchCredits(): Promise<CreditsResponse> {
  const { data } = await axios.get<CreditsApiResponse>("/payments/credits");
  if (!data.ok) throw new Error(data.error ?? "Failed to load credits");
  return data.data;
}

export async function confirmPurchase(transactionId: string): Promise<ConfirmPurchaseResponse> {
  const { data } = await axios.post<ConfirmApiResponse>("/payments/confirm", { transactionId });
  if (!data.ok) throw new Error(data.error ?? "Failed to confirm purchase");
  return data.data;
}
