import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import { haikuPlugin } from "../haiku.controller";
import { noGenerationsLeftMessage } from "../../payments/utils/purchaseMessages";

jest.mock("../../auth/repository", () => ({
  authRepository: {
    findAccountIdForUser: jest.fn(),
  },
}));

jest.mock("../../payments/payments.service", () => ({
  paymentsService: {
    getCredits: jest.fn(),
    countCompletedPurchases: jest.fn(),
  },
}));

jest.mock("../haiku.service", () => ({
  haikuService: {
    createHaikuStream: jest.fn(),
  },
}));

const { authRepository } = jest.requireMock("../../auth/repository") as {
  authRepository: { findAccountIdForUser: jest.Mock };
};
const { paymentsService } = jest.requireMock("../../payments/payments.service") as {
  paymentsService: { getCredits: jest.Mock; countCompletedPurchases: jest.Mock };
};
const { haikuService } = jest.requireMock("../haiku.service") as {
  haikuService: { createHaikuStream: jest.Mock };
};

const sessionUserId = "user-session-1";

describe("haiku.controller POST /beer_me_haiku", () => {
  const broadcastToUser = jest.fn();

  const buildApp = async () => {
    const app = Fastify();
    app.decorate("requireAuthenticated", async (request: FastifyRequest) => {
      request.user = { sub: sessionUserId, sid: "sid-1" };
    });
    app.decorate("sendToUid", jest.fn());
    app.decorate("broadcastToUser", broadcastToUser);
    await app.register(haikuPlugin);
    return app;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authRepository.findAccountIdForUser.mockResolvedValue("account-1");
  });

  it("returns 402 when the user has no generation credits", async () => {
    paymentsService.getCredits.mockResolvedValue({ ok: true, credits: 0 });
    paymentsService.countCompletedPurchases.mockResolvedValue(1);
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/beer_me_haiku",
      payload: { subject: "Morning mist" },
    });

    expect(response.statusCode).toBe(402);
    expect(response.json()).toEqual({
      ok: false,
      error: "insufficient_credits",
      message: noGenerationsLeftMessage(1),
    });
    expect(paymentsService.countCompletedPurchases).toHaveBeenCalledWith(sessionUserId);
    expect(haikuService.createHaikuStream).not.toHaveBeenCalled();
    await app.close();
  });

  it("returns remaining credits after a saved generation", async () => {
    paymentsService.getCredits.mockResolvedValue({ ok: true, credits: 5 });
    haikuService.createHaikuStream.mockResolvedValue(
      (async function* () {
        yield "line";
        yield {
          type: "saved",
          haiku: { id: "haiku-1" },
          creditsRemaining: 4,
        };
      })(),
    );
    const app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/beer_me_haiku",
      payload: { subject: "Morning mist" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, creditsRemaining: 4 });
    expect(broadcastToUser).toHaveBeenCalledWith(sessionUserId, {
      kind: "generation_credits",
      data: { credits: 4 },
    });
    await app.close();
  });
});
