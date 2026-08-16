import { Lethargy } from "lethargy-ts";

export const filterInertia = (handler: (event: WheelEvent) => void) => {
  const lethargy = new Lethargy();
  return (event: WheelEvent) => {
    const isHuman = lethargy.check(event);
    // #region agent log
    fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
      body: JSON.stringify({
        sessionId: "a4f3b7",
        runId: "pre-fix",
        hypothesisId: "C",
        location: "wheelEvents.ts:filterInertia",
        message: "lethargy check",
        data: { isHuman, deltaX: event.deltaX, deltaY: event.deltaY },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (!isHuman) return;
    handler(event);
  };
};
