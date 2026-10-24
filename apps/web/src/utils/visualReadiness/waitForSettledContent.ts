import { waitForRenderedAssets } from "./waitForRenderedAssets";

/** Parts of a view that are still loading mark themselves with one of these. */
const BUSY_SELECTOR = '[aria-busy="true"], [data-visual-ready="loading"]';

function isContentBusy(root: HTMLElement): boolean {
  return root.matches(BUSY_SELECTOR) || root.querySelector(BUSY_SELECTOR) !== null;
}

function whenNotBusy(root: HTMLElement, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (!isContentBusy(root)) {
      resolve();
      return;
    }
    const observer = new MutationObserver(() => {
      if (isContentBusy(root)) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-busy", "data-visual-ready"],
    });
    signal.addEventListener(
      "abort",
      () => {
        observer.disconnect();
        resolve();
      },
      { once: true },
    );
  });
}

/**
 * Resolves once nothing inside `root` reports itself busy and the subtree's images, CSS images
 * and fonts are ready (failed assets count as settled). Re-checks after the asset wait, since
 * newly revealed content can start loading again. Resolves early when `signal` aborts.
 */
export async function waitForSettledContent(root: HTMLElement, signal: AbortSignal): Promise<void> {
  while (!signal.aborted) {
    await whenNotBusy(root, signal);
    if (signal.aborted) return;
    await waitForRenderedAssets(root).catch(() => undefined);
    if (!isContentBusy(root)) return;
  }
}
