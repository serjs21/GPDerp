/**
 * @jest-environment jsdom
 */
import { AUTH_REQUIRED_EVENT, notifyAuthRequired } from "./axios.setup";

jest.mock("./authRefresh", () => ({
  refreshAuthSession: jest.fn(),
}));

jest.mock("./utils/tabId", () => ({
  getTabId: () => "tab-test-1",
}));

describe("notifyAuthRequired", () => {
  it("dispatches a CustomEvent with explanatory detail", () => {
    const seen: unknown[] = [];
    const handler = (event: Event) => {
      seen.push((event as CustomEvent).detail);
    };
    window.addEventListener(AUTH_REQUIRED_EVENT, handler);
    notifyAuthRequired({
      reason: "refresh_failed",
      message: "auth: refreshAuthSession failed after API 401",
      originalUrl: "/haiku",
      method: "get",
      status: 401,
      refreshFailed: true,
    });
    window.removeEventListener(AUTH_REQUIRED_EVENT, handler);

    expect(seen).toHaveLength(1);
    expect(seen[0]).toEqual(
      expect.objectContaining({
        reason: "refresh_failed",
        message: "auth: refreshAuthSession failed after API 401",
        originalUrl: "/haiku",
        tabId: "tab-test-1",
        refreshFailed: true,
      }),
    );
  });
});
