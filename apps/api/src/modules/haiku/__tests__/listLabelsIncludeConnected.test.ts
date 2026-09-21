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
    listLabelsForUser: jest.fn(),
  },
}));

const { haikuService } = jest.requireMock("../haiku.service") as {
  haikuService: {
    createHaikuStream: jest.Mock;
    listLabelsForUser: jest.Mock;
  };
};

const sessionUserId = "user-session-1";
const ACCOUNT_ID = "d79dac0f-5abe-402c-8b3d-b98f635d3e57";

describe("haiku.controller GET /haiku/labels/:accountId", () => {
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

  it("forwards includeConnectedHaikus and connectedHaikuLimit", async () => {
    haikuService.listLabelsForUser.mockResolvedValue({
      ok: true,
      labels: [
        {
          id: "label-1",
          name: "Zen",
          color: "#fff",
          shape: "burst",
          accountId: ACCOUNT_ID,
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
          connectedHaikus: {
            total: 4,
            items: [{ id: "h1", title: "One", body: "a\nb\nc" }],
          },
        },
      ],
      total: 1,
      pageSize: 12,
      offset: 0,
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: `/haiku/labels/${ACCOUNT_ID}?pageSize=12&offset=0&includeConnectedHaikus=1&connectedHaikuLimit=3`,
    });

    expect(response.statusCode).toBe(200);
    expect(haikuService.listLabelsForUser).toHaveBeenCalledWith({
      userId: sessionUserId,
      accountId: ACCOUNT_ID,
      pageSize: 12,
      offset: 0,
      q: undefined,
      includeConnectedHaikus: true,
      connectedHaikuLimit: 3,
    });
    expect(response.json()).toEqual({
      ok: true,
      data: {
        labels: [
          {
            id: "label-1",
            name: "Zen",
            color: "#fff",
            shape: "burst",
            accountId: ACCOUNT_ID,
            createdAt: "2026-01-01T00:00:00.000Z",
            connectedHaikus: {
              total: 4,
              items: [{ id: "h1", title: "One", body: "a\nb\nc" }],
            },
          },
        ],
        total: 1,
        pageSize: 12,
        offset: 0,
      },
    });
    await app.close();
  });

  it("defaults includeConnectedHaikus to false", async () => {
    haikuService.listLabelsForUser.mockResolvedValue({
      ok: true,
      labels: [],
      total: 0,
      pageSize: 12,
      offset: 0,
    });
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: `/haiku/labels/${ACCOUNT_ID}?pageSize=12&offset=0`,
    });

    expect(response.statusCode).toBe(200);
    expect(haikuService.listLabelsForUser).toHaveBeenCalledWith({
      userId: sessionUserId,
      accountId: ACCOUNT_ID,
      pageSize: 12,
      offset: 0,
      q: undefined,
      includeConnectedHaikus: false,
      connectedHaikuLimit: undefined,
    });
    await app.close();
  });
});
