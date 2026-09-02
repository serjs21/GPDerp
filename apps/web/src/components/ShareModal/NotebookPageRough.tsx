"use client";

import { useEffect, useRef, type RefObject } from "react";
import { resolveRough, roughLineOptions } from "@/components/DrawnModal/roughUtils";
import { NOTEBOOK_ROUGH, NOTEBOOK_ROUGH_SEED, readNotebookMetrics } from "./notebookTokens";
import styles from "./NotebookPageRough.module.css";

type RoughSvg = {
  line: (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options?: Record<string, unknown>,
  ) => SVGGElement;
  rectangle: (
    x: number,
    y: number,
    width: number,
    height: number,
    options?: Record<string, unknown>,
  ) => SVGGElement;
};

type NotebookPageRoughProps = {
  hostRef: RefObject<HTMLElement | null>;
  className?: string;
};

export function NotebookPageRough({ hostRef, className }: NotebookPageRoughProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const host = hostRef.current;
    if (!svg || !host) return;

    const draw = () => {
      const width = svg.clientWidth || 1;
      const height = svg.clientHeight || 1;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const { lineHeightPx, padX, padY, marginX, ruleYOffset } = readNotebookMetrics(host);
      const rough = resolveRough() as { svg: (el: SVGSVGElement, config?: { options?: { seed?: number } }) => RoughSvg };
      const rc = rough.svg(svg, { options: { seed: NOTEBOOK_ROUGH_SEED } });
      const inset = 4;
      const frame = rc.rectangle(
        inset,
        inset,
        Math.max(1, width - inset * 2),
        Math.max(1, height - inset * 2),
        {
          ...NOTEBOOK_ROUGH,
          seed: NOTEBOOK_ROUGH_SEED,
        },
      );
      svg.appendChild(frame);

      const left = padX;
      const right = Math.max(left + 1, width - padX);
      const innerTop = padY;
      const innerBottom = Math.max(innerTop + 1, height - padY);
      const lineCount = Math.max(1, Math.floor((innerBottom - innerTop) / lineHeightPx));

      for (let i = 0; i < lineCount; i += 1) {
        const y = innerTop + lineHeightPx * (i + 1) + ruleYOffset;
        if (y > innerBottom) break;
        const rule = rc.line(left, y, right, y, {
          ...roughLineOptions(NOTEBOOK_ROUGH_SEED + i + 1),
          strokeWidth: 0.95,
          stroke: NOTEBOOK_ROUGH.stroke,
        });
        svg.appendChild(rule);
      }

      const marginLine = rc.line(marginX, innerTop, marginX, innerBottom, {
        ...roughLineOptions(NOTEBOOK_ROUGH_SEED + 100),
        strokeWidth: 0.85,
        stroke: "rgba(188, 60, 60, 0.35)",
      });
      svg.appendChild(marginLine);
    };

    draw();
    const observer = new ResizeObserver(() => draw());
    observer.observe(svg);
    observer.observe(host);
    return () => observer.disconnect();
  }, [hostRef]);

  return (
    <svg
      ref={svgRef}
      className={[styles.rough, className].filter(Boolean).join(" ")}
      aria-hidden
    />
  );
}
