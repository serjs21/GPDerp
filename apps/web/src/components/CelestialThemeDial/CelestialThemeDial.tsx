"use client";

import type { CSSProperties, PointerEventHandler, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import { earthSunGradientAngleDeg } from "@/theme/celestialSelectorLayout";
import { ThemeSelectorIcon } from "@/components/CelestialThemeClock/ThemeSelectorIcon";
import styles from "./CelestialThemeDial.module.css";

export type CelestialThemeDialPointerHandlers = {
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export type CelestialThemeDialProps = {
  layout: SelectorDialLayout;
  variant?: "panel" | "trigger";
  className?: string;
  faceRef?: Ref<HTMLDivElement>;
  pointerHandlers?: CelestialThemeDialPointerHandlers;
  interactive?: boolean;
};

export function CelestialThemeDial({
  layout,
  variant = "panel",
  className,
  faceRef,
  pointerHandlers,
  interactive = false,
}: CelestialThemeDialProps) {
  const variantClass = variant === "trigger" ? styles.trigger : styles.panel;
  const interactiveClass = interactive ? styles.interactive : "";

  return (
    <div className={`${styles.root} ${variantClass}${className ? ` ${className}` : ""}`}>
      <div
        ref={faceRef}
        className={`${styles.face}${interactiveClass ? ` ${interactiveClass}` : ""}`}
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
        <ThemeSelectorIcon
          variant="moon"
          className={styles.bodyMoon}
          style={{
            left: `${layout.moon.x}%`,
            top: `${layout.moon.y}%`,
            opacity: layout.moon.opacity,
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
