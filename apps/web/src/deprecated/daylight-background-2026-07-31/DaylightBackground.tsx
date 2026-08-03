"use client";

import type { CSSProperties } from "react";
import type { SelectorBackgroundBodies } from "@/theme/celestialSelectorLayout";
import { slotToDate } from "@/theme/celestialTime";
import { getThemeAt, type ThemeColors } from "@/theme/celestialTheme";
import { getSkyMotionState } from "@/theme/themeSkyMotion";
import { BANGKOK_COORDINATES } from "@/theme/useCelestialScene";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import {
  CELESTIAL_MOON_BODY_WIDTH_REM,
  CELESTIAL_SUN_BODY_WIDTH_REM,
} from "@/components/CelestialThemeDial/celestialDialProportions";
import {
  cycleDirectionFromScaleProgress,
  cycleDirectionFromSlot,
  geographicMaskLayersFromTheme,
  getBackgroundCycleState,
  slotFromScaleProgress,
  solarElevationFromScaleProgress,
  themeSkyGradient,
  type BackgroundCycleState,
  type GeographicMaskLayers,
} from "./daylightBackgroundCycle";
import { DAYLIGHT_BACKGROUND_MASK_STRENGTH } from "./daylightBackgroundMaskStrength.config";
import { DAYLIGHT_BACKGROUND_Z } from "./daylightBackgroundMasks.config";
import { DAYLIGHT_ASSETS } from "./daylightAssets";
import { DaylightMaskLayer } from "./DaylightMaskLayer";
import styles from "./DaylightBackground.module.css";
import { DaylightMoon } from "./placeholders/DaylightMoon";
import { DaylightSun } from "./placeholders/DaylightSun";

const sunTransform = (x: number, y: number, scale: number) =>
  `translate(${x}vw, ${y}vh) scale(${scale})`;

const moonTransform = (scale: number) => `scale(${scale})`;

const celestialSunWidth = `${CELESTIAL_SUN_BODY_WIDTH_REM}rem`;
const celestialMoonWidth = `${CELESTIAL_MOON_BODY_WIDTH_REM}rem`;

type DaylightBackgroundScaleProps = {
  mode?: "scale";
  progress: number;
};

type DaylightBackgroundCelestialProps = {
  mode: "celestial";
  backgroundBodies: SelectorBackgroundBodies;
  showCelestialBodies?: boolean;
  solarElevationDeg: number;
  slot: number;
  theme: ThemeColors;
};

export type DaylightBackgroundViewProps =
  | DaylightBackgroundScaleProps
  | DaylightBackgroundCelestialProps;

function isCelestialMode(
  props: DaylightBackgroundViewProps,
): props is DaylightBackgroundCelestialProps {
  return props.mode === "celestial";
}

function sceneStyle(cycle: BackgroundCycleState): CSSProperties {
  return {
    "--bg-brightness": String(cycle.brightness),
    "--bg-saturate": String(cycle.saturation),
    "--bg-scene-art": `url("${DAYLIGHT_ASSETS.background}")`,
  } as CSSProperties;
}

function SceneArtAndSky({ theme }: { theme: ThemeColors }) {
  const gradient = themeSkyGradient(theme);
  const { skyOpacity, horizonOpacity } = DAYLIGHT_BACKGROUND_MASK_STRENGTH;

  return (
    <>
      <div className={styles.sceneArt} />
      <DaylightMaskLayer
        maskUrl={DAYLIGHT_ASSETS.masks.sky}
        gradient={gradient}
        opacity={skyOpacity}
        blendMode="normal"
        zIndex={DAYLIGHT_BACKGROUND_Z.sky}
      />
      <DaylightMaskLayer
        maskUrl={DAYLIGHT_ASSETS.masks.horizon}
        gradient={gradient}
        opacity={horizonOpacity}
        blendMode="normal"
        zIndex={DAYLIGHT_BACKGROUND_Z.horizon}
      />
    </>
  );
}

function GeographicMaskLayers({ layers }: { layers: GeographicMaskLayers }) {
  return (
    <>
      <DaylightMaskLayer
        maskUrl={DAYLIGHT_ASSETS.masks.mountain}
        color={layers.mountain.color}
        opacity={layers.mountain.opacity}
        blendMode={layers.mountain.blendMode}
        zIndex={DAYLIGHT_BACKGROUND_Z.mountain}
      />
      <DaylightMaskLayer
        maskUrl={DAYLIGHT_ASSETS.masks.midground}
        color={layers.midground.color}
        opacity={layers.midground.opacity}
        blendMode={layers.midground.blendMode}
        zIndex={DAYLIGHT_BACKGROUND_Z.midground}
      />
      <DaylightMaskLayer
        maskUrl={DAYLIGHT_ASSETS.masks.foreground}
        color={layers.foreground.color}
        opacity={layers.foreground.opacity}
        blendMode={layers.foreground.blendMode}
        zIndex={DAYLIGHT_BACKGROUND_Z.foreground}
      />
    </>
  );
}

function ScaleBackground({ progress }: DaylightBackgroundScaleProps) {
  const motion = getSkyMotionState(progress);
  const elevation = solarElevationFromScaleProgress(progress);
  const direction = cycleDirectionFromScaleProgress(progress);
  const cycle = getBackgroundCycleState(elevation, direction);
  const theme = getThemeAt(
    slotToDate(slotFromScaleProgress(progress)),
    BANGKOK_COORDINATES,
  );
  const geographicLayers = geographicMaskLayersFromTheme(theme, cycle);

  return (
    <div className={styles.scene} style={sceneStyle(cycle)}>
      <SceneArtAndSky theme={theme} />
      <DaylightSun
        style={
          {
            opacity: motion.sun.opacity,
            transform: sunTransform(motion.sun.x, motion.sun.y, motion.sun.scale),
          } as CSSProperties
        }
      />
      <DaylightMoon
        style={
          {
            opacity: motion.moon.opacity,
            transform: moonTransform(motion.moon.scale),
          } as CSSProperties
        }
      />
      <GeographicMaskLayers layers={geographicLayers} />
    </div>
  );
}

function CelestialBackground({
  backgroundBodies,
  showCelestialBodies = true,
  solarElevationDeg,
  slot,
  theme,
}: DaylightBackgroundCelestialProps) {
  const sunSizeStyle = { width: celestialSunWidth } as CSSProperties;
  const moonSizeStyle = { width: celestialMoonWidth } as CSSProperties;
  const cycle = getBackgroundCycleState(
    solarElevationDeg,
    cycleDirectionFromSlot(slot),
  );
  const geographicLayers = geographicMaskLayersFromTheme(theme, cycle);

  return (
    <div className={styles.scene} style={sceneStyle(cycle)}>
      <SceneArtAndSky theme={theme} />
      {showCelestialBodies ? (
        <>
          <DaylightSun
            celestial={{
              x: backgroundBodies.sun.x,
              y: backgroundBodies.sun.y,
              opacity: backgroundBodies.sun.opacity,
            }}
            style={sunSizeStyle}
          />
          <DaylightMoon
            celestial={{
              x: backgroundBodies.moon.x,
              y: backgroundBodies.moon.y,
              opacity: backgroundBodies.moon.opacity,
              limbAngleDeg: backgroundBodies.moon.limbAngleDeg,
            }}
            style={moonSizeStyle}
          />
        </>
      ) : null}
      <GeographicMaskLayers layers={geographicLayers} />
    </div>
  );
}

export const DaylightBackgroundView = (props: DaylightBackgroundViewProps) => (
  <div className={styles.root} aria-hidden>
    {isCelestialMode(props) ? (
      <CelestialBackground {...props} />
    ) : (
      <ScaleBackground {...props} />
    )}
  </div>
);

export const DaylightBackground = () => {
  const { backgroundBodies, scene, effectiveSlot } = useCelestialTheme();

  return (
    <DaylightBackgroundView
      mode="celestial"
      backgroundBodies={backgroundBodies}
      showCelestialBodies
      solarElevationDeg={scene.layout.sun.altitudeDeg}
      slot={effectiveSlot}
      theme={scene.theme}
    />
  );
};
