"use client";

import type { CSSProperties, PointerEventHandler, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import {
  backgroundSunVisibilityFromDialY,
  earthSunGradientAngleDeg,
} from "@/theme/celestialSelectorLayout";
import { ThemeSelectorIcon } from "@/components/CelestialThemeClock/ThemeSelectorIcon";
import {
  SELECTOR_SUN_SIZE_RATIO,
} from "./celestialDialProportions";
import { ThemeSelectorStars } from "./ThemeSelectorStars";
import styles from "./CelestialThemeDial.module.css";

const dialBodySizeVars = {
  "--dial-sun-size": `${SELECTOR_SUN_SIZE_RATIO * 100}%`,
  "--dial-moon-size": `12%`,
} as CSSProperties;

export type CelestialThemeDialPointerHandlers = {
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export type CelestialThemeDialProps = {
  layout: SelectorDialLayout;
  variant?: "panel" | "trigger";
  showBodyGlow?: boolean;
  className?: string;
  faceRef?: Ref<HTMLDivElement>;
  pointerHandlers?: CelestialThemeDialPointerHandlers;
  interactive?: boolean;
};

export function CelestialThemeDial({
  layout,
  variant = "panel",
  showBodyGlow = false,
  className,
  faceRef,
  pointerHandlers,
  interactive = false,
}: CelestialThemeDialProps) {
  const variantClass = variant === "trigger" ? styles.trigger : styles.panel;
  const interactiveClass = interactive ? styles.interactive : "";
  const arcHidden = backgroundSunVisibilityFromDialY(layout.sun.y) === 0;
  const moonOpacity = arcHidden ? 1 : layout.moon.opacity;

  return (
    <div
      className={`${styles.root} ${variantClass}${className ? ` ${className}` : ""}`}
      style={dialBodySizeVars}
    >
      <div
        ref={faceRef}
        className={`${styles.face}${interactiveClass ? ` ${interactiveClass}` : ""}`}
        aria-hidden
        {...pointerHandlers}
      >
        <ThemeSelectorStars opacity={moonOpacity} />
        <ThemeSelectorIcon
          variant="sun"
          className={styles.bodySun}
          showGlow={showBodyGlow}
          style={{
            left: `${layout.sun.x}%`,
            top: `${layout.sun.y}%`,
            opacity: 1,
          }}
        />
        <ThemeSelectorIcon
          variant="moon"
          className={styles.bodyMoon}
          style={{
            left: `${layout.moon.x}%`,
            top: `${layout.moon.y}%`,
            opacity: moonOpacity,
          }}
        />
        <div
          className={styles.earthFrame}
          style={{ transform: `rotate(${layout.earthRotationDeg}deg)` }}
        >
          <ThemeSelectorIcon
            variant="earth"
            className={styles.earth}
            style={
              {
                "--earth-sun-angle": `${earthSunGradientAngleDeg(layout)}deg`,
              } as CSSProperties
            }
          />
        </div>
      </div>
    </div>
  );
}
