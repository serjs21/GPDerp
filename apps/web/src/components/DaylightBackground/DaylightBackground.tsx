"use client";

import type { CSSProperties } from "react";
import { useThemeScaleProgress } from "@/hooks/useThemeScaleProgress";
import { getSkyMotionState } from "@/theme/themeSkyMotion";
import styles from "./DaylightBackground.module.css";
import { DaylightCloud } from "./placeholders/DaylightCloud";
import { DaylightMoon } from "./placeholders/DaylightMoon";
import { DaylightMountains } from "./placeholders/DaylightMountains";
import { DaylightSun } from "./placeholders/DaylightSun";

const skyTransform = (x: number, y: number, scale: number) =>
  `translate(-50%, -50%) translate(${x}vw, ${y}vh) scale(${scale})`;

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
      <DaylightCloud
        className={`${motionClass} ${styles.cloudA}`}
        style={{
          opacity: motion.clouds.opacity,
          transform: `translateX(${cloudDrift}vw)`,
        }}
      />
      <DaylightCloud
        className={`${motionClass} ${styles.cloudB}`}
        style={{
          opacity: motion.clouds.opacity * 0.9,
          transform: `translateX(${cloudDrift * 1.4}vw)`,
        }}
      />
      <DaylightCloud
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
            transform: skyTransform(motion.sun.x, motion.sun.y, motion.sun.scale),
          } as CSSProperties
        }
      />
      <DaylightMoon
        style={
          {
            opacity: motion.moon.opacity,
            transform: skyTransform(motion.moon.x, motion.moon.y, motion.moon.scale),
          } as CSSProperties
        }
      />
      <DaylightMountains
        style={{
          opacity: motion.mountain.opacity,
        }}
      />
    </div>
  );
};

export const DaylightBackground = () => {
  const progress = useThemeScaleProgress();
  return <DaylightBackgroundView progress={progress} />;
};
