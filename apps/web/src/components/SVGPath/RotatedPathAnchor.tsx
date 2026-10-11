"use client";

import type { CSSProperties } from "react";
import type { RotatedPathAnchorProps } from "./SVGPathLantern.types";
import { pathHaikuIdAttribute, pathLanternCssVars, rotatedPathAnchorClassName } from "./utils/svgPathLanternUtils";

/** Path-positioned anchor for rotated-base lanterns (no reveal animation of its own). */
export function RotatedPathAnchor({
  transform,
  flightStyle,
  suppressReveal,
  isAnimating,
  ariaLabel,
  pathHaikuId,
  children,
}: RotatedPathAnchorProps) {
  const anchorStyle = {
    ...pathLanternCssVars(transform, flightStyle),
    animation: "none",
  } as CSSProperties;

  return (
    <div
      className={rotatedPathAnchorClassName(suppressReveal, isAnimating)}
      style={anchorStyle}
      aria-label={ariaLabel}
      {...pathHaikuIdAttribute(pathHaikuId)}
    >
      {children}
    </div>
  );
}
