import Fastify, { type FastifyInstance } from "fastify";
import type { ErrorReporter } from "../errorReporter";
import { registerObservability } from "../registerObservability";
import { REQUEST_ID_HEADER, resolveRequestId } from "../requestId";

const VALID_ID = "abc12345-request";

const addRoutes = (app: FastifyInstance) => {
  app.get("/boom", async () => {
    throw new Error("boom");
  });
  app.get("/handled", async (_request, reply) => reply.code(500).send({ ok: false, error: "handled" }));
  app.get("/bad", async () => {
    throw Object.assign(new Error("bad input"), { statusCode: 400 });
  });
  app.get("/ok", async () => ({ ok: true }));
};

const buildApp = async (reporter?: ErrorReporter) => {
  const app = Fastify({
    logger: false,
    requestIdHeader: false,
    genReqId: (req) => resolveRequestId(req.headers[REQUEST_ID_HEADER]),
  });
  if (reporter) await app.register(registerObservability, { release: "test", reporter });
  addRoutes(app);
  await app.ready();
  return app;
};

const mockReporter = () => ({ captureException: jest.fn(), captureMessage: jest.fn() });

describe("registerObservability", () => {
  let reporter: ReturnType<typeof mockReporter>;
  let app: FastifyInstance;

  beforeEach(async () => {
    reporter = mockReporter();
    app = await buildApp(reporter);
  });
  afterEach(() => app.close());

  it("reports a thrown 500 exactly once, as an exception with correlation tags", async () => {
    const res = await app.inject({ method: "GET", url: "/boom", headers: { [REQUEST_ID_HEADER]: VALID_ID } });

    expect(res.statusCode).toBe(500);
    expect(reporter.captureException).toHaveBeenCalledTimes(1);
    expect(reporter.captureMessage).not.toHaveBeenCalled();
    const [error, context] = reporter.captureException.mock.calls[0];
    expect((error as Error).message).toBe("boom");
    expect(context).toEqual({ requestId: VALID_ID, route: "/boom", method: "GET", statusCode: 500 });
  });

  it("reports a handler-sent 500 exactly once, as a message", async () => {
    const res = await app.inject({ method: "GET", url: "/handled" });

    expect(res.statusCode).toBe(500);
    expect(reporter.captureException).not.toHaveBeenCalled();
    expect(reporter.captureMessage).toHaveBeenCalledTimes(1);
    expect(reporter.captureMessage.mock.calls[0][0]).toBe("HTTP 500 GET /handled");
  });

  it.each(["/bad", "/missing", "/ok"])("does not report %s", async (url) => {
    await app.inject({ method: "GET", url });
    expect(reporter.captureException).not.toHaveBeenCalled();
    expect(reporter.captureMessage).not.toHaveBeenCalled();
  });

  it("leaves error response bodies and status codes unchanged", async () => {
    const plain = await buildApp();
    try {
      for (const url of ["/boom", "/handled", "/bad", "/missing", "/ok"]) {
        const [withPlugin, without] = await Promise.all([
          app.inject({ method: "GET", url }),
          plain.inject({ method: "GET", url }),
        ]);
        expect(withPlugin.statusCode).toBe(without.statusCode);
        expect(withPlugin.json()).toEqual(without.json());
      }
    } finally {
      await plain.close();
    }
  });

  it("echoes a valid incoming request id on every response, including errors", async () => {
    for (const url of ["/ok", "/boom", "/missing"]) {
      const res = await app.inject({ method: "GET", url, headers: { [REQUEST_ID_HEADER]: VALID_ID } });
      expect(res.headers[REQUEST_ID_HEADER]).toBe(VALID_ID);
    }
  });

  it("replaces an unsafe incoming request id and generates one when missing", async () => {
    const unsafe = await app.inject({ method: "GET", url: "/ok", headers: { [REQUEST_ID_HEADER]: "bad id\n{json}" } });
    const missing = await app.inject({ method: "GET", url: "/ok" });

    for (const res of [unsafe, missing]) {
      expect(res.headers[REQUEST_ID_HEADER]).toMatch(/^[0-9a-f-]{36}$/);
    }
    expect(unsafe.headers[REQUEST_ID_HEADER]).not.toBe(missing.headers[REQUEST_ID_HEADER]);
  });

  it("never lets a failing reporter break the response", async () => {
    await app.close();
    const failing: ErrorReporter = {
      captureException: () => {
        throw new Error("telemetry down");
      },
      captureMessage: () => undefined,
    };
    app = await buildApp(failing);
    const res = await app.inject({ method: "GET", url: "/boom" });
    expect(res.statusCode).toBe(500);
  });
});
