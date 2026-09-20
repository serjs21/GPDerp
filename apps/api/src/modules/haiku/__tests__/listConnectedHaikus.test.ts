import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import { haikuPlugin } from "../haiku.controller";

jest.mock("../../auth/repository", () => ({
  authRepository: {
    findAccountIdForUser: jest.fn(),
  },
}));

jest.mock("../../payments/payments.service", () => ({
  paymentsService: {
    getCredits: jest.fn(),
  },
}));

jest.mock("../haiku.service", () => ({
  haikuService: {
    createHaikuStream: jest.fn(),
    listConnectedHaikusForUser: jest.fn(),
  },
}));

const { haikuService } = jest.requireMock("../haiku.service") as {
  haikuService: {
    createHaikuStream: jest.Mock;
    listConnectedHaikusForUser: jest.Mock;
  };
};

const sessionUserId = "user-session-1";
const LABEL_ID = "11111111-1111-4111-8111-111111111111";

describe("haiku.controller GET /haiku/label/:labelId/haikus", () => {
  const buildApp = async () => {
    const app = Fastify();
    app.decorate("requireAuthenticated", async (request: FastifyRequest) => {
      request.user = { sub: sessionUserId, sid: "sid-1" };
    });
    app.decorate("sendToUid", jest.fn());
    app.decorate("broadcastToUser", jest.fn());
    await app.register(haikuPlugin);
    return app;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 when the service reports forbidden", async () => {
    haikuService.listConnectedHaikusForUser.mockResolvedValue({
      ok: false,
      reason: "forbidden",
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: `/haiku/label/${LABEL_ID}/haikus`,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({ ok: false, error: "Unauthorized" });
    await app.close();
  });

  it("returns empty items when the label has no haikus", async () => {
    haikuService.listConnectedHaikusForUser.mockResolvedValue({
      ok: true,
      total: 0,
      items: [],
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: `/haiku/label/${LABEL_ID}/haikus`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, data: { total: 0, items: [] } });
    expect(haikuService.listConnectedHaikusForUser).toHaveBeenCalledWith({
      userId: sessionUserId,
      labelId: LABEL_ID,
      limit: undefined,
    });
    await app.close();
  });

  it("returns total and preview items", async () => {
    const items = [
      { id: "h1", title: "One", body: "a\nb\nc" },
      { id: "h2", title: "Two", body: "d\ne\nf" },
      { id: "h3", title: "Three", body: "g\nh\ni" },
    ];
    haikuService.listConnectedHaikusForUser.mockResolvedValue({
      ok: true,
      total: 7,
      items,
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: `/haiku/label/${LABEL_ID}/haikus?limit=3`,
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, data: { total: 7, items } });
    expect(haikuService.listConnectedHaikusForUser).toHaveBeenCalledWith({
      userId: sessionUserId,
      labelId: LABEL_ID,
      limit: 3,
    });
    await app.close();
  });
});
