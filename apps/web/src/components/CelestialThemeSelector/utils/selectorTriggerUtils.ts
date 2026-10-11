import type { CSSProperties } from "react";
import { STYLE_NAVIGATION_WHEEL } from "@/components/StyleNavigationWheel/styleNavigationWheel.config";
import {
  selectorButtonModeFromSunY,
  selectorViewerSunYPercent,
} from "@/theme/celestialSelectorLayout";
import { CELESTIAL_TRIGGER_BODY_BADGE } from "../celestialTriggerBodyBadge.config";

const BODY_BADGE_STYLE = {
  left: `${CELESTIAL_TRIGGER_BODY_BADGE.leftPercent}%`,
  top: `${CELESTIAL_TRIGGER_BODY_BADGE.topPercent}%`,
  width: `${CELESTIAL_TRIGGER_BODY_BADGE.sizePercent}%`,
} as CSSProperties;

/** Sun badge on the day half of the dial, moon badge on the night half. */
export function triggerBodyBadge(slot: number) {
  const isDay = selectorButtonModeFromSunY(selectorViewerSunYPercent(slot)) === "day";
  return {
    src: isDay ? CELESTIAL_TRIGGER_BODY_BADGE.sunSrc : CELESTIAL_TRIGGER_BODY_BADGE.moonSrc,
    label: isDay ? "sun" : "moon",
    style: BODY_BADGE_STYLE,
  };
}

/** Nav star placed on the panel rim at `angleDeg`. */
export function panelNavStarStyle(angleDeg: number): CSSProperties {
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    left: `${50 + 50 * Math.cos(angleRad)}%`,
    top: `${50 + 50 * Math.sin(angleRad)}%`,
    width: `${STYLE_NAVIGATION_WHEEL.stars.sizePercent}%`,
  };
}
