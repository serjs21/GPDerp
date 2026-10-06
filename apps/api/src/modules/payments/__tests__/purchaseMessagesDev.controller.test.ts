import Fastify from "fastify";
import { PURCHASE_CONFIRMED_FALLBACK_MESSAGE, PURCHASE_MESSAGES } from "../constants";
import {
  isPurchaseMessagesDevRouteEnabled,
  purchaseMessagesDevPlugin,
} from "../purchaseMessagesDev.controller";

describe("GET /dev/purchase-messages", () => {
  it("returns every written message shaped like the real responses", async () => {
    const app = Fastify();
    await app.register(purchaseMessagesDevPlugin);

    const response = await app.inject({ method: "GET", url: "/dev/purchase-messages" });
    expect(response.statusCode).toBe(200);
    const { data } = response.json();

    expect(data.noGenerationsLeft).toHaveLength(5);
    expect(data.noGenerationsLeft[0]).toEqual({
      purchasesCount: 0,
      response: {
        ok: false,
        error: "insufficient_credits",
        message: PURCHASE_MESSAGES.noGenerationsLeft["0"],
      },
    });

    expect(data.purchaseConfirmed).toHaveLength(20);
    expect(data.purchaseConfirmed[19]).toEqual({
      ordinal: 20,
      response: {
        ok: true,
        data: { credits: 100, status: "granted", message: PURCHASE_MESSAGES.purchaseConfirmed["19"] },
      },
    });
    expect(data.purchaseConfirmedFallback.data.message).toBe(PURCHASE_CONFIRMED_FALLBACK_MESSAGE);
    await app.close();
  });

  it("is disabled in production", () => {
    expect(isPurchaseMessagesDevRouteEnabled({ NODE_ENV: "production" })).toBe(false);
    expect(isPurchaseMessagesDevRouteEnabled({ NODE_ENV: "development" })).toBe(true);
    expect(isPurchaseMessagesDevRouteEnabled({})).toBe(true);
  });
});
