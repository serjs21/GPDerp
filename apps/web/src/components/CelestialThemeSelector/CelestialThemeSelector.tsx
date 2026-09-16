"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { UIButton } from "@/components/ui";
import {
  CelestialThemeClock,
  type CelestialThemeClockHandle,
} from "@/components/CelestialThemeClock";
import { formatClockLabel } from "@/theme/celestialTime";
import type { GeoCoordinates } from "@/theme/celestialTheme";
import {
  selectorButtonModeFromSunY,
  selectorViewerSunYPercent,
} from "@/theme/celestialSelectorLayout";
import { BANGKOK_COORDINATES } from "@/theme/useCelestialScene";
import { CELESTIAL_TRIGGER_BODY_BADGE } from "./celestialTriggerBodyBadge.config";
import { CELESTIAL_SELECTOR_PANEL_MOTION } from "./celestialSelectorPanelMotion.config";
import { styleNavigationStarRimAngleDeg } from "./styleNavigationStarRimAngle";
import { useCelestialSelectorOpenTransition } from "./useCelestialSelectorOpenTransition";
import {
  useCelestialSelectorPanelMotion,
  type CelestialSelectorPanelPhase,
} from "./useCelestialSelectorPanelMotion";
import styles from "./CelestialThemeSelector.module.css";

const ALIEN_TRIGGER_SRC = "/theme-selector/alien-obduction.svg";

export type CelestialThemeSelectorProps = {
  slot: number;
  onChange: (slot: number) => void;
  onPreviewChange?: (slot: number) => void;
  coordinates?: GeoCoordinates;
  sceneVars?: Record<string, string>;
  className?: string;
  ariaLabel?: string;
};

export function CelestialThemeSelector({
  slot,
  onChange,
  onPreviewChange,
  coordinates = BANGKOK_COORDINATES,
  sceneVars,
  className,
  ariaLabel = "Theme time of day",
}: CelestialThemeSelectorProps) {
  const [panelPhase, setPanelPhase] = useState<CelestialSelectorPanelPhase | null>(
    null,
  );
  const panelPhaseRef = useRef(panelPhase);
  panelPhaseRef.current = panelPhase;
  const clockRef = useRef<CelestialThemeClockHandle>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const timeLabel = formatClockLabel(slot);
  const sceneStyle = sceneVars as CSSProperties | undefined;
  const dialHalf = selectorButtonModeFromSunY(selectorViewerSunYPercent(slot));
  const bodyBadge =
    dialHalf === "day"
      ? {
          src: CELESTIAL_TRIGGER_BODY_BADGE.sunSrc,
          label: "sun",
        }
      : {
          src: CELESTIAL_TRIGGER_BODY_BADGE.moonSrc,
          label: "moon",
        };
  const bodyBadgeStyle = {
    left: `${CELESTIAL_TRIGGER_BODY_BADGE.leftPercent}%`,
    top: `${CELESTIAL_TRIGGER_BODY_BADGE.topPercent}%`,
    width: `${CELESTIAL_TRIGGER_BODY_BADGE.sizePercent}%`,
  } as CSSProperties;

  const isPanelMounted = panelPhase !== null;
  const isExpanded = panelPhase === "open";
  const ringStartAngleDeg = styleNavigationStarRimAngleDeg(slot);

  const requestClose = useCallback(() => {
    if (panelPhaseRef.current !== "open") return;
    setPanelPhase("closing");
    onChange(slot);
  }, [onChange, slot]);

  const handleCloseComplete = useCallback(() => {
    setPanelPhase(null);
  }, []);

  const {
    triggerRef,
    panelRef,
    panelPopRef,
    panelAnchor,
    updateAnchor,
    reduceMotion,
  } = useCelestialSelectorOpenTransition(isPanelMounted, requestClose);

  useCelestialSelectorPanelMotion({
    phase: panelPhase,
    reducedMotion: Boolean(reduceMotion),
    panelPopRef,
    ringRef,
    onCloseComplete: handleCloseComplete,
    onOpenLayout: updateAnchor,
  });

  const handlePreview = (nextSlot: number) => {
    onPreviewChange?.(nextSlot);
  };

  const handleCommit = (nextSlot: number) => {
    onChange(nextSlot);
  };

  const handleOpen = () => {
    setPanelPhase("open");
    requestAnimationFrame(() => {
      clockRef.current?.focus();
    });
  };

  const panel =
    typeof document !== "undefined" && isPanelMounted
      ? createPortal(
          <div
            ref={panelRef}
            className={styles.panel}
            style={
              {
                "--panel-top": `${panelAnchor.top}px`,
                "--panel-left": `${panelAnchor.left}px`,
              } as CSSProperties
            }
            role="dialog"
            aria-label={ariaLabel}
          >
            <div
              ref={panelPopRef}
              className={styles.panelPop}
              style={sceneStyle}
            >
              <svg
                className={styles.panelRing}
                viewBox="0 0 100 100"
                aria-hidden
              >
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
              <div className={styles.panelContent}>
                <CelestialThemeClock
                  ref={clockRef}
                  value={slot}
                  onChange={handlePreview}
                  onCommit={handleCommit}
                  coordinates={coordinates}
                  showBodyGlow
                  ariaLabel={ariaLabel}
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      className={`${styles.wrap}${className ? ` ${className}` : ""}`}
      style={sceneStyle}
    >
      <div className={styles.perspectiveRoot}>
        <div ref={triggerRef} className={styles.triggerAnchor}>
          <UIButton
            type="button"
            className={styles.trigger}
            aria-label={`${ariaLabel}, ${timeLabel}`}
            aria-expanded={isExpanded}
            aria-haspopup="dialog"
            onClick={() => (isExpanded ? requestClose() : handleOpen())}
          >
            <span className={styles.triggerFace} aria-hidden>
              <span className={styles.triggerArt}>
                <span className={styles.triggerSky} />
                {/* eslint-disable-next-line @next/next/no-img-element -- public SVG trigger asset */}
                <img
                  src={ALIEN_TRIGGER_SRC}
                  alt=""
                  className={styles.triggerAlien}
                  draggable={false}
                />
                {/* eslint-disable-next-line @next/next/no-img-element -- public SVG body badge */}
                <img
                  src={bodyBadge.src}
                  alt=""
                  className={styles.triggerBodyBadge}
                  style={bodyBadgeStyle}
                  data-body={bodyBadge.label}
                  draggable={false}
                />
              </span>
            </span>
          </UIButton>
        </div>
        {panel}
      </div>
    </div>
  );
}
