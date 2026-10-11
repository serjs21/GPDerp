import { layoutComicBurstLabel, type ComicBurstShapeKind } from "../comicBurstPath";
import {
  burstDisplayFontSize,
  estimateComicBurstTextWidth,
  measureComicBurstTextWidth,
} from "../measureComicBurstText";

export function resolveBurstLayout(params: {
  text: string;
  fontSizeProp?: number;
  paddingX: number;
  paddingY: number;
  spikeCount: number;
  randomness: number;
  seedKey: string | number;
  shapeKind: ComicBurstShapeKind;
  hasChildren: boolean;
  hasLeading: boolean;
  canMeasure: boolean;
}) {
  const {
    text,
    fontSizeProp,
    paddingX,
    paddingY,
    spikeCount,
    randomness,
    seedKey,
    shapeKind,
    hasChildren,
    hasLeading,
    canMeasure,
  } = params;
  const fontSize = fontSizeProp ?? burstDisplayFontSize(text);
  // Icon/custom content: size from fontSize box, not lettering width.
  const leadingExtra = hasLeading ? fontSize * 1.2 : 0;
  // Canvas measuring only after hydration so SSR and first client render match.
  const letteringWidth = canMeasure
    ? measureComicBurstTextWidth(text, fontSize)
    : estimateComicBurstTextWidth(text, fontSize);
  const textWidth = hasChildren ? fontSize : letteringWidth + leadingExtra;
  const layout = layoutComicBurstLabel({
    textWidth,
    fontSize,
    paddingX,
    paddingY,
    spikeCount,
    randomness,
    seedKey,
    kind: shapeKind,
    text,
    tight: hasChildren,
  });
  const strokePx = Math.min(2.5, Math.max(1.5, fontSize * 0.08));
  return { layout, fontSize, strokePx };
}

export function strokeCapsForShape(shapeKind: ComicBurstShapeKind): {
  strokeLinejoin: "miter" | "round";
  strokeLinecap: "square" | "round";
} {
  if (shapeKind === "rect" || shapeKind === "diamond") {
    return { strokeLinejoin: "miter", strokeLinecap: "square" };
  }
  return { strokeLinejoin: "round", strokeLinecap: "round" };
}
