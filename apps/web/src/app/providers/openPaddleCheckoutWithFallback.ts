import type { CheckoutOpenOptions } from "@paddle/paddle-js";

const BUY_FRAME_SELECTOR = 'iframe[src*="buy.paddle.com"]';
export const PADDLE_CHECKOUT_LOADED_EVENT = "paddle:checkout-loaded";

function readBuyFrameSrc(): string | null {
  const frame = document.querySelector<HTMLIFrameElement>(BUY_FRAME_SELECTOR);
  const src = frame?.src?.trim() ?? "";
  return src.length > 0 ? src : null;
}

function waitForCheckoutLoaded(timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener(PADDLE_CHECKOUT_LOADED_EVENT, onLoaded);
      resolve(loaded);
    };
    const onLoaded = () => finish(true);
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    window.addEventListener(PADDLE_CHECKOUT_LOADED_EVENT, onLoaded);
  });
}

/**
 * Prefer overlay checkout. If it never reaches checkout.loaded (common when the
 * normal browser profile blocks third-party cookies for paddle.com iframes),
 * fall back to a top-level navigation to the same buy URL.
 */
export async function openPaddleCheckoutWithFallback(
  open: (options: CheckoutOpenOptions) => void,
  options: CheckoutOpenOptions,
  navigate: (url: string) => void = (url) => {
    window.location.assign(url);
  },
): Promise<"overlay" | "top-level"> {
  open(options);
  const loaded = await waitForCheckoutLoaded(2500);
  if (loaded) return "overlay";

  const src = readBuyFrameSrc();
  if (!src) {
    throw new Error("Paddle checkout frame did not appear");
  }
  navigate(src);
  return "top-level";
}
