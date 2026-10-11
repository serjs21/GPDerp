"use client";

import { useTranslations } from "next-intl";
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, type KeyboardEvent } from "react";
import {
  CELESTIAL_FIXED_DATE,
  CELESTIAL_SLOTS_PER_DAY,
  formatClockLabel,
  stepSlot,
} from "@/theme/celestialTime";
import type { GeoCoordinates } from "@/theme/celestialTheme";
import {
  getSelectorDialLayoutFromSlot,
  viewerSunAngleToSlot,
} from "@/theme/celestialSelectorLayout";
import { StyleNavigationWheel } from "@/components/StyleNavigationWheel";
import { RotationTable } from "@/components/RotationTable";
import styles from "./CelestialThemeClock.module.css";

export type CelestialThemeClockProps = {
  value: number;
  onChange: (slot: number) => void;
  onCommit?: (slot: number) => void;
  coordinates: GeoCoordinates;
  showBodyGlow?: boolean;
  motionLayoutIdPrefix?: string;
  motionInstant?: boolean;
  ariaLabel?: string;
  className?: string;
  hideNavStar?: boolean;
};

export type CelestialThemeClockHandle = {
  focus: () => void;
};

/**
 * Earth-centered celestial dial for theme time selection.
 * Future drop-in: mz-react-round-slider `RoundSlider` with pathStartAngle 270.
 */
export const CelestialThemeClock = forwardRef<
  CelestialThemeClockHandle,
  CelestialThemeClockProps
>(function CelestialThemeClock(
  {
    value,
    onChange,
    onCommit,
    coordinates,
    motionLayoutIdPrefix,
    motionInstant = false,
    ariaLabel: ariaLabelProp,
    className,
    hideNavStar = false,
  },
  ref,
) {
  const t = useTranslations("CelestialThemeClock");
  const ariaLabel = ariaLabelProp ?? t("ariaLabel");
  const inputRef = useRef<HTMLInputElement>(null);
  const timeLabel = formatClockLabel(value);
  const layout = useMemo(
    () => getSelectorDialLayoutFromSlot(value, coordinates),
    [value, coordinates],
  );

  const handleDegreesChange = useCallback(
    (degrees: number) => {
      onChange(viewerSunAngleToSlot(degrees));
    },
    [onChange],
  );

  const handleDegreesCommit = useCallback(
    (degrees: number) => {
      onCommit?.(viewerSunAngleToSlot(degrees));
    },
    [onCommit],
  );

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const maxSlot = CELESTIAL_SLOTS_PER_DAY - 1;

  const handleRangeKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const isDecrease = event.key === "ArrowDown" || event.key === "ArrowLeft";
    const isIncrease = event.key === "ArrowUp" || event.key === "ArrowRight";

    if (isDecrease && value === 0) {
      event.preventDefault();
      onChange(stepSlot(value, -1));
      return;
    }

    if (isIncrease && value === maxSlot) {
      event.preventDefault();
      onChange(stepSlot(value, 1));
    }
  };

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <RotationTable
        className={styles.dialTable}
        fill
        applyTransform={false}
        deadZoneRadiusPercent={18}
        degrees={0}
        onDegreesChange={handleDegreesChange}
        onDegreesCommit={onCommit ? handleDegreesCommit : undefined}
        valueMode="absolute"
      >
        <StyleNavigationWheel
          variant="panel"
          layout={layout}
          slot={value}
          motionLayoutIdPrefix={motionLayoutIdPrefix}
          motionInstant={motionInstant}
          interactive
          hideNavStar={hideNavStar}
        />
      </RotationTable>

      <input
        ref={inputRef}
        className={styles.rangeInput}
        type="range"
        min={0}
        max={maxSlot}
        step={1}
        value={value}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={maxSlot}
        aria-valuenow={value}
        aria-valuetext={`${timeLabel}, ${CELESTIAL_FIXED_DATE}`}
        onChange={(event) => onChange(Number(event.target.value))}
        onKeyDown={handleRangeKeyDown}
      />
    </div>
  );
});
