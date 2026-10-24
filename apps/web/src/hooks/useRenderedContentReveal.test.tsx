import { act, renderHook } from "@testing-library/react";
import { useRenderedContentReveal } from "./useRenderedContentReveal";

jest.mock("@/utils/visualReadiness/waitForRenderedAssets", () => ({
  waitForRenderedAssets: jest.fn(),
}));

const { waitForRenderedAssets } = jest.requireMock("@/utils/visualReadiness/waitForRenderedAssets") as {
  waitForRenderedAssets: jest.Mock;
};

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const rootRef = { current: document.createElement("div") };

describe("useRenderedContentReveal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    waitForRenderedAssets.mockReset();
  });
  afterEach(() => jest.useRealTimers());

  it("stays hidden while pending and until the rendered assets are ready", async () => {
    const assets = deferred();
    waitForRenderedAssets.mockReturnValue(assets.promise);
    const { result, rerender } = renderHook(
      ({ pending }) => useRenderedContentReveal(rootRef, { pending, maxWaitMs: 4000 }),
      { initialProps: { pending: true } },
    );
    expect(result.current).toBe(false);
    expect(waitForRenderedAssets).not.toHaveBeenCalled();

    rerender({ pending: false });
    expect(result.current).toBe(false);
    expect(waitForRenderedAssets).toHaveBeenCalledWith(rootRef.current);

    await act(async () => assets.resolve());
    expect(result.current).toBe(true);
  });

  it("reveals when an asset fails or the wait cap elapses", async () => {
    const failing = deferred();
    waitForRenderedAssets.mockReturnValueOnce(failing.promise);
    const failed = renderHook(() => useRenderedContentReveal(rootRef, { pending: false, maxWaitMs: 4000 }));
    await act(async () => failing.reject(new Error("broken image")));
    expect(failed.result.current).toBe(true);

    waitForRenderedAssets.mockReturnValueOnce(new Promise(() => undefined));
    const slow = renderHook(() => useRenderedContentReveal(rootRef, { pending: false, maxWaitMs: 4000 }));
    expect(slow.result.current).toBe(false);
    act(() => jest.advanceTimersByTime(4000));
    expect(slow.result.current).toBe(true);
  });

  it("hides again when pending returns, then waits for the new content", async () => {
    waitForRenderedAssets.mockResolvedValue(undefined);
    const { result, rerender } = renderHook(
      ({ pending }) => useRenderedContentReveal(rootRef, { pending, maxWaitMs: 4000 }),
      { initialProps: { pending: false } },
    );
    await act(async () => undefined);
    expect(result.current).toBe(true);

    rerender({ pending: true });
    expect(result.current).toBe(false);

    rerender({ pending: false });
    expect(result.current).toBe(false);
    await act(async () => undefined);
    expect(result.current).toBe(true);
    expect(waitForRenderedAssets).toHaveBeenCalledTimes(2);
  });
});
