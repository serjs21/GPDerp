"use client";

import type { CSSProperties } from "react";
import { useThemeScaleProgress } from "@/hooks/useThemeScaleProgress";
import { getSkyMotionState } from "@/theme/themeSkyMotion";
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

type DaylightBackgroundViewProps = {
  progress: number;
};

export const DaylightBackgroundView = ({ progress }: DaylightBackgroundViewProps) => {
  const motion = getSkyMotionState(progress);
  const motionClass = styles.motionLayer;
  const cloudDrift = motion.clouds.driftX;

  return (
    <div className={styles.root} aria-hidden>
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
    </div>
  );
};

export const DaylightBackground = () => {
  const progress = useThemeScaleProgress();
  return <DaylightBackgroundView progress={progress} />;
};
