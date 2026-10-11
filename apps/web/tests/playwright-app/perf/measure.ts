import type { Page } from "playwright/test";

type PerfProbe = { events: number[]; longTasks: number[] };

/** Collect Event Timing (INP proxy) and long-task durations from page start. Call before `goto`. */
export async function installPerfObservers(page: Page) {
  await page.addInitScript(() => {
    const probe: PerfProbe = { events: [], longTasks: [] };
    (window as unknown as { __perf: PerfProbe }).__perf = probe;
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) probe.events.push(entry.duration);
      }).observe({ type: "event", buffered: true, durationThreshold: 16 } as PerformanceObserverInit);
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) probe.longTasks.push(entry.duration);
      }).observe({ type: "longtask", buffered: true });
    } catch {
      // Entry types unsupported: extras stay empty rather than failing the benchmark.
    }
  });
}

export async function applyCpuThrottle(page: Page, rate: number) {
  if (rate <= 1) return;
  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate });
}

export async function resetPerfProbe(page: Page) {
  await page.evaluate(() => {
    const probe = (window as unknown as { __perf: PerfProbe }).__perf;
    probe.events.length = 0;
    probe.longTasks.length = 0;
  });
}

export async function readPerfProbe(page: Page) {
  const probe = await page.evaluate(() => (window as unknown as { __perf: PerfProbe }).__perf);
  return {
    longTasks: probe.longTasks.length,
    longTaskMs: Math.round(probe.longTasks.reduce((sum, d) => sum + d, 0)),
    maxEventDuration: Math.round(Math.max(0, ...probe.events)),
  };
}

/**
 * Time (ms, page clock) from just before `action` until `done` holds in the page.
 * `done` is polled every animation frame, so resolution is ~1 frame.
 */
export async function timeInteraction<Arg>(
  page: Page,
  action: () => Promise<void>,
  done: (arg: Arg) => boolean,
  arg: Arg,
  timeoutMs = 120_000,
): Promise<number> {
  await page.evaluate(() => {
    performance.clearMarks("bench:start");
    performance.mark("bench:start");
  });
  await action();
  await page.waitForFunction(done, arg, { polling: "raf", timeout: timeoutMs });
  return page.evaluate(() => performance.measure("bench", "bench:start").duration);
}
