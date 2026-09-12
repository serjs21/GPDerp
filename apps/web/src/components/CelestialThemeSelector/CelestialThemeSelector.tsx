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
import { useCelestialSelectorOpenTransition } from "./useCelestialSelectorOpenTransition";
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
  const [isOpen, setIsOpen] = useState(false);
  const clockRef = useRef<CelestialThemeClockHandle>(null);
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

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onChange(slot);
  }, [onChange, slot]);

  const { triggerRef, panelRef, panelAnchor, reduceMotion } =
    useCelestialSelectorOpenTransition(isOpen, handleClose);

  const handlePreview = (nextSlot: number) => {
    onPreviewChange?.(nextSlot);
  };

  const handleCommit = (nextSlot: number) => {
    onChange(nextSlot);
  };

  const handleOpen = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      clockRef.current?.focus();
    });
  };

  const panel =
    typeof document !== "undefined" && isOpen
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
              className={`${styles.panelPop}${
                reduceMotion ? ` ${styles.panelPopInstant}` : ""
              }`}
              style={sceneStyle}
            >
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
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            onClick={() => (isOpen ? handleClose() : handleOpen())}
            style={{ "--icon-button-padding": "2px" } as CSSProperties}
          >
            <span className={styles.triggerFace} aria-hidden>
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
          </UIButton>
        </div>
        {panel}
      </div>
    </div>
  );
}
