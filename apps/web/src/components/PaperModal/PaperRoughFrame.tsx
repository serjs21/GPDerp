"use client";

import { useEffect, useRef } from "react";
import roughJs from "roughjs";
import { PAPER_ROUGH_DEFAULTS } from "./paperTokens";
import styles from "./PaperModal.module.css";

type RoughApi = {
  svg: (svg: SVGSVGElement, config?: { options?: { seed?: number } }) => {
    rectangle: (
      x: number,
      y: number,
      width: number,
      height: number,
      options?: Record<string, unknown>,
    ) => SVGGElement;
  };
};

function resolveRough(): RoughApi {
  const mod = roughJs as RoughApi & { default?: RoughApi };
  return typeof mod.svg === "function" ? mod : (mod.default as RoughApi);
}

export type PaperRoughFrameProps = {
  /** Stable Rough.js seed for reproducible borders in Storybook. */
  seed?: number;
  padding?: number;
};

/** Hand-drawn border; redraws only when the paper size changes. */
export function PaperRoughFrame({
  seed = PAPER_ROUGH_DEFAULTS.seed,
  padding = 6,
}: PaperRoughFrameProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const rough = resolveRough();

    const draw = () => {
      const width = svg.clientWidth || 1;
      const height = svg.clientHeight || 1;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const rc = rough.svg(svg, { options: { seed } });
      const inset = padding;
      const frame = rc.rectangle(
        inset,
        inset,
        Math.max(1, width - inset * 2),
        Math.max(1, height - inset * 2),
        {
          roughness: PAPER_ROUGH_DEFAULTS.roughness,
          bowing: PAPER_ROUGH_DEFAULTS.bowing,
          strokeWidth: PAPER_ROUGH_DEFAULTS.strokeWidth,
          stroke: PAPER_ROUGH_DEFAULTS.stroke,
          fill: PAPER_ROUGH_DEFAULTS.fill,
          seed,
        },
      );
      svg.appendChild(frame);
    };

    draw();
    const observer = new ResizeObserver(() => draw());
    observer.observe(svg);
    return () => observer.disconnect();
  }, [padding, seed]);

  return <svg ref={svgRef} className={styles.roughFrame} aria-hidden />;
}
