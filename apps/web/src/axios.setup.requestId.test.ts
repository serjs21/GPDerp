jest.mock("@sentry/react", () => ({ isInitialized: () => false, withScope: jest.fn() }));
jest.mock("./authRefresh", () => ({
  hasCsrfCookie: () => false,
  isAuthRefreshSkippedError: () => false,
  refreshAuthSession: jest.fn(),
}));

import axios, { type InternalAxiosRequestConfig } from "axios";
import "./axios.setup";

describe("axios request ids", () => {
  it("sends a fresh x-request-id with every API request", async () => {
    const seen: string[] = [];
    const adapter = async (config: InternalAxiosRequestConfig) => {
      seen.push(String(config.headers["x-request-id"]));
      return { data: {}, status: 200, statusText: "OK", headers: {}, config };
    };

    await axios.get("/auth/me", { adapter });
    await axios.get("/auth/me", { adapter });

    expect(seen).toHaveLength(2);
    for (const id of seen) expect(id).toMatch(/^[A-Za-z0-9-]{8,}$/);
    expect(seen[0]).not.toBe(seen[1]);
  });

  it("passes 5xx errors through unchanged to callers", async () => {
    const adapter = async (config: InternalAxiosRequestConfig) =>
      Promise.reject(
        Object.assign(new Error("Request failed with status code 500"), {
          isAxiosError: true,
          config,
          response: { status: 500, data: { ok: false }, headers: {}, config, statusText: "" },
        }),
      );

    await expect(axios.get("/haikus", { adapter })).rejects.toMatchObject({ response: { status: 500 } });
  });
});
