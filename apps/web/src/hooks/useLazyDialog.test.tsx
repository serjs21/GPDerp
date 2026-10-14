import { act, renderHook, waitFor } from "@testing-library/react";
import { useLazyDialog } from "./useLazyDialog";

const Dialog = () => null;

describe("useLazyDialog", () => {
  it("loads nothing until requested", () => {
    const load = jest.fn(() => Promise.resolve(Dialog));
    const { result } = renderHook(() => useLazyDialog(load));
    expect(load).not.toHaveBeenCalled();
    expect(result.current.Component).toBeNull();
    expect(result.current.open).toBe(false);
  });

  it("mounts the dialog closed first, then opens it on a later frame", async () => {
    const load = jest.fn(() => Promise.resolve(Dialog));
    const renders: { mounted: boolean; open: boolean }[] = [];
    const { result } = renderHook(() => {
      const dialog = useLazyDialog(load);
      renders.push({ mounted: dialog.Component !== null, open: dialog.open });
      return dialog;
    });

    act(() => result.current.requestOpen());
    await waitFor(() => expect(result.current.open).toBe(true));

    const firstMounted = renders.findIndex((r) => r.mounted);
    const firstOpen = renders.findIndex((r) => r.open);
    expect(renders[firstMounted].open).toBe(false);
    expect(firstOpen).toBeGreaterThan(firstMounted);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("stays mounted after closing and reopens without reloading", async () => {
    const load = jest.fn(() => Promise.resolve(Dialog));
    const { result } = renderHook(() => useLazyDialog(load));
    act(() => result.current.requestOpen());
    await waitFor(() => expect(result.current.open).toBe(true));

    act(() => result.current.setOpen(false));
    expect(result.current.Component).toBe(Dialog);
    act(() => result.current.requestOpen());
    expect(result.current.open).toBe(true);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("does not open when the chunk fails to load", async () => {
    const load = jest.fn(() => Promise.reject(new Error("offline")));
    const { result } = renderHook(() => useLazyDialog(load));
    await act(async () => result.current.requestOpen());
    expect(result.current.Component).toBeNull();
    expect(result.current.open).toBe(false);
  });
});
