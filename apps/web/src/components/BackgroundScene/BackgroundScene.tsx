"use client";

import { useId, useRef, type CSSProperties } from "react";
import type { SelectorBackgroundBodies } from "@/theme/celestialSelectorLayout";
import {
  formatCssRem,
  getSkyGradientCss,
  type ThemeColors,
} from "@/theme/celestialTheme";
import {
  CELESTIAL_MOON_BODY_WIDTH_REM,
  CELESTIAL_SUN_BODY_WIDTH_REM,
} from "@/components/CelestialThemeDial/celestialDialProportions";
import { DaylightMoon, DaylightSun } from "@/components/CelestialBackgroundBodies";
import { BACKGROUND_SCENE_ASSETS } from "./backgroundSceneAssets";
import {
  colorBalanceToMatrix,
  DEFAULT_COLOR_BALANCE,
  type ColorBalanceValues,
} from "./backgroundSceneColorBalance";
import { useBackgroundSceneMaskLayout } from "./useBackgroundSceneMaskLayout";
import { BackgroundSceneStars } from "./BackgroundSceneStars";
import styles from "./BackgroundScene.module.css";

export type BackgroundSceneProps = {
  theme: Pick<ThemeColors, "skyTop" | "skyMid" | "skyHorizon" | "moon">;
  backgroundBodies: SelectorBackgroundBodies;
  colorBalance?: ColorBalanceValues;
  mountainColorBalance?: ColorBalanceValues;
  className?: string;
};

export function BackgroundScene({
  theme,
  backgroundBodies,
  colorBalance = DEFAULT_COLOR_BALANCE,
  mountainColorBalance = DEFAULT_COLOR_BALANCE,
  className,
}: BackgroundSceneProps) {
  const baseArtStackRef = useRef<HTMLDivElement>(null);
  const maskLayout = useBackgroundSceneMaskLayout(baseArtStackRef);
  const globalFilterId = useId().replace(/:/g, "");
  const mountainFilterId = useId().replace(/:/g, "");
  const globalMatrix = colorBalanceToMatrix(colorBalance);
  const mountainMatrix = colorBalanceToMatrix(mountainColorBalance);
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
          <BackgroundSceneStars
            opacity={backgroundBodies.moon.opacity}
            sunOpacity={backgroundBodies.sun.opacity}
            moonColor={theme.moon}
          />
          <DaylightSun
            celestial={{
              x: backgroundBodies.sun.x,
              y: backgroundBodies.sun.y,
              opacity: backgroundBodies.sun.opacity,
            }}
            style={{ width: formatCssRem(CELESTIAL_SUN_BODY_WIDTH_REM) }}
          />
          <DaylightMoon
            celestial={{
              x: backgroundBodies.moon.x,
              y: backgroundBodies.moon.y,
              opacity: backgroundBodies.moon.opacity,
              limbAngleDeg: backgroundBodies.moon.limbAngleDeg,
            }}
            style={{ width: formatCssRem(CELESTIAL_MOON_BODY_WIDTH_REM) }}
          />
        </div>

        <svg className={styles.filterDefs} aria-hidden>
          <defs>
            <filter id={globalFilterId} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={globalMatrix} />
            </filter>
            <filter id={mountainFilterId} colorInterpolationFilters="sRGB">
              <feColorMatrix type="matrix" values={mountainMatrix} />
            </filter>
          </defs>
        </svg>

        <div
          ref={baseArtStackRef}
          className={styles.baseArtStack}
          style={
            {
              "--mountain-mask-image": `url("${BACKGROUND_SCENE_ASSETS.masks.mountain}")`,
            } as CSSProperties
          }
        >
          {/* Native img required for SVG feColorMatrix filter url() on the base art layer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.baseArt}
            src={BACKGROUND_SCENE_ASSETS.base}
            alt=""
            aria-hidden
            draggable={false}
            style={{ filter: `url(#${globalFilterId})` }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.mountainArt}
            src={BACKGROUND_SCENE_ASSETS.base}
            alt=""
            aria-hidden
            draggable={false}
            style={
              {
                filter: `url(#${mountainFilterId})`,
                WebkitMaskSize: `${maskLayout.maskWidthPx}px ${maskLayout.maskHeightPx}px`,
                maskSize: `${maskLayout.maskWidthPx}px ${maskLayout.maskHeightPx}px`,
                WebkitMaskPosition: maskLayout.maskPosition,
                maskPosition: maskLayout.maskPosition,
              } as CSSProperties
            }
          />
        </div>
      </div>
    </div>
  );
}
