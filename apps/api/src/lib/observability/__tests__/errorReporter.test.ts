const scope = { setTags: jest.fn(), setLevel: jest.fn(), captureException: jest.fn(), captureMessage: jest.fn() };
const isInitialized = jest.fn();
jest.mock("@sentry/node", () => ({
  isInitialized: () => isInitialized(),
  withScope: (callback: (s: typeof scope) => void) => callback(scope),
}));

import { sentryErrorReporter } from "../errorReporter";
import { resolveRequestId } from "../requestId";

const context = { requestId: "req-12345678", route: "/haikus/:id", method: "POST", statusCode: 500 };
const expectedTags = { request_id: "req-12345678", route: "/haikus/:id", method: "POST", status_code: "500" };

describe("sentryErrorReporter", () => {
  beforeEach(() => jest.clearAllMocks());

  it("captures exceptions with request correlation tags", () => {
    isInitialized.mockReturnValue(true);
    const error = new Error("db exploded");
    sentryErrorReporter.captureException(error, context);
    expect(scope.setTags).toHaveBeenCalledWith(expectedTags);
    expect(scope.captureException).toHaveBeenCalledWith(error);
  });

  it("captures handled 5xx responses as error-level messages", () => {
    isInitialized.mockReturnValue(true);
    sentryErrorReporter.captureMessage("HTTP 500 POST /haikus/:id", context);
    expect(scope.setLevel).toHaveBeenCalledWith("error");
    expect(scope.captureMessage).toHaveBeenCalledWith("HTTP 500 POST /haikus/:id");
  });

  it("does nothing when error tracking is not configured", () => {
    isInitialized.mockReturnValue(false);
    sentryErrorReporter.captureException(new Error("x"), context);
    sentryErrorReporter.captureMessage("x", context);
    expect(scope.captureException).not.toHaveBeenCalled();
    expect(scope.captureMessage).not.toHaveBeenCalled();
  });

  it("swallows SDK failures", () => {
    isInitialized.mockReturnValue(true);
    scope.captureException.mockImplementationOnce(() => {
      throw new Error("transport down");
    });
    expect(() => sentryErrorReporter.captureException(new Error("x"), context)).not.toThrow();
  });
});

describe("resolveRequestId", () => {
  it("keeps short log-safe ids and replaces anything else", () => {
    expect(resolveRequestId("abc12345-XYZ_.")).toBe("abc12345-XYZ_.");
    expect(resolveRequestId(["first-id-0001", "second"])).toBe("first-id-0001");
    for (const bad of [undefined, "", "short", "has space 123", "x".repeat(129), "a\nb12345678"]) {
      expect(resolveRequestId(bad)).toMatch(/^[0-9a-f-]{36}$/);
    }
  });
});
