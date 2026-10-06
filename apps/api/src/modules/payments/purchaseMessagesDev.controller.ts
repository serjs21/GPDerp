import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { GENERATION_PACK_CREDITS, PURCHASE_CONFIRMED_FALLBACK_MESSAGE } from "./constants";
import {
  NO_GENERATIONS_LEFT_MESSAGE_COUNT,
  STATIC_PURCHASE_CONFIRMED_COUNT,
  staticPurchaseConfirmedMessage,
} from "./utils/purchaseMessages";
import { confirmPurchaseBody, insufficientCreditsBody } from "./utils/purchaseResponses";

export const isPurchaseMessagesDevRouteEnabled = (env: NodeJS.ProcessEnv = process.env) =>
  env.NODE_ENV !== "production";

/**
 * Dev-only preview of every written purchase message, shaped exactly like the
 * `POST /beer_me_haiku` 402 body and the `POST /payments/confirm` body.
 * No auth, no DB, no model calls.
 */
export function buildPurchaseMessagesPreview() {
  return {
    noGenerationsLeft: Array.from({ length: NO_GENERATIONS_LEFT_MESSAGE_COUNT }, (_, purchasesCount) => ({
      purchasesCount,
      response: insufficientCreditsBody(purchasesCount),
    })),
    purchaseConfirmed: Array.from({ length: STATIC_PURCHASE_CONFIRMED_COUNT }, (_, index) => {
      const ordinal = index + 1;
      return {
        ordinal,
        response: confirmPurchaseBody({
          credits: GENERATION_PACK_CREDITS,
          status: "granted",
          message: staticPurchaseConfirmedMessage(ordinal)!,
        }),
      };
    }),
    purchaseConfirmedFallback: confirmPurchaseBody({
      credits: GENERATION_PACK_CREDITS,
      status: "granted",
      message: PURCHASE_CONFIRMED_FALLBACK_MESSAGE,
    }),
  };
}

const purchaseMessagesDevPluginImpl = async (app: FastifyInstance) => {
  app.get("/dev/purchase-messages", async (_req, res) =>
    res.send({ ok: true, data: buildPurchaseMessagesPreview() }),
  );
};

export const purchaseMessagesDevPlugin = fp(purchaseMessagesDevPluginImpl);
