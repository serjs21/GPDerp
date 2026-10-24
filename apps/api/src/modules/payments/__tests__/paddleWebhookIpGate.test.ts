import Fastify from "fastify";

jest.mock("fastify-raw-body", () => ({ __esModule: true, default: async () => {} }));
jest.mock("../../../env", () => ({ env: { PADDLE_ENV: "production", PADDLE_WEBHOOK_IP_ALLOWLIST: true } }));
jest.mock("../paddleWebhook", () => ({ verifyPaddleWebhook: jest.fn() }));
jest.mock("../payments.service", () => ({ paymentsService: { handleVerifiedEvent: jest.fn() } }));

const check = jest.fn();
jest.mock("../paddleIpAllowlist", () => ({
  createPaddleIpAllowlist: jest.fn(() => ({ start: jest.fn(), stop: jest.fn(), check })),
}));

import { paymentsPlugin } from "../payments.controller";

const { createPaddleIpAllowlist } = jest.requireMock("../paddleIpAllowlist") as { createPaddleIpAllowlist: jest.Mock };
const { verifyPaddleWebhook } = jest.requireMock("../paddleWebhook") as { verifyPaddleWebhook: jest.Mock };
const { paymentsService } = jest.requireMock("../payments.service") as { paymentsService: { handleVerifiedEvent: jest.Mock } };

const buildApp = async () => {
  const app = Fastify();
  app.decorate("requireAuthenticated", async () => {});
  app.decorate("broadcastToUser", jest.fn());
  await app.register(paymentsPlugin);
  return app;
};

const deliver = (app: Awaited<ReturnType<typeof buildApp>>) =>
  app.inject({ method: "POST", url: "/webhooks/paddle", headers: { "paddle-signature": "ts=1;h1=x" }, payload: { a: 1 } });

describe("POST /webhooks/paddle source IP gate", () => {
  beforeEach(() => {
    check.mockReset();
    verifyPaddleWebhook.mockReset();
    paymentsService.handleVerifiedEvent.mockReset();
  });

  it("loads Paddle's live list for the production environment", async () => {
    const app = await buildApp();
    expect(createPaddleIpAllowlist).toHaveBeenCalledWith(expect.objectContaining({ url: "https://api.paddle.com/ips" }));
    await app.close();
  });

  it("rejects other sources with 403 before any signature check", async () => {
    check.mockReturnValue("denied");
    const app = await buildApp();
    const response = await deliver(app);
    expect(response.statusCode).toBe(403);
    expect(verifyPaddleWebhook).not.toHaveBeenCalled();
    await app.close();
  });

  it("answers 503 (Paddle retries) while the list is not loaded", async () => {
    check.mockReturnValue("unavailable");
    const app = await buildApp();
    expect((await deliver(app)).statusCode).toBe(503);
    expect(verifyPaddleWebhook).not.toHaveBeenCalled();
    await app.close();
  });

  it("lets Paddle's sources through to signature verification", async () => {
    check.mockReturnValue("allowed");
    verifyPaddleWebhook.mockResolvedValue({ eventType: "transaction.updated" });
    paymentsService.handleVerifiedEvent.mockResolvedValue({ status: "ignored" });
    const app = await buildApp();
    const response = await deliver(app);
    expect(response.statusCode).toBe(400); // fastify-raw-body is mocked out, so no raw body reaches the handler
    expect(check).toHaveBeenCalledWith("127.0.0.1");
    await app.close();
  });
});
