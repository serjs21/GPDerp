"use client";

import { useId } from "react";
import { motion } from "motion/react";
import type { AuthNavYinHovered } from "./authNavYinMotion";
import {
  AUTH_NAV_YIN_HOVER_PATH,
  AUTH_NAV_YIN_INITIAL_PATH,
  AUTH_NAV_YIN_VIEWBOX,
  authNavYinPathTransition,
  authNavYinRegionPaths,
} from "./authNavYinMotion";
import styles from "./style.module.css";

type YinBackgroundProps = {
  hovered: AuthNavYinHovered;
  reduceMotion: boolean;
};

type YinBackgroundLayerProps = YinBackgroundProps & {
  phase: "seam" | "split";
};

/** Two fills + seam stroke; pure visual layer. */
export const YinYangSegmentBackground = ({ hovered, reduceMotion }: YinBackgroundProps) => {
  const uid = useId().replace(/:/g, "");
  const clipId = `authYinClip-${uid}`;
  const { loginRegionD, registerRegionD } = authNavYinRegionPaths(hovered);
  const split = hovered !== null;
  const regionTr = authNavYinPathTransition(reduceMotion, true);
  const dividerTr = authNavYinPathTransition(reduceMotion, true);

  return (
    <motion.svg
      className={styles.authNavYinSvgLayer}
      viewBox={AUTH_NAV_YIN_VIEWBOX}
      preserveAspectRatio="none"
      aria-hidden
      initial={false}
      data-testid="auth-yin-liquids"
      data-auth-yin-liquids={split ? "split" : "seam"}
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <path d="M 22 0 H 298 A 22 22 0 0 1 320 22 A 22 22 0 0 1 298 44 H 22 A 22 22 0 0 1 0 22 A 22 22 0 0 1 22 0 Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <motion.path
          data-testid="auth-yin-liquid-accent"
          className={styles.authNavYinFillGlass}
          initial={false}
          animate={{ d: loginRegionD }}
          transition={regionTr}
        />
        <motion.path
          data-testid="auth-yin-liquid-glass"
          className={styles.authNavYinFillAccent}
          initial={false}
          animate={{ d: registerRegionD }}
          transition={regionTr}
        />
      </g>
      <motion.path
        className={styles.authNavYinDividerStroke}
        fill="none"
        strokeLinecap="round"
        initial={false}
        animate={{
          d: split ? AUTH_NAV_YIN_HOVER_PATH : AUTH_NAV_YIN_INITIAL_PATH,
          opacity: split ? 0 : 0.5,
        }}
        transition={dividerTr}
      />
    </motion.svg>
  );
};

/** Dedicated wrapper that owns all background paint/morphing. */
export const AuthNavYinBackgroundLayer = ({ hovered, reduceMotion, phase }: YinBackgroundLayerProps) => (
  <div className={styles.authNavYinBackgroundWrap} aria-hidden data-auth-yin-bg={phase}>
    <YinYangSegmentBackground hovered={hovered} reduceMotion={reduceMotion} />
  </div>
);

