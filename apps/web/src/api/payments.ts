import axios from "axios";

export type PendingPurchaseResponse = {
  purchaseId: string;
};

export type CreditsResponse = {
  credits: number;
};

type PurchaseApiResponse = { ok: true; data: PendingPurchaseResponse } | { ok: false; error: string };
type CreditsApiResponse = { ok: true; data: CreditsResponse } | { ok: false; error: string };

export async function createPendingPurchase(): Promise<PendingPurchaseResponse> {
  const { data } = await axios.post<PurchaseApiResponse>("/payments/purchase");
  if (!data.ok) throw new Error(data.error ?? "Failed to start purchase");
  return data.data;
}

export async function fetchCredits(): Promise<CreditsResponse> {
  const { data } = await axios.get<CreditsApiResponse>("/payments/credits");
  if (!data.ok) throw new Error(data.error ?? "Failed to load credits");
  return data.data;
}
