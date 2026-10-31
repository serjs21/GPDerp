import { AxiosError, AxiosHeaders, CanceledError, type InternalAxiosRequestConfig } from "axios";

const scope = { setTags: jest.fn(), setTag: jest.fn(), setFingerprint: jest.fn(), setLevel: jest.fn(), captureMessage: jest.fn(), captureException: jest.fn() };
const isInitialized = jest.fn(() => true);
jest.mock("@sentry/react", () => ({
  isInitialized: () => isInitialized(),
  withScope: (callback: (s: typeof scope) => void) => callback(scope),
}));

import { apiFailureTags, normalizeRoute, reportApiFailure, shouldReportApiError } from "./apiFailure";

const axiosError = (status: number | undefined, url = "/haikus/0b9f2c6e-1c2d-4e5f-8a9b-0c1d2e3f4a5b?x=1", responseId?: string) => {
  const config = {
    url,
    method: "post",
    headers: new AxiosHeaders({ "x-request-id": "sent-request-id" }),
  } as InternalAxiosRequestConfig;
  const response =
    status === undefined
      ? undefined
      : { status, statusText: "", data: {}, config, headers: responseId ? { "x-request-id": responseId } : {} };
  return new AxiosError("failed", "ERR", config, undefined, response);
};

describe("normalizeRoute", () => {
  it.each([
    ["/haikus/0b9f2c6e-1c2d-4e5f-8a9b-0c1d2e3f4a5b", "/haikus/:id"],
    ["/share/a1B2c3D4e5F6g7H8i9", "/share/:id"],
    ["/labels/42?sort=asc#top", "/labels/:id"],
    ["https://api.gpderp.party/auth/me", "/auth/me"],
    ["/auth/verify-email", "/auth/verify-email"],
    ["", "/"],
  ])("%s -> %s", (input, expected) => {
    expect(normalizeRoute(input)).toBe(expected);
  });
});

describe("shouldReportApiError", () => {
  it("reports server errors only", () => {
    expect(shouldReportApiError(axiosError(500))).toBe(true);
    expect(shouldReportApiError(axiosError(503))).toBe(true);
    for (const status of [400, 401, 403, 404, 409, 422, 429]) {
      expect(shouldReportApiError(axiosError(status))).toBe(false);
    }
  });

  it("ignores cancellations, network failures and non-axios errors", () => {
    expect(shouldReportApiError(new CanceledError())).toBe(false);
    expect(shouldReportApiError(axiosError(undefined))).toBe(false);
    expect(shouldReportApiError(new Error("x"))).toBe(false);
  });
});

describe("apiFailureTags", () => {
  it("prefers the request id echoed by the API, falling back to the one sent", () => {
    expect(apiFailureTags(axiosError(500, "/x", "echoed-id")).request_id).toBe("echoed-id");
    expect(apiFailureTags(axiosError(500, "/x")).request_id).toBe("sent-request-id");
  });

  it("tags the normalized API route, method and status", () => {
    expect(apiFailureTags(axiosError(502))).toMatchObject({
      api_route: "/haikus/:id",
      method: "POST",
      status_code: "502",
    });
  });
});

describe("reportApiFailure", () => {
  beforeEach(() => jest.clearAllMocks());

  it("sends one grouped message for a 5xx", () => {
    reportApiFailure(axiosError(500));
    expect(scope.captureMessage).toHaveBeenCalledWith("API 500 POST /haikus/:id");
    expect(scope.setFingerprint).toHaveBeenCalledWith(["api-failure", "POST", "/haikus/:id", "500"]);
  });

  it("does not report expected 4xx responses", () => {
    reportApiFailure(axiosError(422));
    expect(scope.captureMessage).not.toHaveBeenCalled();
  });

  it("does nothing when monitoring is not configured", () => {
    isInitialized.mockReturnValueOnce(false);
    reportApiFailure(axiosError(500));
    expect(scope.captureMessage).not.toHaveBeenCalled();
  });
});
