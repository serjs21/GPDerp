import Fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import { paymentsPlugin } from "../payments.controller";

jest.mock("fastify-raw-body", () => ({
  __esModule: true,
  default: async () => {},
}));

jest.mock("../../../env", () => ({ env: { PADDLE_ENV: "sandbox", PADDLE_WEBHOOK_IP_ALLOWLIST: false } }));

jest.mock("../paddleWebhook", () => ({
  verifyPaddleWebhook: jest.fn(),
}));

jest.mock("../payments.service", () => ({
  paymentsService: {
    createPendingPurchaseForUser: jest.fn(),
    createCheckout: jest.fn(),
    getCredits: jest.fn(),
    handleVerifiedEvent: jest.fn(),
  },
}));

const { paymentsService } = jest.requireMock("../payments.service") as {
  paymentsService: {
    createPendingPurchaseForUser: jest.Mock;
  };
};

const sessionUserId = "user-session-1";
const purchaseId = "11111111-1111-4111-8111-111111111111";

describe("payments.controller POST /payments/purchase", () => {
  const buildApp = async (opts: { userId?: string }) => {
    const app = Fastify();
    app.decorate("requireAuthenticated", async (request: FastifyRequest, reply: FastifyReply) => {
      if (!opts.userId) {
        return reply.code(401).send({ ok: false, error: "Unauthorized" });
      }
      request.user = { sub: opts.userId, sid: "sid-1" };
    });
    app.decorate("broadcastToUser", jest.fn());
    await app.register(paymentsPlugin);
    return app;
  };

  it("creates a pending pack for the session user and returns purchaseId", async () => {
    paymentsService.createPendingPurchaseForUser.mockResolvedValue({ id: purchaseId });
    const app = await buildApp({ userId: sessionUserId });

    const response = await app.inject({
      method: "POST",
      url: "/payments/purchase",
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({ ok: true, data: { purchaseId } });
    expect(paymentsService.createPendingPurchaseForUser).toHaveBeenCalledTimes(1);
    expect(paymentsService.createPendingPurchaseForUser).toHaveBeenCalledWith(sessionUserId);
    await app.close();
  });

  it("returns 401 when unauthenticated", async () => {
    const app = await buildApp({});

    const response = await app.inject({
      method: "POST",
      url: "/payments/purchase",
    });
    const body = response.json();

    expect(response.statusCode).toBe(401);
    expect(body).toEqual({ ok: false, error: "Unauthorized" });
    expect(paymentsService.createPendingPurchaseForUser).not.toHaveBeenCalled();
    await app.close();
  });

  it("ignores client-supplied userId, credits, and productKey", async () => {
    paymentsService.createPendingPurchaseForUser.mockResolvedValue({ id: purchaseId });
    const app = await buildApp({ userId: sessionUserId });

    const response = await app.inject({
      method: "POST",
      url: "/payments/purchase",
      payload: {
        userId: "attacker-user",
        credits: 9999,
        productKey: "other_product",
      },
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toEqual({ ok: true, data: { purchaseId } });
    expect(paymentsService.createPendingPurchaseForUser).toHaveBeenCalledTimes(1);
    expect(paymentsService.createPendingPurchaseForUser).toHaveBeenCalledWith(sessionUserId);
    expect(paymentsService.createPendingPurchaseForUser).not.toHaveBeenCalledWith("attacker-user");
    await app.close();
  });
});
