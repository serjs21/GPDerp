import { POSTCARD_MESSAGE_LINE_HEIGHT_PX } from "../consts/postcardMessageConsts";
import { buildPostcardMessageMeasureStyle } from "./postcardMessageStyleUtils";

let measureElement: HTMLDivElement | null = null;

function getMeasureElement(): HTMLDivElement {
  if (measureElement?.isConnected) return measureElement;
  const element = document.createElement("div");
  element.setAttribute("aria-hidden", "true");
  element.dataset.postcardMessageMeasure = "";
  Object.assign(element.style, buildPostcardMessageMeasureStyle());
  document.body.appendChild(element);
  measureElement = element;
  return element;
}

/**
 * Visual line count (wraps included) of `text` rendered in the postcard message
 * box font/width. Returns 0 outside the browser or for empty text.
 */
export function measurePostcardMessageLines(text: string): number {
  if (typeof document === "undefined" || !text) return 0;
  const element = getMeasureElement();
  // A trailing newline only opens a visible line once something follows it.
  element.textContent = text.endsWith("\n") ? `${text}\u200b` : text;
  return Math.round(element.scrollHeight / POSTCARD_MESSAGE_LINE_HEIGHT_PX);
}
