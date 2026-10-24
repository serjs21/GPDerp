jest.mock("../../../lib/prisma", () => ({ prismaClient: { $queryRaw: jest.fn() } }));
jest.mock("../../../consts/server", () => ({ READYZ_DB_TIMEOUT_MS: 50 }));

import Fastify from "fastify";
import { healthPlugin } from "../health.controller";

const { prismaClient } = jest.requireMock("../../../lib/prisma") as { prismaClient: { $queryRaw: jest.Mock } };

const buildApp = async () => {
  const app = Fastify();
  await app.register(healthPlugin);
  return app;
};

describe("health routes", () => {
  beforeEach(() => prismaClient.$queryRaw.mockReset());

  it("GET /healthz returns 200 without touching the database", async () => {
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/healthz" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    expect(prismaClient.$queryRaw).not.toHaveBeenCalled();
    await app.close();
  });

  it("GET /readyz returns 200 when the database answers", async () => {
    prismaClient.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/readyz" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, db: "up" });
    await app.close();
  });

  it("GET /readyz returns 503 without error details when the query fails", async () => {
    prismaClient.$queryRaw.mockRejectedValue(new Error("password authentication failed for user x"));
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/readyz" });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ ok: false, db: "down" });
    expect(res.body).not.toContain("password");
    await app.close();
  });

  it("GET /readyz returns 503 when the database does not answer in time", async () => {
    prismaClient.$queryRaw.mockReturnValue(new Promise(() => {}));
    const app = await buildApp();
    const res = await app.inject({ method: "GET", url: "/readyz" });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ ok: false, db: "down" });
    await app.close();
  });
});
