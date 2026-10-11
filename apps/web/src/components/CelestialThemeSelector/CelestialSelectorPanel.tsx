"use client";

import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { CelestialThemeClock } from "@/components/CelestialThemeClock";
import { STYLE_NAVIGATION_WHEEL } from "@/components/StyleNavigationWheel/styleNavigationWheel.config";
import type { CelestialSelectorPanelProps } from "./CelestialSelectorPanel.types";
import { CELESTIAL_SELECTOR_PANEL_MOTION } from "./celestialSelectorPanelMotion.config";
import { styleNavigationStarRimAngleDeg } from "./styleNavigationStarRimAngle";
import { panelNavStarStyle } from "./utils/selectorTriggerUtils";
import styles from "./CelestialThemeSelector.module.css";

/** Portaled dial panel: animated rim ring + nav star chrome around the celestial clock. */
export function CelestialSelectorPanel({
  panelRef,
  panelPopRef,
  panelChromeRef,
  panelContentRef,
  ringRef,
  clockRef,
  anchor,
  sceneStyle,
  ariaLabel,
  slot,
  coordinates,
  onPreview,
  onCommit,
}: CelestialSelectorPanelProps) {
  const ringStartAngleDeg = styleNavigationStarRimAngleDeg(slot);

  return createPortal(
    <div
      ref={panelRef}
      className={styles.panel}
      style={
        {
          "--panel-top": `${anchor.top}px`,
          "--panel-left": `${anchor.left}px`,
        } as CSSProperties
      }
      role="dialog"
      aria-label={ariaLabel}
    >
      <div ref={panelPopRef} className={styles.panelPop} style={sceneStyle}>
        <div ref={panelChromeRef} className={styles.panelChrome} aria-hidden>
          <svg className={styles.panelRing} viewBox="0 0 100 100">
            <circle
              ref={ringRef}
              className={styles.panelRingPath}
              cx="50"
              cy="50"
              r="48.5"
              fill="none"
              stroke={CELESTIAL_SELECTOR_PANEL_MOTION.ringStroke}
              strokeWidth={CELESTIAL_SELECTOR_PANEL_MOTION.ringStrokeWidthPx}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              transform={`rotate(${ringStartAngleDeg} 50 50)`}
            />
          </svg>
          {/* eslint-disable-next-line @next/next/no-img-element -- public SVG nav star */}
          <img
            src={STYLE_NAVIGATION_WHEEL.stars.src}
            alt=""
            className={styles.panelNavStar}
            style={panelNavStarStyle(ringStartAngleDeg)}
            draggable={false}
          />
        </div>
        <div ref={panelContentRef} className={styles.panelContent}>
          <CelestialThemeClock
            ref={clockRef}
            value={slot}
            onChange={onPreview}
            onCommit={onCommit}
            coordinates={coordinates}
            showBodyGlow
            hideNavStar
            ariaLabel={ariaLabel}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
