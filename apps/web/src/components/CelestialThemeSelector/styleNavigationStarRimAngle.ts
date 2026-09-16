import { selectorCosmicRotationDeg } from "@/theme/celestialSelectorLayout";
import { STYLE_NAVIGATION_WHEEL } from "@/components/StyleNavigationWheel/styleNavigationWheel.config";

/**
 * Viewer-space angle (degrees, clockwise from 3 o'clock) of the nav star
 * (`stars-navigation.svg`) on the rotating circle rim — matches SVG `<circle>`
 * stroke start after `rotate(angle 50 50)`.
 */
export function styleNavigationStarRimAngleDeg(slot: number): number {
  const { leftPercent, topPercent } = STYLE_NAVIGATION_WHEEL.stars;
  const rotationDeg =
    selectorCosmicRotationDeg(slot) +
    STYLE_NAVIGATION_WHEEL.circleBaseRotationOffsetDeg;
  const lx = leftPercent - 50;
  const ly = topPercent - 50;
  const rad = (rotationDeg * Math.PI) / 180;
  // CSS `rotate()` with Y-down matches the standard CCW matrix (looks clockwise on screen).
  const dx = lx * Math.cos(rad) - ly * Math.sin(rad);
  const dy = lx * Math.sin(rad) + ly * Math.cos(rad);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}
