"use client";

import { useId, type CSSProperties } from "react";
import type { SelectorBackgroundBodies } from "@/theme/celestialSelectorLayout";
import { getSkyGradientCss, type ThemeColors } from "@/theme/celestialTheme";
import {
  CELESTIAL_MOON_BODY_WIDTH_REM,
  CELESTIAL_SUN_BODY_WIDTH_REM,
} from "@/components/CelestialThemeDial/celestialDialProportions";
import { DaylightMoon } from "@/components/DaylightBackground/placeholders/DaylightMoon";
import { DaylightSun } from "@/components/DaylightBackground/placeholders/DaylightSun";
import { BACKGROUND_SCENE_ASSETS } from "./backgroundSceneAssets";
import {
  colorBalanceToMatrix,
  DEFAULT_COLOR_BALANCE,
  type ColorBalanceValues,
} from "./backgroundSceneColorBalance";
import styles from "./BackgroundScene.module.css";

export type BackgroundSceneProps = {
  theme: Pick<ThemeColors, "skyTop" | "skyMid" | "skyHorizon">;
  backgroundBodies: SelectorBackgroundBodies;
  colorBalance?: ColorBalanceValues;
  className?: string;
};

export function BackgroundScene({
  theme,
  backgroundBodies,
  colorBalance = DEFAULT_COLOR_BALANCE,
  className,
}: BackgroundSceneProps) {
  const filterId = useId().replace(/:/g, "");
  const matrix = colorBalanceToMatrix(colorBalance);
  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  return (
    <div
      className={rootClass}
      aria-hidden
      style={
        {
          background: getSkyGradientCss(theme),
        } as CSSProperties
      }
    >
      <div className={styles.scene}>
        <div className={styles.celestialLayer}>
          <DaylightSun
            celestial={{
              x: backgroundBodies.sun.x,
              y: backgroundBodies.sun.y,
              opacity: backgroundBodies.sun.opacity,
            }}
            style={{ width: `${CELESTIAL_SUN_BODY_WIDTH_REM}rem` }}
          />
          <DaylightMoon
            celestial={{
              x: backgroundBodies.moon.x,
              y: backgroundBodies.moon.y,
              opacity: backgroundBodies.moon.opacity,
              limbAngleDeg: backgroundBodies.moon.limbAngleDeg,
            }}
            style={{ width: `${CELESTIAL_MOON_BODY_WIDTH_REM}rem` }}
          />
        </div>

        <svg className={styles.filterDefs} aria-hidden>
          <defs>
            <filter id={filterId} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={matrix} />
            </filter>
          </defs>
        </svg>

        {/* Native img required for SVG feColorMatrix filter url() on the base art layer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.baseArt}
          src={BACKGROUND_SCENE_ASSETS.base}
          alt=""
          aria-hidden
          draggable={false}
          style={{ filter: `url(#${filterId})` }}
        />
      </div>
    </div>
  );
}
