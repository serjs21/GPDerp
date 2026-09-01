"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { pathsInGroup, resolveRough, roughLineOptions } from "./roughUtils";
import styles from "./DrawnModal.module.css";

export type DrawnCloseMarkHandle = {
  getStrokePaths: () => SVGPathElement[][];
  redraw: () => void;
};

export type DrawnCloseMarkProps = {
  seed?: number;
  /** Called after geometry is (re)built. */
  onGeometryReady?: () => void;
};

export const DrawnCloseMark = forwardRef<DrawnCloseMarkHandle, DrawnCloseMarkProps>(
  function DrawnCloseMark({ seed = 99, onGeometryReady }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);
    const strokeRefs = useRef<SVGGElement[]>([]);
    const onReadyRef = useRef(onGeometryReady);
    onReadyRef.current = onGeometryReady;

    const redraw = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const width = svg.clientWidth || 32;
      const height = svg.clientHeight || 32;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      strokeRefs.current = [];

      const pad = Math.max(6, Math.min(width, height) * 0.28);
      const rough = resolveRough();
      const rc = rough.svg(svg, { options: { seed } });

      const strokes: Array<[number, number, number, number]> = [
        [pad, pad, width - pad, height - pad],
        [width - pad, pad, pad, height - pad],
      ];

      strokes.forEach(([x1, y1, x2, y2], index) => {
        const group = rc.line(x1, y1, x2, y2, roughLineOptions(seed + index + 10));
        group.setAttribute("data-drawn-x", String(index));
        svg.appendChild(group);
        strokeRefs.current.push(group);
      });

      onReadyRef.current?.();
    };

    useImperativeHandle(ref, () => ({
      getStrokePaths: () => strokeRefs.current.map((group) => pathsInGroup(group)),
      redraw,
    }));

    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;
      redraw();
      const observer = new ResizeObserver(() => redraw());
      observer.observe(svg);
      return () => observer.disconnect();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seed]);

    return <svg ref={svgRef} className={styles.closeMark} aria-hidden />;
  },
);
