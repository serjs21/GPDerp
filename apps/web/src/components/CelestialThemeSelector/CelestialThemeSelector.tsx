"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { Dropdown } from "@/components/StyledComponents";
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
import styles from "./CelestialThemeSelector.module.css";

const transparentDropdownStyles = {
  root: {
    background: "transparent",
    boxShadow: "none",
    padding: 0,
  },
} as const;

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

  const handlePreview = (nextSlot: number) => {
    onPreviewChange?.(nextSlot);
  };

  const handleCommit = (nextSlot: number) => {
    onChange(nextSlot);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      requestAnimationFrame(() => {
        clockRef.current?.focus();
      });
      return;
    }
    onChange(slot);
  };

  return (
    <div
      className={`${styles.wrap}${className ? ` ${className}` : ""}`}
      style={sceneStyle}
    >
      <Dropdown
        open={isOpen}
        onOpenChange={handleOpenChange}
        trigger={["click"]}
        placement="bottom"
        styles={transparentDropdownStyles}
        popupRender={() => (
          <div style={sceneStyle}>
            <CelestialThemeClock
              ref={clockRef}
              value={slot}
              onChange={handlePreview}
              onCommit={handleCommit}
              coordinates={coordinates}
              ariaLabel={ariaLabel}
            />
          </div>
        )}
      >
        <UIButton
          className={styles.trigger}
          aria-label={`${ariaLabel}, ${timeLabel}`}
          style={{ "--icon-button-padding": "2px" } as CSSProperties}
        >
          <CelestialThemeDial
            variant="trigger"
            layout={triggerLayout}
            className={styles.dialTrigger}
          />
        </UIButton>
      </Dropdown>
    </div>
  );
}
