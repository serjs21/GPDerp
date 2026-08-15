"use client";

import { useEffect, useRef } from "react";

const SVG_PATH_SCROLL_DEBOUNCE_MS = 200;

export function useSvgPathInput(
  stageRef: React.RefObject<HTMLDivElement | null>,
  stepForward: () => boolean,
  stepBack: () => boolean,
) {
  const ignoringRef = useRef(false);
  const pendingDuringIgnoreRef = useRef(false);
  const pendingDirectionRef = useRef<1 | -1>(1);
  const ignoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const applyScroll = (direction: 1 | -1, reason: "initial" | "still-scrolling") => {
      const stepped = direction > 0 ? stepForward() : stepBack();
      ignoringRef.current = true;
      pendingDuringIgnoreRef.current = false;
      if (ignoreTimerRef.current) {
        clearTimeout(ignoreTimerRef.current);
      }
      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
        body: JSON.stringify({
          sessionId: "53a752",
          runId: "post-fix-one-stop",
          hypothesisId: "A-C",
          location: "useSvgPathInput.ts:afterStep",
          message: "step result",
          data: { direction, stepped, reason },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      ignoreTimerRef.current = setTimeout(() => {
        const stillScrolling = pendingDuringIgnoreRef.current;
        const nextDirection = pendingDirectionRef.current;
        ignoringRef.current = false;
        pendingDuringIgnoreRef.current = false;
        ignoreTimerRef.current = null;
        // #region agent log
        fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
          body: JSON.stringify({
            sessionId: "53a752",
            runId: "post-fix-one-stop",
            hypothesisId: "A-C",
            location: "useSvgPathInput.ts:ignoreWindowEnd",
            message: "ignore window ended",
            data: { stillScrolling, nextDirection, debounceMs: SVG_PATH_SCROLL_DEBOUNCE_MS },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        if (stillScrolling) {
          applyScroll(nextDirection, "still-scrolling");
        }
      }, SVG_PATH_SCROLL_DEBOUNCE_MS);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      const direction = Math.sign(event.deltaY) as -1 | 0 | 1;
      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "53a752" },
        body: JSON.stringify({
          sessionId: "53a752",
          runId: "post-fix-one-stop",
          hypothesisId: "A-C",
          location: "useSvgPathInput.ts:onWheel",
          message: "wheel event",
          data: {
            deltaY: event.deltaY,
            direction,
            ignoring: ignoringRef.current,
            applied: direction !== 0 && !ignoringRef.current,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (direction === 0) return;

      if (ignoringRef.current) {
        pendingDuringIgnoreRef.current = true;
        pendingDirectionRef.current = direction;
        return;
      }

      applyScroll(direction, "initial");
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      if (ignoreTimerRef.current) {
        clearTimeout(ignoreTimerRef.current);
      }
    };
  }, [stageRef, stepBack, stepForward]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") stepForward();
      if (event.key === "ArrowLeft") stepBack();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stepBack, stepForward]);
}
