"use client";

import { AnimatePresence, LayoutGroup } from "motion/react";
import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { UIButton } from "@/components/ui";
import {
  CelestialThemeClock,
  type CelestialThemeClockHandle,
} from "@/components/CelestialThemeClock";
import { CelestialThemeDial } from "@/components/CelestialThemeDial";
import { formatClockLabel } from "@/theme/celestialTime";
import type { GeoCoordinates } from "@/theme/celestialTheme";
import { getSelectorDialLayoutFromSlot } from "@/theme/celestialSelectorLayout";
import { BANGKOK_COORDINATES } from "@/theme/useCelestialScene";
import { CELESTIAL_SELECTOR_LAYOUT_ID_PREFIX } from "./celestialSelectorMotion";
import { useCelestialSelectorOpenTransition } from "./useCelestialSelectorOpenTransition";
import styles from "./CelestialThemeSelector.module.css";

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
  const triggerLayout = useMemo(
    () => getSelectorDialLayoutFromSlot(slot, coordinates),
    [slot, coordinates],
  );
  const timeLabel = formatClockLabel(slot);
  const sceneStyle = sceneVars as CSSProperties | undefined;

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
    typeof document !== "undefined"
      ? createPortal(
          <AnimatePresence>
            {isOpen ? (
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
                <div style={sceneStyle}>
                  <CelestialThemeClock
                    ref={clockRef}
                    value={slot}
                    onChange={handlePreview}
                    onCommit={handleCommit}
                    coordinates={coordinates}
                    showBodyGlow
                    motionLayoutIdPrefix={CELESTIAL_SELECTOR_LAYOUT_ID_PREFIX}
                    motionInstant={reduceMotion ?? false}
                    ariaLabel={ariaLabel}
                  />
                </div>
              </div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <LayoutGroup id="celestial-theme-selector">
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
            {!isOpen ? (
              <CelestialThemeDial
                variant="trigger"
                layout={triggerLayout}
                slot={slot}
                showBodyGlow={false}
                motionLayoutIdPrefix={CELESTIAL_SELECTOR_LAYOUT_ID_PREFIX}
                motionInstant={reduceMotion ?? false}
                className={styles.dialTrigger}
              />
            ) : null}
          </UIButton>
        </div>
          {panel}
        </div>
      </div>
    </LayoutGroup>
  );
}
