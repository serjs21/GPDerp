import { Writable } from "node:stream";
import pino from "pino";
import type { ErrorEvent } from "@sentry/node";
import { failSafeStream, loggerOptions, stripClientAddress } from "../logger";
import { scrubEvent } from "../scrubEvent";
import { parseRate, readObservabilityConfig } from "../config";

const captureLogs = () => {
  const lines: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk, _encoding, done) {
      lines.push(JSON.parse(chunk.toString()));
      done();
    },
  });
  return { logger: pino(loggerOptions("info"), stream), lines };
};

describe("log redaction", () => {
  it("censors credentials, session identifiers and secret fields", () => {
    const { logger, lines } = captureLogs();
    logger.info(
      {
        req: {
          headers: {
            cookie: "access_token=abc",
            authorization: "Bearer abc",
            "x-csrf-token": "csrf",
            "x-tab-id": "tab",
            "x-api-key": "key",
            "content-type": "application/json",
          },
        },
        res: { headers: { "set-cookie": "refresh_token=abc" } },
        password: "hunter2",
        body: { password: "hunter2", newPassword: "x", token: "t", email: "kept@example.com" },
        refreshToken: "r",
      },
      "test",
    );
    const line = lines[0] as any;
    expect(line.req.headers).toEqual({
      cookie: "[redacted]",
      authorization: "[redacted]",
      "x-csrf-token": "[redacted]",
      "x-tab-id": "[redacted]",
      "x-api-key": "[redacted]",
      "content-type": "application/json",
    });
    expect(line.res.headers["set-cookie"]).toBe("[redacted]");
    expect(line.password).toBe("[redacted]");
    expect(line.refreshToken).toBe("[redacted]");
    expect(line.body).toEqual({ password: "[redacted]", newPassword: "[redacted]", token: "[redacted]", email: "kept@example.com" });
  });
});

describe("stripClientAddress", () => {
  it("removes client IP fields from lines shipped off the server", () => {
    const line = JSON.stringify({ level: 40, ip: "1.2.3.4", req: { remoteAddress: "1.2.3.4", method: "POST" }, msg: "auth failed" });
    expect(JSON.parse(stripClientAddress(line))).toEqual({ level: 40, req: { method: "POST" }, msg: "auth failed" });
  });

  it("passes through lines that are not JSON", () => {
    expect(stripClientAddress("plain text\n")).toBe("plain text\n");
  });
});

describe("failSafeStream", () => {
  it("drops a remote stream after its first failure instead of throwing", () => {
    const stderr = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    const write = jest.fn(() => {
      throw new Error("worker has exited");
    });
    const safe = failSafeStream({ write });

    expect(() => safe.write("a")).not.toThrow();
    expect(() => safe.write("b")).not.toThrow();
    expect(write).toHaveBeenCalledTimes(1);
    expect(stderr).toHaveBeenCalledTimes(1);
    stderr.mockRestore();
  });

  it("stops writing after an asynchronous transport error", () => {
    const stderr = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    let onError: ((err: unknown) => void) | undefined;
    const write = jest.fn();
    const safe = failSafeStream({ write, on: (_event, cb) => (onError = cb) });

    safe.write("a");
    onError?.(new Error("401 unauthorized"));
    safe.write("b");
    expect(write).toHaveBeenCalledTimes(1);
    stderr.mockRestore();
  });
});

describe("scrubEvent", () => {
  it("removes cookies, bodies, query strings, sensitive headers and user details", () => {
    const event = scrubEvent({
      request: {
        url: "https://api.gpderp.party/auth/verify-email?token=secret#frag",
        query_string: "token=secret",
        cookies: { access_token: "abc" },
        data: { password: "hunter2" },
        headers: {
          Authorization: "Bearer abc",
          cookie: "a=b",
          "x-csrf-token": "c",
          "X-Tab-Id": "t",
          "content-type": "application/json",
        },
      },
      user: { id: "user-1", email: "a@example.com", ip_address: "1.2.3.4" },
    } as unknown as ErrorEvent);

    expect(event.request).toEqual({
      url: "https://api.gpderp.party/auth/verify-email",
      headers: { "content-type": "application/json" },
    });
    expect(event.user).toEqual({ id: "user-1" });
  });
});

describe("observability config", () => {
  it("only accepts sample rates between 0 and 1", () => {
    expect(parseRate("0.25", 1)).toBe(0.25);
    expect(parseRate("2", 1)).toBe(1);
    expect(parseRate("abc", 0)).toBe(0);
    expect(parseRate(undefined, 1)).toBe(1);
  });

  it("defaults to errors at 100%, no traces, info locally and warn remotely", () => {
    expect(readObservabilityConfig({ NODE_ENV: "production" })).toMatchObject({
      environment: "production",
      errorsDsn: undefined,
      errorsSampleRate: 1,
      tracesSampleRate: 0,
      logLevel: "info",
      betterStackLogLevel: "warn",
      logsSourceToken: undefined,
    });
  });
});
