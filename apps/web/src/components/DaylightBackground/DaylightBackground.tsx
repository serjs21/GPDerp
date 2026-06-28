"use client";

import type { CSSProperties } from "react";
import type { SelectorBackgroundBodies } from "@/theme/celestialSelectorLayout";
import { getSkyMotionState } from "@/theme/themeSkyMotion";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { DAYLIGHT_ASSETS } from "./daylightAssets";
import styles from "./DaylightBackground.module.css";
import { DaylightCloud } from "./placeholders/DaylightCloud";
import { DaylightMoon } from "./placeholders/DaylightMoon";
import { DaylightMountains } from "./placeholders/DaylightMountains";
import { DaylightPaperTexture } from "./placeholders/DaylightPaperTexture";
import { DaylightShrine } from "./placeholders/DaylightShrine";
import { DaylightStars } from "./placeholders/DaylightStars";
import { DaylightSun } from "./placeholders/DaylightSun";
import { DaylightWater } from "./placeholders/DaylightWater";

const sunTransform = (x: number, y: number, scale: number) =>
  `translate(${x}vw, ${y}vh) scale(${scale})`;

const moonTransform = (scale: number) => `scale(${scale})`;

const celestialBodyWidth = "6rem";

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

function ScaleBackground({ progress }: DaylightBackgroundScaleProps) {
  const motion = getSkyMotionState(progress);
  const motionClass = styles.motionLayer;
  const cloudDrift = motion.clouds.driftX;

  return (
    <>
      <div className={styles.sky} />
      <DaylightPaperTexture />
      <DaylightStars style={{ opacity: motion.moon.opacity }} />
      <DaylightCloud
        src={DAYLIGHT_ASSETS.clouds[0]}
        className={`${motionClass} ${styles.cloudA}`}
        style={{
          opacity: motion.clouds.opacity,
          transform: `translateX(${cloudDrift}vw)`,
        }}
      />
      <DaylightCloud
        src={DAYLIGHT_ASSETS.clouds[1]}
        className={`${motionClass} ${styles.cloudB}`}
        style={{
          opacity: motion.clouds.opacity * 0.9,
          transform: `translateX(${cloudDrift * 1.4}vw)`,
        }}
      />
      <DaylightCloud
        src={DAYLIGHT_ASSETS.clouds[2]}
        className={`${motionClass} ${styles.cloudC}`}
        style={{
          opacity: motion.clouds.opacity * 0.75,
          transform: `translateX(${cloudDrift * 0.7}vw)`,
        }}
      />
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
      <DaylightMountains
        style={{
          opacity: motion.mountain.opacity,
        }}
      />
      <DaylightWater />
      <DaylightShrine />
    </>
  );
}

function CelestialBackground({
  backgroundBodies,
  showCelestialBodies = true,
}: DaylightBackgroundCelestialProps) {
  const bodySizeStyle = { width: celestialBodyWidth } as CSSProperties;

  return (
    <>
      <DaylightStars style={{ opacity: backgroundBodies.moon.opacity }} />
      <DaylightCloud
        src={DAYLIGHT_ASSETS.clouds[0]}
        className={styles.cloudA}
        style={{ opacity: 0.45 }}
      />
      <DaylightCloud
        src={DAYLIGHT_ASSETS.clouds[1]}
        className={styles.cloudB}
        style={{ opacity: 0.4 }}
      />
      <DaylightCloud
        src={DAYLIGHT_ASSETS.clouds[2]}
        className={styles.cloudC}
        style={{ opacity: 0.32 }}
      />
      {showCelestialBodies ? (
        <>
          <DaylightSun
            celestial={{
              x: backgroundBodies.sun.x,
              y: backgroundBodies.sun.y,
              opacity: backgroundBodies.sun.opacity,
            }}
            style={bodySizeStyle}
          />
          <DaylightMoon
            celestial={{
              x: backgroundBodies.moon.x,
              y: backgroundBodies.moon.y,
              opacity: backgroundBodies.moon.opacity,
              limbAngleDeg: backgroundBodies.moon.limbAngleDeg,
            }}
            style={bodySizeStyle}
          />
        </>
      ) : null}
      <DaylightMountains style={{ opacity: 1 }} />
      <DaylightWater />
      <DaylightShrine />
    </>
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
