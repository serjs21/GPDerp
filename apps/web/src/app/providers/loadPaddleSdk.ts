const PADDLE_SDK_SRC = "/api/paddle-sdk";

type PaddleWindow = Window & {
  Paddle?: unknown;
  PaddleBillingV1?: unknown;
};

function hasPaddleGlobal(win: PaddleWindow): boolean {
  return Boolean(win.PaddleBillingV1 || win.Paddle);
}

/**
 * Load Paddle.js from our same-origin proxy before @paddle/paddle-js runs.
 * That avoids ad blockers that block https://cdn.paddle.com/...
 */
export function loadPaddleSdk(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const win = window as PaddleWindow;
  if (hasPaddleGlobal(win)) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${PADDLE_SDK_SRC}"]`,
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      if (hasPaddleGlobal(win)) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => {
        if (hasPaddleGlobal(win)) resolve();
        else reject(new Error("Paddle.js loaded but global missing"));
      });
      existing.addEventListener("error", () => {
        reject(new Error("Failed to load Paddle SDK from origin proxy"));
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PADDLE_SDK_SRC;
    script.async = true;
    script.onload = () => {
      if (hasPaddleGlobal(win)) resolve();
      else reject(new Error("Paddle.js loaded but global missing"));
    };
    script.onerror = () => {
      reject(new Error("Failed to load Paddle SDK from origin proxy"));
    };
    document.head.appendChild(script);
  });
}
