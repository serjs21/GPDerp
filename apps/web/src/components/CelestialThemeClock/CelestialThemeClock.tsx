"use client";

import { useMemo } from "react";
import {
  CELESTIAL_FIXED_DATE,
  CELESTIAL_SLOTS_PER_DAY,
  formatClockLabel,
} from "@/theme/celestialTime";
import type { GeoCoordinates } from "@/theme/celestialTheme";
import { getSelectorDialLayoutFromSlot } from "@/theme/celestialSelectorLayout";
import { CelestialThemeDial } from "@/components/CelestialThemeDial";
import { useDialPointerSelection } from "./hooks/useDialPointerSelection";
import styles from "./CelestialThemeClock.module.css";

export type CelestialThemeClockProps = {
  value: number;
  onChange: (slot: number) => void;
  onCommit?: (slot: number) => void;
  coordinates: GeoCoordinates;
  ariaLabel?: string;
  className?: string;
};

/**
 * Earth-centered celestial dial for theme time selection.
 * Future drop-in: mz-react-round-slider `RoundSlider` with pathStartAngle 270.
 */
export function CelestialThemeClock({
  value,
  onChange,
  onCommit,
  coordinates,
  ariaLabel = "Time of day",
  className,
}: CelestialThemeClockProps) {
  const timeLabel = formatClockLabel(value);
  const layout = useMemo(
    () => getSelectorDialLayoutFromSlot(value, coordinates),
    [value, coordinates],
  );
  const { faceRef, pointerHandlers } = useDialPointerSelection({
    onChange,
    onDragEnd: onCommit,
  });

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ""}`}>
      <CelestialThemeDial
        variant="panel"
        layout={layout}
        faceRef={faceRef}
        pointerHandlers={pointerHandlers}
        interactive
      />

      <input
        className={styles.rangeInput}
        type="range"
        min={0}
        max={CELESTIAL_SLOTS_PER_DAY - 1}
        step={1}
        value={value}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={CELESTIAL_SLOTS_PER_DAY - 1}
        aria-valuenow={value}
        aria-valuetext={`${timeLabel}, ${CELESTIAL_FIXED_DATE}`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}
