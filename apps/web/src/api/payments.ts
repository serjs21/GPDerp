import axios from "axios";

export type CheckoutResponse = {
  purchaseReference: string;
  priceId: string;
  credits: number;
};

export type CreditsResponse = {
  credits: number;
};

type CheckoutApiResponse = { ok: true; data: CheckoutResponse } | { ok: false; error: string };
type CreditsApiResponse = { ok: true; data: CreditsResponse } | { ok: false; error: string };

export async function createCheckout(): Promise<CheckoutResponse> {
  const { data } = await axios.post<CheckoutApiResponse>("/payments/checkout");
  if (!data.ok) throw new Error(data.error ?? "Failed to start checkout");
  return data.data;
}

export async function fetchCredits(): Promise<CreditsResponse> {
  const { data } = await axios.get<CreditsApiResponse>("/payments/credits");
  if (!data.ok) throw new Error(data.error ?? "Failed to load credits");
  return data.data;
}
