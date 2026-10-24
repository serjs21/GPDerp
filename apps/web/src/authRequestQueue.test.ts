import type { AxiosResponse } from "axios";
import {
  AuthRequiredError,
  cancelAuthRequestQueue,
  clearAuthRequestQueueForTests,
  enqueueAuthRequest,
  flushAuthRequestQueue,
  getAuthRequestQueueLength,
  shouldEnqueueAuthRequest,
} from "./authRequestQueue";

describe("authRequestQueue", () => {
  beforeEach(() => {
    clearAuthRequestQueueForTests();
  });

  describe("shouldEnqueueAuthRequest", () => {
    it("enqueues non-GET resource mutations", () => {
      expect(
        shouldEnqueueAuthRequest({ method: "post", url: "/haikus" }),
      ).toBe(true);
      expect(
        shouldEnqueueAuthRequest({ method: "DELETE", url: "/haikus/1" }),
      ).toBe(true);
      expect(
        shouldEnqueueAuthRequest({ method: "put", url: "/labels" }),
      ).toBe(true);
    });

    it("does not enqueue GET requests", () => {
      expect(
        shouldEnqueueAuthRequest({ method: "get", url: "/haikus" }),
      ).toBe(false);
      expect(shouldEnqueueAuthRequest({ url: "/haikus" })).toBe(false);
    });

    it("does not enqueue auth bootstrap endpoints", () => {
      expect(
        shouldEnqueueAuthRequest({ method: "post", url: "/auth/refresh" }),
      ).toBe(false);
      expect(
        shouldEnqueueAuthRequest({ method: "post", url: "/auth/login" }),
      ).toBe(false);
      expect(
        shouldEnqueueAuthRequest({ method: "post", url: "/auth/register" }),
      ).toBe(false);
      expect(
        shouldEnqueueAuthRequest({ method: "post", url: "/auth/logout" }),
      ).toBe(false);
      expect(
        shouldEnqueueAuthRequest({ method: "post", url: "/auth/google/login" }),
      ).toBe(false);
      expect(
        shouldEnqueueAuthRequest({ method: "post", url: "/auth/google" }),
      ).toBe(false);
    });

    it("does not enqueue replayed requests", () => {
      expect(
        shouldEnqueueAuthRequest({
          method: "post",
          url: "/haikus",
          _authReplay: true,
        }),
      ).toBe(false);
    });
  });

  describe("enqueue / flush / cancel", () => {
    it("holds a promise until flush resolves it", async () => {
      const held = enqueueAuthRequest({ method: "post", url: "/haikus", data: { a: 1 } });
      expect(getAuthRequestQueueLength()).toBe(1);

      let settled = false;
      void held.then(() => {
        settled = true;
      });
      await Promise.resolve();
      expect(settled).toBe(false);

      const fakeResponse = { status: 200, data: { ok: true } } as AxiosResponse;
      const request = jest.fn().mockResolvedValue(fakeResponse);
      await flushAuthRequestQueue(request);

      await expect(held).resolves.toBe(fakeResponse);
      expect(request).toHaveBeenCalledTimes(1);
      expect(request.mock.calls[0]![0]).toMatchObject({
        method: "post",
        url: "/haikus",
        _authReplay: true,
      });
      expect(request.mock.calls[0]![0]._retry).toBeUndefined();
      expect(getAuthRequestQueueLength()).toBe(0);
    });

    it("rejects held promises on cancel", async () => {
      const held = enqueueAuthRequest({ method: "post", url: "/haikus" });
      cancelAuthRequestQueue();
      await expect(held).rejects.toBeInstanceOf(AuthRequiredError);
      expect(getAuthRequestQueueLength()).toBe(0);
    });

    it("propagates replay failures to the held promise", async () => {
      const held = enqueueAuthRequest({ method: "post", url: "/haikus" });
      const boom = new Error("still unauthorized");
      await flushAuthRequestQueue(jest.fn().mockRejectedValue(boom));
      await expect(held).rejects.toBe(boom);
    });

    it("strips _retry when enqueueing", async () => {
      const held = enqueueAuthRequest({
        method: "post",
        url: "/haikus",
        _retry: true,
      });
      const request = jest.fn().mockResolvedValue({ status: 200 } as AxiosResponse);
      await flushAuthRequestQueue(request);
      await held;
      expect(request.mock.calls[0]![0]._retry).toBeUndefined();
    });
  });
});
