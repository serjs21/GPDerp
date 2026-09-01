"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { pathsInGroup, resolveRough, roughLineOptions } from "./roughUtils";
import styles from "./DrawnModal.module.css";

export type DrawnFrameHandle = {
  getSideGroups: () => SVGGElement[];
  getSidePaths: () => SVGPathElement[][];
  redraw: () => void;
};

export type DrawnFrameProps = {
  seed?: number;
  padding?: number;
  /** Called after geometry is (re)built so animation can (re)start. */
  onGeometryReady?: () => void;
};

export const DrawnFrame = forwardRef<DrawnFrameHandle, DrawnFrameProps>(
  function DrawnFrame({ seed = 42, padding = 8, onGeometryReady }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);
    const sideRefs = useRef<SVGGElement[]>([]);
    const onReadyRef = useRef(onGeometryReady);
    onReadyRef.current = onGeometryReady;

    const redraw = () => {
      const svg = svgRef.current;
      if (!svg) return;

      const width = svg.clientWidth || 1;
      const height = svg.clientHeight || 1;
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      sideRefs.current = [];

      const rough = resolveRough();
      const rc = rough.svg(svg, { options: { seed } });
      const inset = padding;
      const left = inset;
      const top = inset;
      const right = Math.max(inset + 1, width - inset);
      const bottom = Math.max(inset + 1, height - inset);

      const sides: Array<[number, number, number, number]> = [
        [left, top, right, top],
        [right, top, right, bottom],
        [right, bottom, left, bottom],
        [left, bottom, left, top],
      ];

      sides.forEach(([x1, y1, x2, y2], index) => {
        const group = rc.line(x1, y1, x2, y2, roughLineOptions(seed + index));
        group.setAttribute("data-drawn-side", String(index));
        svg.appendChild(group);
        sideRefs.current.push(group);
      });

      onReadyRef.current?.();
    };

    useImperativeHandle(ref, () => ({
      getSideGroups: () => sideRefs.current.slice(),
      getSidePaths: () => sideRefs.current.map((group) => pathsInGroup(group)),
      redraw,
    }));

    useEffect(() => {
      const svg = svgRef.current;
      if (!svg) return;
      redraw();
      const observer = new ResizeObserver(() => redraw());
      observer.observe(svg);
      return () => observer.disconnect();
      // seed/padding changes should rebuild
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seed, padding]);

    return <svg ref={svgRef} className={styles.frame} aria-hidden />;
  },
);
