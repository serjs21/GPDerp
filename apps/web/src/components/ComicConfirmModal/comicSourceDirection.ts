import type { BubbleSpec, TailSpec } from "comicaljs";
import { styleUsesTail, type ComicBubbleStyle } from "./comicBubblePresets";

export type ComicSourceDirection =
  | "none"
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "top"
  | "top-left"
  | "top-right"
  | "left"
  | "right";

export const COMIC_SOURCE_DIRECTIONS: ComicSourceDirection[] = [
  "none",
  "bottom",
  "bottom-left",
  "bottom-right",
  "top",
  "top-left",
  "top-right",
  "left",
  "right",
];

const TAIL_EXTENSION = 36;

type Point2 = { x: number; y: number };
type Size2 = { width: number; height: number };

function adjustTowards(origin: Point2, target: Point2, originSize: Size2): Point2 {
  const deltaX = target.x - origin.x;
  const deltaY = target.y - origin.y;
  const xRatio = deltaX === 0 ? Number.MAX_VALUE : originSize.width / 2 / Math.abs(deltaX);
  const yRatio = deltaY === 0 ? Number.MAX_VALUE : originSize.height / 2 / Math.abs(deltaY);
  const borderRatio = Math.min(xRatio, yRatio);
  return { x: origin.x + deltaX * borderRatio, y: origin.y + deltaY * borderRatio };
}

/** Port of comicaljs Bubble.defaultMid — plain coordinates, no paper.js. */
function defaultMid(start: Point2, target: Point2, startSize: Size2): Point2 {
  const startBorderPoint = adjustTowards(start, target, startSize);
  let deltaX = target.x - startBorderPoint.x;
  let deltaY = target.y - startBorderPoint.y;
  const mid = { x: startBorderPoint.x + deltaX / 2, y: startBorderPoint.y + deltaY / 2 };
  deltaX /= 5;
  deltaY /= 5;
  let angleDeg = (Math.atan2(deltaY, deltaX) * 180) / Math.PI - 90;
  let length = Math.hypot(deltaX, deltaY);
  let curveX = Math.cos((angleDeg * Math.PI) / 180) * length;
  let curveY = Math.sin((angleDeg * Math.PI) / 180) * length;
  if (Math.abs(curveX) > Math.abs(curveY)) {
    if (curveX !== 0) {
      length *= curveY / curveX;
    }
  } else if (curveY !== 0) {
    length *= curveX / curveY;
  }
  angleDeg = (Math.atan2(deltaY, deltaX) * 180) / Math.PI - 90;
  curveX = Math.cos((angleDeg * Math.PI) / 180) * length;
  curveY = Math.sin((angleDeg * Math.PI) / 180) * length;
  return { x: mid.x + curveX, y: mid.y + curveY };
}

function tipTargetForDirection(element: HTMLElement, direction: ComicSourceDirection): Point2 {
  const left = element.offsetLeft;
  const top = element.offsetTop;
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  switch (direction) {
    case "bottom":
      return { x: centerX, y: top + height + TAIL_EXTENSION };
    case "bottom-left":
      return { x: left + width * 0.22, y: top + height + TAIL_EXTENSION };
    case "bottom-right":
      return { x: left + width * 0.78, y: top + height + TAIL_EXTENSION };
    case "top":
      return { x: centerX, y: top - TAIL_EXTENSION };
    case "top-left":
      return { x: left + width * 0.22, y: top - TAIL_EXTENSION };
    case "top-right":
      return { x: left + width * 0.78, y: top - TAIL_EXTENSION };
    case "left":
      return { x: left - TAIL_EXTENSION, y: centerY };
    case "right":
      return { x: left + width + TAIL_EXTENSION, y: centerY };
    default:
      return { x: centerX, y: top + height + TAIL_EXTENSION };
  }
}

export function buildTailSpecForSourceDirection(
  element: HTMLElement,
  direction: ComicSourceDirection,
  baseTail?: TailSpec,
): TailSpec {
  const left = element.offsetLeft;
  const top = element.offsetTop;
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const rootCenter = { x: left + width / 2, y: top + height / 2 };
  const tip = tipTargetForDirection(element, direction);
  const mid = defaultMid(rootCenter, tip, { width, height });
  return {
    tipX: tip.x,
    tipY: tip.y,
    midpointX: mid.x,
    midpointY: mid.y,
    autoCurve: baseTail?.autoCurve ?? true,
    style: baseTail?.style,
    joiner: baseTail?.joiner,
  };
}

export function applySourceDirectionToSpec(
  element: HTMLElement,
  spec: BubbleSpec,
  direction: ComicSourceDirection | undefined,
  style: ComicBubbleStyle,
  options?: { isQuestion?: boolean },
): BubbleSpec {
  const isQuestion = options?.isQuestion ?? false;
  if (isQuestion || direction === "none" || !styleUsesTail(style)) {
    return { ...spec, tails: [] };
  }
  if (!direction) {
    return spec;
  }
  const baseTail = spec.tails[0];
  return {
    ...spec,
    tails: [buildTailSpecForSourceDirection(element, direction, baseTail)],
  };
}

export function stagePaddingClassForDirection(
  direction: ComicSourceDirection,
  styles: Record<"stageTailBottom" | "stageTailTop" | "stageTailLeft" | "stageTailRight" | "stageCompact", string>,
): string {
  switch (direction) {
    case "bottom":
    case "bottom-left":
    case "bottom-right":
      return styles.stageTailBottom;
    case "top":
    case "top-left":
    case "top-right":
      return styles.stageTailTop;
    case "left":
      return styles.stageTailLeft;
    case "right":
      return styles.stageTailRight;
    default:
      return styles.stageCompact;
  }
}
