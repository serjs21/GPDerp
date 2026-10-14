import type { Paddle, PaddleEventData } from "@paddle/paddle-js";
import { loadPaddleSdk } from "./loadPaddleSdk";
import { PADDLE_CHECKOUT_LOADED_EVENT } from "./openPaddleCheckoutWithFallback";
import type { PaddleClientEnvironment } from "./paddleClientEnv";

export const PADDLE_CHECKOUT_COMPLETED_EVENT = "paddle:checkout-completed";

export type PaddleCheckoutCompletedDetail = {
  transactionId: string;
};

const readTransactionId = (event: PaddleEventData): string | null => {
  const id = event.data?.transaction_id ?? event.data?.id;
  return typeof id === "string" && id.startsWith("txn_") ? id : null;
};

/** Downloads Paddle.js (same-origin proxy) and the wrapper, then initializes the client. */
export async function initPaddleClient(
  token: string,
  environment: PaddleClientEnvironment,
): Promise<Paddle | null> {
  await loadPaddleSdk();
  const { CheckoutEventNames, initializePaddle } = await import("@paddle/paddle-js");
  const instance = await initializePaddle({
    token,
    environment,
    eventCallback: (event) => {
      if (event.name === CheckoutEventNames.CHECKOUT_LOADED) {
        window.dispatchEvent(new CustomEvent(PADDLE_CHECKOUT_LOADED_EVENT));
      }

      if (event.name !== CheckoutEventNames.CHECKOUT_COMPLETED) return;
      const transactionId = readTransactionId(event);
      if (!transactionId) return;
      window.dispatchEvent(
        new CustomEvent<PaddleCheckoutCompletedDetail>(PADDLE_CHECKOUT_COMPLETED_EVENT, {
          detail: { transactionId },
        }),
      );
    },
  });
  return instance ?? null;
}
