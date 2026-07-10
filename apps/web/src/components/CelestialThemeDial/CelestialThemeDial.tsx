"use client";

import { motion, type Transition } from "motion/react";
import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import {
  complementaryCelestialOpacities,
  clampDialBodyCenterToFace,
  dialBodyDepthScale,
  dialBodyVisualScale,
  earthSunGradientAngleDeg,
  selectorCosmicRotationDeg,
  selectorViewerSunYPercent,
} from "@/theme/celestialSelectorLayout";
import { CELESTIAL_SELECTOR_BODY_SIZE } from "@/components/CelestialThemeSelector/celestialSelectorBodySize.config";
import { CELESTIAL_SELECTOR_DEPTH } from "@/components/CelestialThemeSelector/celestialSelectorDepth.config";
import { ThemeSelectorIcon } from "@/components/CelestialThemeClock/ThemeSelectorIcon";
import { celestialSelectorTransition } from "@/components/CelestialThemeSelector/celestialSelectorMotion";
import {
  CELESTIAL_SELECTOR_MOON_GLOW_BLEED_PERCENT,
  CELESTIAL_SELECTOR_SUN_GLOW_BLEED_PERCENT,
} from "@/components/CelestialThemeSelector/celestialSelectorNorthStar.config";
import { ThemeSelectorNorthStar } from "./ThemeSelectorNorthStar";
import { ThemeSelectorStars } from "./ThemeSelectorStars";
import styles from "./CelestialThemeDial.module.css";

const dialBodySizeVars = {
  "--dial-sun-size": `${CELESTIAL_SELECTOR_BODY_SIZE.sunSizePercent}%`,
  "--dial-moon-size": `${CELESTIAL_SELECTOR_BODY_SIZE.moonSizePercent}%`,
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
  sunOpacity: number,
  moonOpacity: number,
) {
  const sunDepth = dialBodyDepthScale(viewerSunY, "sun");
  const moonDepth = dialBodyDepthScale(viewerSunY, "moon");
  const sunScale = dialBodyVisualScale(sunDepth, sunOpacity);
  const moonScale = dialBodyVisualScale(moonDepth, moonOpacity);
  const sunEffectiveSize = CELESTIAL_SELECTOR_BODY_SIZE.sunSizePercent * sunScale;
  const moonEffectiveSize =
    CELESTIAL_SELECTOR_BODY_SIZE.moonSizePercent * moonScale;
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
      opacity: sunOpacity,
      transform: `translate(-50%, -50%) scale(${sunScale})`,
      zIndex: isNightHemisphere
        ? CELESTIAL_SELECTOR_DEPTH.zIndexFar
        : CELESTIAL_SELECTOR_DEPTH.zIndexNear,
    } as CSSProperties,
    moonStyle: {
      left: `${moon.x}%`,
      top: `${moon.y}%`,
      opacity: moonOpacity,
      transform: `translate(-50%, -50%) scale(${moonScale})`,
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
  const { sunOpacity, moonOpacity } = complementaryCelestialOpacities(slot, layout);
  const layoutEnabled = Boolean(motionLayoutIdPrefix);
  const transition = celestialSelectorTransition(motionInstant);
  const layoutId = (suffix: string) =>
    motionLayoutIdPrefix ? `${motionLayoutIdPrefix}-${suffix}` : undefined;
  const { sunStyle, moonStyle } = getSunMoonStyles(
    layout,
    viewerSunY,
    sunOpacity,
    moonOpacity,
  );
  const earthSunAngle = earthSunGradientAngleDeg(layout);

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

  return (
    <div
      className={`${styles.root} ${variantClass}${className ? ` ${className}` : ""}`}
      style={dialBodySizeVars}
    >
      <MotionLayer
        layoutId={layoutId("face")}
        layoutEnabled={layoutEnabled}
        transition={transition}
        className={`${styles.face}${interactiveClass ? ` ${interactiveClass}` : ""}`}
        elementRef={faceRef}
        pointerHandlers={interactive ? pointerHandlers : undefined}
      >
        <ThemeSelectorNorthStar slot={slot} />
        {cosmicFrameNode}
      </MotionLayer>
    </div>
  );
}
