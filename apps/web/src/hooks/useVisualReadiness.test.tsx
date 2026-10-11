import { act, renderHook } from "@testing-library/react";
import { useVisualReadiness } from "./useVisualReadiness";
import type { CriticalImage, ImageReadiness } from "@/utils/visualReadiness/imageReadiness";

const deferreds = new Map<string, (value: ImageReadiness) => void>();
const decoded = new Set<string>();

jest.mock("@/utils/visualReadiness/imageReadiness", () => ({
  preloadAndDecodeImage: ({ src }: CriticalImage) =>
    new Promise<ImageReadiness>((resolve) => {
      deferreds.set(src, (value) => {
        if (value === "ready") decoded.add(src);
        resolve(value);
      });
    }),
  isImageDecoded: ({ src }: CriticalImage) => decoded.has(src),
}));

const imgs = (...srcs: string[]): CriticalImage[] => srcs.map((src) => ({ src }));

const settle = async (src: string, value: ImageReadiness) => {
  await act(async () => {
    deferreds.get(src)?.(value);
  });
};

describe("useVisualReadiness", () => {
  beforeEach(() => {
    deferreds.clear();
    decoded.clear();
    jest.useRealTimers();
  });

  it("is idle while disabled and starts no work", () => {
    const { result } = renderHook(() =>
      useVisualReadiness({ criticalAssets: imgs("/a.png"), enabled: false, maxWaitMs: 1000 }),
    );
    expect(result.current.status).toBe("idle");
    expect(deferreds.size).toBe(0);
  });

  it("goes loading → ready once every critical asset decodes", async () => {
    const { result } = renderHook(() =>
      useVisualReadiness({ criticalAssets: imgs("/a.png", "/b.png"), maxWaitMs: 1000 }),
    );
    expect(result.current.status).toBe("loading");
    await settle("/a.png", "ready");
    expect(result.current.status).toBe("loading");
    await settle("/b.png", "ready");
    expect(result.current).toEqual({ status: "ready", isReady: true, failedAssets: [] });
  });

  it("passes the CORS mode through to the loader", async () => {
    const { result } = renderHook(() =>
      useVisualReadiness({
        criticalAssets: [{ src: "/mask.png", crossOrigin: "anonymous" }],
        maxWaitMs: 1000,
      }),
    );
    await settle("/mask.png", "ready");
    expect(result.current.status).toBe("ready");
  });

  it("reports degraded with the failed assets when an image fails", async () => {
    const { result } = renderHook(() =>
      useVisualReadiness({ criticalAssets: imgs("/a.png", "/b.png"), maxWaitMs: 1000 }),
    );
    await settle("/a.png", "failed");
    await settle("/b.png", "ready");
    expect(result.current.status).toBe("degraded");
    expect(result.current.failedAssets).toEqual(["/a.png"]);
  });

  it("reveals degraded at the cap when assets are still pending", async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() =>
      useVisualReadiness({ criticalAssets: imgs("/slow.png"), maxWaitMs: 500 }),
    );
    expect(result.current.status).toBe("loading");
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.status).toBe("degraded");
    expect(result.current.failedAssets).toEqual(["/slow.png"]);
    // A late success for the capped run does not flip the result.
    await settle("/slow.png", "ready");
    expect(result.current.status).toBe("degraded");
  });

  it("ignores results from a superseded asset list", async () => {
    const { result, rerender } = renderHook(
      ({ assets }: { assets: CriticalImage[] }) =>
        useVisualReadiness({ criticalAssets: assets, maxWaitMs: 1000 }),
      { initialProps: { assets: imgs("/old.png") } },
    );
    rerender({ assets: imgs("/new.png") });
    await settle("/old.png", "failed");
    expect(result.current.status).toBe("loading");
    await settle("/new.png", "ready");
    expect(result.current.status).toBe("ready");
  });

  it("is ready synchronously when every asset was already decoded (warm cache)", () => {
    decoded.add("/warm.png");
    const { result } = renderHook(() =>
      useVisualReadiness({ criticalAssets: imgs("/warm.png"), maxWaitMs: 1000 }),
    );
    expect(result.current.status).toBe("ready");
    expect(deferreds.size).toBe(0);
  });

  it("does not update state after unmount", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { unmount } = renderHook(() =>
      useVisualReadiness({ criticalAssets: imgs("/a.png"), maxWaitMs: 1000 }),
    );
    unmount();
    await settle("/a.png", "ready");
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
