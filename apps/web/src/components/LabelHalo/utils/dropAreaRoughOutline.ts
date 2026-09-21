"use client";

import { resolveRough } from "@/components/DrawnModal/roughUtils";

type RoughSvg = {
  rectangle: (
    x: number,
    y: number,
    width: number,
    height: number,
    options?: Record<string, unknown>,
  ) => SVGGElement;
};

const OUTLINE_SEED = 71;

/** Draw a rough dotted rectangle into `svg`, sized to the element’s box. */
export function paintDropAreaRoughOutline(svg: SVGSVGElement): void {
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  const width = Math.max(1, svg.clientWidth || svg.getBoundingClientRect().width);
  const height = Math.max(1, svg.clientHeight || svg.getBoundingClientRect().height);
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));

  const rough = resolveRough() as unknown as {
    svg: (el: SVGSVGElement, config?: { options?: { seed?: number } }) => RoughSvg;
  };
  const rc = rough.svg(svg, { options: { seed: OUTLINE_SEED } });
  const inset = 3;
  const group = rc.rectangle(inset, inset, width - inset * 2, height - inset * 2, {
    roughness: 1.35,
    bowing: 1.1,
    strokeWidth: 1.5,
    stroke: "rgba(208, 225, 206, 0.95)",
    fill: "transparent",
    strokeLineDash: [5, 7],
    seed: OUTLINE_SEED,
  });
  svg.appendChild(group);
}

export function clearDropAreaRoughOutline(svg: SVGSVGElement | null): void {
  if (!svg) return;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}
