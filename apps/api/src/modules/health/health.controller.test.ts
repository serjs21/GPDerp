import Fastify, { type FastifyInstance } from "fastify";

const queryRaw = jest.fn();
jest.mock("../../lib/prisma", () => ({ prismaClient: { $queryRaw: (...args: unknown[]) => queryRaw(...args) } }));
jest.mock("../../consts/server", () => ({ READYZ_DB_TIMEOUT_MS: 50 }));

import { healthPlugin } from "./health.controller";

describe("health routes", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    queryRaw.mockReset();
    app = Fastify({ logger: false });
    await app.register(healthPlugin);
    await app.ready();
  });
  afterEach(() => app.close());

  it.each(["/health/live", "/healthz"])("%s answers without touching the database", async (url) => {
    const res = await app.inject({ method: "GET", url });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true });
    expect(queryRaw).not.toHaveBeenCalled();
  });

  it.each(["/health/ready", "/readyz"])("%s is 200 when the database answers", async (url) => {
    queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    const res = await app.inject({ method: "GET", url });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, db: "up" });
  });

  it.each(["/health/ready", "/readyz"])("%s is 503 without details when the database fails", async (url) => {
    queryRaw.mockRejectedValue(new Error("connection refused to postgres://secret@host"));
    const res = await app.inject({ method: "GET", url });
    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ ok: false, db: "down" });
  });

  it("/health/ready is 503 when the database does not answer in time", async () => {
    queryRaw.mockReturnValue(new Promise(() => undefined));
    const res = await app.inject({ method: "GET", url: "/health/ready" });
    expect(res.statusCode).toBe(503);
  });
});
