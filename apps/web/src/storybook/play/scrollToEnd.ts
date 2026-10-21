const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Play-function helper: waits for a scrollable element matching `selector` (in the document, so portals
 * count), scrolls it to the end so the list's own scroll / next-page logic fires, then keeps it pinned
 * to the end for `settleMs` so a next-page loader appended below stays in view.
 */
export async function scrollToEnd(selector: string, { timeoutMs = 10_000, settleMs = 2_000 } = {}): Promise<void> {
  const deadline = performance.now() + timeoutMs;
  let element: HTMLElement | null = null;
  while (performance.now() < deadline) {
    element = document.querySelector<HTMLElement>(selector);
    if (element && element.scrollHeight > element.clientHeight) break;
    element = null;
    await sleep(100);
  }
  if (!element) return;

  const settleUntil = performance.now() + settleMs;
  while (performance.now() < settleUntil) {
    element.scrollTop = element.scrollHeight;
    await sleep(100);
  }
}
