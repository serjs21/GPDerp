import {
  HAIKU_ACTIONS_OPEN_EVENT,
  PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY,
} from "@/config/userConfiguration";
import { act, renderHook } from "@testing-library/react";
import { useHaikuActionsOpenPreference } from "./useHaikuActionsOpenPreference";

describe("useHaikuActionsOpenPreference", () => {
  beforeEach(() => {
    window.localStorage.removeItem(PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY);
  });

  it("defaults to closed when nothing is stored", () => {
    const { result } = renderHook(() => useHaikuActionsOpenPreference());
    expect(result.current.isOpen).toBe(false);
  });

  it("reads open preference from localStorage on mount", () => {
    window.localStorage.setItem(PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY, "true");
    const { result } = renderHook(() => useHaikuActionsOpenPreference());
    expect(result.current.isOpen).toBe(true);
  });

  it("persists toggles until turned off", () => {
    const { result } = renderHook(() => useHaikuActionsOpenPreference());

    act(() => {
      result.current.setOpenPreference(true);
    });
    expect(result.current.isOpen).toBe(true);
    expect(window.localStorage.getItem(PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY)).toBe(
      "true",
    );

    act(() => {
      result.current.setOpenPreference(false);
    });
    expect(result.current.isOpen).toBe(false);
    expect(window.localStorage.getItem(PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY)).toBe(
      "false",
    );
  });

  it("syncs same-tab mounts via custom event", () => {
    const first = renderHook(() => useHaikuActionsOpenPreference());
    const second = renderHook(() => useHaikuActionsOpenPreference());

    act(() => {
      first.result.current.setOpenPreference(true);
    });

    expect(second.result.current.isOpen).toBe(true);
  });

  it("respects forcedOpen without writing storage", () => {
    const { result } = renderHook(() => useHaikuActionsOpenPreference(true));
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setOpenPreference(false);
    });
    expect(result.current.isOpen).toBe(true);
    expect(window.localStorage.getItem(PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY)).toBeNull();
  });

  it("dispatches the open event when preference changes", () => {
    const listener = jest.fn();
    window.addEventListener(HAIKU_ACTIONS_OPEN_EVENT, listener);

    const { result } = renderHook(() => useHaikuActionsOpenPreference());
    act(() => {
      result.current.setOpenPreference(true);
    });

    expect(listener).toHaveBeenCalled();
    window.removeEventListener(HAIKU_ACTIONS_OPEN_EVENT, listener);
  });
});
