import { act, renderHook } from "@testing-library/react";
import type { TransitionPose } from "./steppedTransitionTypes";
import { useSteppedTransition } from "./useSteppedTransition";

const poses: TransitionPose[] = [
  { progress: 0, x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 },
  { progress: 0.5, x: 10, y: -40, rotation: 0, scale: 0.8, opacity: 0.7 },
  { progress: 1, x: 20, y: -80, rotation: 0, scale: 0.2, opacity: 0 },
];

describe("useSteppedTransition", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls onComplete at most once and cancels cleanly on unmount", async () => {
    const onComplete = jest.fn();
    const { unmount } = renderHook(() =>
      useSteppedTransition({
        poses,
        active: true,
        holdMs: 50,
        crossfadeMs: 40,
        onComplete,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(30);
    });
    expect(onComplete).not.toHaveBeenCalled();

    unmount();

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("reduced motion completes once after short crossfade", async () => {
    const onComplete = jest.fn();
    renderHook(() =>
      useSteppedTransition({
        poses,
        active: true,
        reducedMotion: true,
        onComplete,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fires onPoseHold for each discrete pose hold", async () => {
    const onPoseHold = jest.fn();
    const onComplete = jest.fn();
    renderHook(() =>
      useSteppedTransition({
        poses,
        active: true,
        holdMs: 50,
        crossfadeMs: 40,
        onPoseHold,
        onComplete,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0]);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    await act(async () => {
      jest.advanceTimersByTime(40);
    });
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0, 1]);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    await act(async () => {
      jest.advanceTimersByTime(40);
    });
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0, 1, 2]);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("hard-cuts between poses when crossfadeMs is 0", async () => {
    const onPoseHold = jest.fn();
    const onComplete = jest.fn();
    const { result } = renderHook(() =>
      useSteppedTransition({
        poses,
        active: true,
        holdMs: 50,
        crossfadeMs: 0,
        onPoseHold,
        onComplete,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0]?.role).toBe("solo");
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0]);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0]?.role).toBe("solo");
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0, 1]);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0, 1, 2]);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("fades out then cuts with fadeMode outThenCut", async () => {
    const onPoseHold = jest.fn();
    const onComplete = jest.fn();
    const { result } = renderHook(() =>
      useSteppedTransition({
        poses,
        active: true,
        holdMs: 50,
        crossfadeMs: 40,
        fadeMode: "outThenCut",
        onPoseHold,
        onComplete,
      }),
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0]);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0]?.role).toBe("outgoing");

    await act(async () => {
      jest.advanceTimersByTime(40);
    });
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0, 1]);
    expect(result.current.layers[0]?.role).toBe("solo");
    expect(result.current.layers[0]?.opacity).toBe(1);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    await act(async () => {
      jest.advanceTimersByTime(40);
    });
    expect(onPoseHold.mock.calls.map((call) => call[0])).toEqual([0, 1, 2]);

    await act(async () => {
      jest.advanceTimersByTime(50);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
