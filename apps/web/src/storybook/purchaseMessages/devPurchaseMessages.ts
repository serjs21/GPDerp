import { readInsufficientCreditsMessage } from "@/api/agents";
import { readConfirmPurchaseResponse, type ConfirmApiResponse } from "@/api/payments";

/** Proxied to the API by `.storybook/main.ts` (`STORYBOOK_API_URL`, default http://localhost:4000). */
export const DEV_PURCHASE_MESSAGES_URL = "/dev-api/dev/purchase-messages";

type DevPurchaseMessagesResponse = {
  ok: true;
  data: {
    noGenerationsLeft: Array<{ purchasesCount: number; response: unknown }>;
    purchaseConfirmed: Array<{ ordinal: number; response: ConfirmApiResponse }>;
    purchaseConfirmedFallback: ConfirmApiResponse;
  };
};

export type DevPurchaseMessage = {
  label: string;
  message: string;
};

export type DevPurchaseMessages =
  | {
      ok: true;
      noGenerationsLeft: DevPurchaseMessage[];
      purchaseConfirmed: DevPurchaseMessage[];
    }
  | { ok: false; error: string };

/** Storybook loader: fetches the API's written messages and parses them like the real flow does. */
export async function loadDevPurchaseMessages(): Promise<DevPurchaseMessages> {
  try {
    const res = await fetch(DEV_PURCHASE_MESSAGES_URL);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const { data } = (await res.json()) as DevPurchaseMessagesResponse;
    return {
      ok: true,
      noGenerationsLeft: data.noGenerationsLeft.map((item) => ({
        label: `${item.purchasesCount} purchases`,
        message: readInsufficientCreditsMessage(item.response) ?? "",
      })),
      purchaseConfirmed: [
        ...data.purchaseConfirmed.map((item) => ({
          label: `Purchase #${item.ordinal}`,
          message: readConfirmPurchaseResponse(item.response).message,
        })),
        {
          label: "Fallback",
          message: readConfirmPurchaseResponse(data.purchaseConfirmedFallback).message,
        },
      ],
    };
  } catch (error) {
    return {
      ok: false,
      error: `Could not load ${DEV_PURCHASE_MESSAGES_URL}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
