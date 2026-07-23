"use client";

import type { CSSProperties } from "react";
import type { SelectorBackgroundBodies } from "@/theme/celestialSelectorLayout";
import { getSkyMotionState } from "@/theme/themeSkyMotion";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import {
  CELESTIAL_MOON_BODY_WIDTH_REM,
  CELESTIAL_SUN_BODY_WIDTH_REM,
} from "@/components/CelestialThemeDial/celestialDialProportions";
import { backgroundGradeFromDayFactor } from "./daylightBackgroundGrade.config";
import { DAYLIGHT_ASSETS } from "./daylightAssets";
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
};

export type DaylightBackgroundViewProps =
  | DaylightBackgroundScaleProps
  | DaylightBackgroundCelestialProps;

function isCelestialMode(
  props: DaylightBackgroundViewProps,
): props is DaylightBackgroundCelestialProps {
  return props.mode === "celestial";
}

function gradeStyle(dayFactor: number): CSSProperties {
  const grade = backgroundGradeFromDayFactor(dayFactor);
  return {
    "--bg-brightness": String(grade.brightness),
    "--bg-contrast": String(grade.contrast),
    "--bg-saturate": String(grade.saturate),
    "--bg-soft-light-opacity": String(grade.softLightOpacity),
    "--bg-multiply-opacity": String(grade.multiplyOpacity),
    "--bg-balance-red-opacity": String(grade.redOpacity),
    "--bg-balance-blue-opacity": String(grade.blueOpacity),
    "--bg-balance-yellow-opacity": String(grade.yellowOpacity),
    "--bg-scene-art": `url("${DAYLIGHT_ASSETS.background}")`,
  } as CSSProperties;
}

function SceneGradeLayers() {
  return (
    <>
      <div className={styles.sceneArt} />
      <div className={styles.themeSoftLight} />
      <div className={styles.balanceRed} />
      <div className={styles.balanceYellow} />
      <div className={styles.balanceBlue} />
      <div className={styles.themeMultiply} />
    </>
  );
}

function ScaleBackground({ progress }: DaylightBackgroundScaleProps) {
  const motion = getSkyMotionState(progress);
  const dayFactor = motion.sun.opacity;

  return (
    <div className={styles.scene} style={gradeStyle(dayFactor)}>
      <SceneGradeLayers />
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
    </div>
  );
}

function CelestialBackground({
  backgroundBodies,
  showCelestialBodies = true,
}: DaylightBackgroundCelestialProps) {
  const sunSizeStyle = { width: celestialSunWidth } as CSSProperties;
  const moonSizeStyle = { width: celestialMoonWidth } as CSSProperties;
  const dayFactor = backgroundBodies.sun.opacity;

  return (
    <div className={styles.scene} style={gradeStyle(dayFactor)}>
      <SceneGradeLayers />
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
  const { backgroundBodies } = useCelestialTheme();

  return (
    <DaylightBackgroundView
      mode="celestial"
      backgroundBodies={backgroundBodies}
      showCelestialBodies
    />
  );
};
