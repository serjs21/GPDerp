"use client";

import { useMemo } from "react";
import {
  CELESTIAL_FIXED_DATE,
  CELESTIAL_SLOTS_PER_DAY,
  formatClockLabel,
} from "@/theme/celestialTime";
import type { GeoCoordinates } from "@/theme/celestialTheme";
import { getSelectorDialLayoutFromSlot } from "@/theme/celestialSelectorLayout";
import { useDialPointerSelection } from "./hooks/useDialPointerSelection";
import { ThemeSelectorIcon } from "./ThemeSelectorIcon";
import styles from "./CelestialThemeClock.module.css";

export type CelestialThemeClockProps = {
  value: number;
  onChange: (slot: number) => void;
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
  coordinates,
  ariaLabel = "Time of day",
  className,
}: CelestialThemeClockProps) {
  const timeLabel = formatClockLabel(value);
  const layout = useMemo(
    () => getSelectorDialLayoutFromSlot(value, coordinates),
    [value, coordinates],
  );
  const { faceRef, pointerHandlers } = useDialPointerSelection({ onChange });

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ""}`}>
      <div
        ref={faceRef}
        className={styles.face}
        aria-hidden
        {...pointerHandlers}
      >
        <ThemeSelectorIcon
          variant="sun"
          className={styles.bodySun}
          style={{
            left: `${layout.sun.x}%`,
            top: `${layout.sun.y}%`,
            opacity: layout.sun.opacity,
          }}
        />

        <div
          className={styles.earthFrame}
          style={{ transform: `rotate(${layout.earthRotationDeg}deg)` }}
        >
          <ThemeSelectorIcon variant="earth" className={styles.earth} />
          <ThemeSelectorIcon
            variant="moon"
            className={styles.bodyMoon}
            style={{
              left: `${layout.moon.x}%`,
              top: `${layout.moon.y}%`,
              opacity: layout.moon.opacity,
            }}
          />
        </div>
      </div>

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
