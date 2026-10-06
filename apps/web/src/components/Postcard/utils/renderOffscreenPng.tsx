"use client";

import type { ReactElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { toBlob } from "html-to-image";
import {
  POSTCARD_HEIGHT,
  POSTCARD_PIXEL_RATIO,
  POSTCARD_WIDTH,
} from "../consts/postcardConsts";
import { buildPostcardFontEmbedCSS } from "./postcardFontEmbed";
import { waitForPostcardAssets } from "./waitForPostcardAssets";

function createOffscreenHost(): HTMLDivElement {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.dataset.postcardHost = "";
  Object.assign(host.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${POSTCARD_WIDTH}px`,
    height: `${POSTCARD_HEIGHT}px`,
    pointerEvents: "none",
    overflow: "hidden",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(host);
  return host;
}

async function resolveFontEmbedCSS(node: HTMLElement): Promise<string> {
  const css = await buildPostcardFontEmbedCSS(node);
  if (!css.trim() && process.env.NODE_ENV !== "production") {
    console.warn("[postcard] no matching @font-face rules found; text may use fallback fonts.");
  }
  return css;
}

/**
 * Mount `element` offscreen at the postcard size and capture it as a PNG
 * (POSTCARD_WIDTH×POSTCARD_HEIGHT at POSTCARD_PIXEL_RATIO). Shared by both sides
 * so front and back always use identical capture settings.
 */
export async function renderOffscreenPng(element: ReactElement): Promise<Blob> {
  if (typeof document === "undefined") {
    throw new Error("Postcard images must be generated in the browser");
  }

  const host = createOffscreenHost();
  const root = createRoot(host);
  try {
    flushSync(() => {
      root.render(element);
    });
    const node = host.firstElementChild;
    if (!(node instanceof HTMLElement)) {
      throw new Error("Postcard renderer did not mount");
    }

    await waitForPostcardAssets(node);
    const fontEmbedCSS = await resolveFontEmbedCSS(node);

    const blob = await toBlob(node, {
      width: POSTCARD_WIDTH,
      height: POSTCARD_HEIGHT,
      pixelRatio: POSTCARD_PIXEL_RATIO,
      cacheBust: true,
      type: "image/png",
      fontEmbedCSS,
    });
    if (!blob) {
      throw new Error("Postcard capture failed");
    }
    return blob;
  } finally {
    root.unmount();
    host.remove();
  }
}
