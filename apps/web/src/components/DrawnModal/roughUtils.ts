"use client";

import roughJs from "roughjs";
import { DRAWN_ROUGH } from "./drawnTokens";

type RoughSvg = {
  line: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: Record<string, unknown>,
  ) => SVGGElement;
};

type RoughApi = {
  svg: (svg: SVGSVGElement, config?: { options?: { seed?: number } }) => RoughSvg;
};

export function resolveRough(): RoughApi {
  const mod = roughJs as RoughApi & { default?: RoughApi };
  return typeof mod.svg === "function" ? mod : (mod.default as RoughApi);
}

export function roughLineOptions(seed: number) {
  return {
    roughness: DRAWN_ROUGH.roughness,
    bowing: DRAWN_ROUGH.bowing,
    strokeWidth: DRAWN_ROUGH.strokeWidth,
    stroke: DRAWN_ROUGH.stroke,
    fill: DRAWN_ROUGH.fill,
    seed,
  };
}

/** Collect drawable path elements inside a Rough.js group. */
export function pathsInGroup(group: Element | null): SVGPathElement[] {
  if (!group) return [];
  return Array.from(group.querySelectorAll("path"));
}
