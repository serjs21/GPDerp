"use client";

import type { ReactElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { toCanvas } from "html-to-image";
import {
  POSTCARD_CAPTURE_BACKGROUND,
  POSTCARD_HEIGHT,
  POSTCARD_IMAGE_TYPE,
  POSTCARD_JPEG_QUALITY,
  POSTCARD_PIXEL_RATIO,
  POSTCARD_WIDTH,
} from "../consts/postcardConsts";
import { buildPostcardFontEmbedCSS } from "./postcardFontEmbed";
import { waitForRenderedAssets } from "@/utils/visualReadiness/waitForRenderedAssets";

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
 * Mount `element` offscreen at the postcard size and capture it as a JPEG
 * (POSTCARD_WIDTH×POSTCARD_HEIGHT at POSTCARD_PIXEL_RATIO).
 */
export async function renderOffscreenImage(element: ReactElement): Promise<Blob> {
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

    await waitForRenderedAssets(node);
    const fontEmbedCSS = await resolveFontEmbedCSS(node);

    // html-to-image's toBlob drops `type`/`quality` (always PNG), so encode the canvas here.
    const canvas = await toCanvas(node, {
      width: POSTCARD_WIDTH,
      height: POSTCARD_HEIGHT,
      pixelRatio: POSTCARD_PIXEL_RATIO,
      cacheBust: true,
      backgroundColor: POSTCARD_CAPTURE_BACKGROUND,
      fontEmbedCSS,
    });
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, POSTCARD_IMAGE_TYPE, POSTCARD_JPEG_QUALITY),
    );
    if (!blob) {
      throw new Error("Postcard capture failed");
    }
    return blob;
  } finally {
    root.unmount();
    host.remove();
  }
}
