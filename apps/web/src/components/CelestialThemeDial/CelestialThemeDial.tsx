"use client";

import { motion, type Transition } from "motion/react";
import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import {
  backgroundSunVisibilityFromDialY,
  clampDialBodyCenterToFace,
  dialBodyDepthScale,
  earthSunGradientAngleDeg,
  selectorCosmicRotationDeg,
  selectorViewerSunYPercent,
} from "@/theme/celestialSelectorLayout";
import { CELESTIAL_SELECTOR_DEPTH } from "@/components/CelestialThemeSelector/celestialSelectorDepth.config";
import { ThemeSelectorIcon } from "@/components/CelestialThemeClock/ThemeSelectorIcon";
import { celestialSelectorTransition } from "@/components/CelestialThemeSelector/celestialSelectorMotion";
import {
  CELESTIAL_SELECTOR_MOON_GLOW_BLEED_PERCENT,
  CELESTIAL_SELECTOR_SUN_GLOW_BLEED_PERCENT,
} from "@/components/CelestialThemeSelector/celestialSelectorNorthStar.config";
import { SELECTOR_SUN_SIZE_RATIO } from "./celestialDialProportions";
import { ThemeSelectorNorthStar } from "./ThemeSelectorNorthStar";
import { ThemeSelectorStars } from "./ThemeSelectorStars";
import styles from "./CelestialThemeDial.module.css";

const SUN_SIZE_PERCENT = SELECTOR_SUN_SIZE_RATIO * 100;
const MOON_SIZE_PERCENT = 12;

const dialBodySizeVars = {
  "--dial-sun-size": `${SUN_SIZE_PERCENT}%`,
  "--dial-moon-size": `${MOON_SIZE_PERCENT}%`,
} as CSSProperties;

const MOTION_PERSPECTIVE_PX = 900;

export type CelestialThemeDialPointerHandlers = {
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export type CelestialThemeDialProps = {
  layout: SelectorDialLayout;
  slot: number;
  variant?: "panel" | "trigger";
  showBodyGlow?: boolean;
  motionLayoutIdPrefix?: string;
  motionInstant?: boolean;
  className?: string;
  faceRef?: Ref<HTMLDivElement>;
  pointerHandlers?: CelestialThemeDialPointerHandlers;
  interactive?: boolean;
};

type MotionLayerProps = {
  layoutId?: string;
  layoutEnabled: boolean;
  transition: Transition;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  elementRef?: Ref<HTMLDivElement>;
  pointerHandlers?: CelestialThemeDialPointerHandlers;
};

function MotionLayer({
  layoutId,
  layoutEnabled,
  transition,
  className,
  style,
  children,
  elementRef,
  pointerHandlers,
}: MotionLayerProps) {
  if (!layoutEnabled || !layoutId) {
    return (
      <div
        ref={elementRef}
        className={className}
        style={style}
        {...pointerHandlers}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={elementRef}
      layoutId={layoutId}
      layout
      transition={transition}
      className={className}
      style={{ ...style, transformPerspective: MOTION_PERSPECTIVE_PX }}
      {...pointerHandlers}
    >
      {children}
    </motion.div>
  );
}

function getSunMoonStyles(
  layout: SelectorDialLayout,
  viewerSunY: number,
  moonOpacity: number,
) {
  const sunDepth = dialBodyDepthScale(viewerSunY, "sun");
  const moonDepth = dialBodyDepthScale(viewerSunY, "moon");
  const sunEffectiveSize = SUN_SIZE_PERCENT * sunDepth;
  const moonEffectiveSize = MOON_SIZE_PERCENT * moonDepth;
  const isNightHemisphere = viewerSunY > 50;

  const sun = clampDialBodyCenterToFace(
    layout.sun.x,
    layout.sun.y,
    sunEffectiveSize,
    CELESTIAL_SELECTOR_SUN_GLOW_BLEED_PERCENT,
  );
  const moon = clampDialBodyCenterToFace(
    layout.moon.x,
    layout.moon.y,
    moonEffectiveSize,
    CELESTIAL_SELECTOR_MOON_GLOW_BLEED_PERCENT,
  );

  return {
    sunStyle: {
      left: `${sun.x}%`,
      top: `${sun.y}%`,
      opacity: 1,
      transform: `translate(-50%, -50%) scale(${sunDepth})`,
      zIndex: isNightHemisphere
        ? CELESTIAL_SELECTOR_DEPTH.zIndexFar
        : CELESTIAL_SELECTOR_DEPTH.zIndexNear,
    } as CSSProperties,
    moonStyle: {
      left: `${moon.x}%`,
      top: `${moon.y}%`,
      opacity: moonOpacity,
      transform: `translate(-50%, -50%) scale(${moonDepth})`,
      zIndex: isNightHemisphere
        ? CELESTIAL_SELECTOR_DEPTH.zIndexNear
        : CELESTIAL_SELECTOR_DEPTH.zIndexFar,
    } as CSSProperties,
  };
}

export function CelestialThemeDial({
  layout,
  slot,
  variant = "panel",
  showBodyGlow = false,
  motionLayoutIdPrefix,
  motionInstant = false,
  className,
  faceRef,
  pointerHandlers,
  interactive = false,
}: CelestialThemeDialProps) {
  const variantClass = variant === "trigger" ? styles.trigger : styles.panel;
  const interactiveClass = interactive ? styles.interactive : "";
  const viewerSunY = selectorViewerSunYPercent(slot);
  const cosmicRotationDeg = selectorCosmicRotationDeg(slot);
  const arcHidden = backgroundSunVisibilityFromDialY(viewerSunY) === 0;
  const moonOpacity = arcHidden ? 1 : layout.moon.opacity;
  const layoutEnabled = Boolean(motionLayoutIdPrefix);
  const transition = celestialSelectorTransition(motionInstant);
  const layoutId = (suffix: string) =>
    motionLayoutIdPrefix ? `${motionLayoutIdPrefix}-${suffix}` : undefined;
  const { sunStyle, moonStyle } = getSunMoonStyles(
    layout,
    viewerSunY,
    moonOpacity,
  );
  const earthSunAngle = earthSunGradientAngleDeg(layout);

  const northStarNode = (
    <ThemeSelectorNorthStar slot={slot} />
  );

  const cosmicFrameNode = layoutEnabled ? (
    <MotionLayer
      layoutId={layoutId("cosmic-frame")}
      layoutEnabled={layoutEnabled}
      transition={transition}
      className={styles.cosmicFrame}
      style={{ transform: `rotate(${cosmicRotationDeg}deg)` }}
    >
      <ThemeSelectorStars opacity={moonOpacity} />
      <MotionLayer
        layoutId={layoutId("sun")}
        layoutEnabled={layoutEnabled}
        transition={transition}
        className={`${styles.bodySun} ${styles.bodyLocal}`}
        style={sunStyle}
      >
        <ThemeSelectorIcon variant="sun" showGlow={showBodyGlow} />
      </MotionLayer>
      <MotionLayer
        layoutId={layoutId("moon")}
        layoutEnabled={layoutEnabled}
        transition={transition}
        className={`${styles.bodyMoon} ${styles.bodyLocal}`}
        style={moonStyle}
      >
        <ThemeSelectorIcon variant="moon" />
      </MotionLayer>
      <MotionLayer
        layoutId={layoutId("earth")}
        layoutEnabled={layoutEnabled}
        transition={transition}
        className={styles.earthFrame}
      >
        <ThemeSelectorIcon
          variant="earth"
          className={styles.earth}
          style={
            {
              "--earth-sun-angle": `${earthSunAngle}deg`,
            } as CSSProperties
          }
        />
      </MotionLayer>
    </MotionLayer>
  ) : (
    <div
      className={styles.cosmicFrame}
      style={{ transform: `rotate(${cosmicRotationDeg}deg)` }}
    >
      <ThemeSelectorStars opacity={moonOpacity} />
      <div className={`${styles.bodySun} ${styles.bodyLocal}`} style={sunStyle}>
        <ThemeSelectorIcon variant="sun" showGlow={showBodyGlow} />
      </div>
      <div className={`${styles.bodyMoon} ${styles.bodyLocal}`} style={moonStyle}>
        <ThemeSelectorIcon variant="moon" />
      </div>
      <div className={styles.earthFrame}>
        <ThemeSelectorIcon
          variant="earth"
          className={styles.earth}
          style={
            {
              "--earth-sun-angle": `${earthSunAngle}deg`,
            } as CSSProperties
          }
        />
      </div>
    </div>
  );

  const faceNode = (
    <MotionLayer
      layoutId={layoutId("face")}
      layoutEnabled={layoutEnabled}
      transition={transition}
      className={`${styles.face}${interactiveClass ? ` ${interactiveClass}` : ""}`}
      elementRef={faceRef}
      pointerHandlers={interactive ? pointerHandlers : undefined}
    >
      {northStarNode}
      {cosmicFrameNode}
    </MotionLayer>
  );

  return (
    <div
      className={`${styles.root} ${variantClass}${className ? ` ${className}` : ""}`}
      style={dialBodySizeVars}
    >
      {faceNode}
    </div>
  );
}
