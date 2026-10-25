import { act, renderHook } from "@testing-library/react";
import { nextEmptyPlaceholderPhase, usePathEmptyPlaceholder } from "./usePathEmptyPlaceholder";

describe("nextEmptyPlaceholderPhase", () => {
  it("flies away from the path as soon as a generation starts", () => {
    expect(nextEmptyPlaceholderPhase("idle", { eligible: true, generating: true })).toBe("exiting");
    expect(nextEmptyPlaceholderPhase("entering", { eligible: true, generating: true })).toBe("exiting");
  });

  it("flies away when haikus appear without a local generation", () => {
    expect(nextEmptyPlaceholderPhase("idle", { eligible: false, generating: false })).toBe("exiting");
  });

  it("flies back in once the path is empty and nothing is generating", () => {
    expect(nextEmptyPlaceholderPhase("gone", { eligible: true, generating: false })).toBe("entering");
    expect(nextEmptyPlaceholderPhase("gone", { eligible: true, generating: true })).toBe("gone");
    expect(nextEmptyPlaceholderPhase("gone", { eligible: false, generating: false })).toBe("gone");
  });

  it("lets a running exit finish before re-entering", () => {
    expect(nextEmptyPlaceholderPhase("exiting", { eligible: true, generating: false })).toBe("exiting");
  });
});

describe("usePathEmptyPlaceholder", () => {
  it("starts parked on an empty path and hidden otherwise", () => {
    expect(renderHook(() => usePathEmptyPlaceholder({ eligible: true, generating: false })).result.current.phase).toBe(
      "idle",
    );
    expect(renderHook(() => usePathEmptyPlaceholder({ eligible: false, generating: false })).result.current.phase).toBe(
      "gone",
    );
  });

  it("runs first creation → delete back to empty", () => {
    const { result, rerender } = renderHook((inputs) => usePathEmptyPlaceholder(inputs), {
      initialProps: { eligible: true, generating: false },
    });

    rerender({ eligible: true, generating: true });
    expect(result.current.phase).toBe("exiting");
    rerender({ eligible: false, generating: false });
    act(() => result.current.onExitComplete());
    expect(result.current.phase).toBe("gone");

    rerender({ eligible: true, generating: false });
    expect(result.current.phase).toBe("entering");
    act(() => result.current.onEnterComplete());
    expect(result.current.phase).toBe("idle");
  });

  it("re-enters after its exit when the generation fails", () => {
    const { result, rerender } = renderHook((inputs) => usePathEmptyPlaceholder(inputs), {
      initialProps: { eligible: true, generating: true },
    });
    expect(result.current.phase).toBe("gone");

    rerender({ eligible: true, generating: false });
    expect(result.current.phase).toBe("entering");
    rerender({ eligible: true, generating: true });
    expect(result.current.phase).toBe("exiting");
    rerender({ eligible: true, generating: false });
    act(() => result.current.onExitComplete());
    expect(result.current.phase).toBe("entering");
  });
});
