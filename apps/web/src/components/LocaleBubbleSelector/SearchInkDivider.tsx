"use client";

import { useEffect, useRef } from "react";
import { resolveRough } from "@/components/DrawnModal/roughUtils";
import styles from "./LocaleBubbleSelector.module.css";

/** Hand-drawn black ink rule under the locale search row. */
export function SearchInkDivider({ seed = 17 }: { seed?: number }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const redraw = () => {
      const width = svg.clientWidth || 1;
      const height = svg.clientHeight || 8;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const rough = resolveRough();
      const rc = rough.svg(svg, { options: { seed } });
      const y = height * 0.55;
      const group = rc.line(4, y, Math.max(5, width - 4), y, {
        roughness: 1.55,
        bowing: 1.35,
        strokeWidth: 1.55,
        stroke: "#111111",
        fill: "transparent",
        seed,
      });
      svg.appendChild(group);
    };

    redraw();
    const observer = new ResizeObserver(() => redraw());
    observer.observe(svg);
    return () => observer.disconnect();
  }, [seed]);

  return <svg ref={svgRef} className={styles.inkDivider} aria-hidden />;
}
