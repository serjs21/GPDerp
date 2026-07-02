"use client";

import { motion, type Transition } from "motion/react";
import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import {
  backgroundSunVisibilityFromDialY,
  clampDialBodyCenterToFace,
  earthSunGradientAngleDeg,
} from "@/theme/celestialSelectorLayout";
import { ThemeSelectorIcon } from "@/components/CelestialThemeClock/ThemeSelectorIcon";
import { celestialSelectorTransition } from "@/components/CelestialThemeSelector/celestialSelectorMotion";
import {
  CELESTIAL_SELECTOR_MOON_GLOW_BLEED_PERCENT,
  CELESTIAL_SELECTOR_SUN_GLOW_BLEED_PERCENT,
} from "@/components/CelestialThemeSelector/celestialSelectorNorthStar.config";
import {
  selectorButtonStackFromPresentation,
  type ButtonBodyPlacement,
} from "@/components/CelestialThemeSelector/celestialSelectorButton.config";
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

export type CelestialThemeDialPresentation =
  | "orbit"
  | "buttonDay"
  | "buttonNight";

export type CelestialThemeDialPointerHandlers = {
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export type CelestialThemeDialProps = {
  layout: SelectorDialLayout;
  variant?: "panel" | "trigger";
  presentation?: CelestialThemeDialPresentation;
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

function bodyPlacementStyle(placement: ButtonBodyPlacement): CSSProperties {
  return {
    left: placement.left,
    top: placement.top,
    width: placement.width,
    zIndex: placement.zIndex,
    opacity: placement.opacity,
  };
}

function getSunMoonStyles(
  isOrbit: boolean,
  layout: SelectorDialLayout,
  buttonStack: ReturnType<typeof selectorButtonStackFromPresentation> | null,
  moonOpacity: number,
) {
  if (isOrbit || !buttonStack) {
    const sun = clampDialBodyCenterToFace(
      layout.sun.x,
      layout.sun.y,
      SUN_SIZE_PERCENT,
      CELESTIAL_SELECTOR_SUN_GLOW_BLEED_PERCENT,
    );
    const moon = clampDialBodyCenterToFace(
      layout.moon.x,
      layout.moon.y,
      MOON_SIZE_PERCENT,
      CELESTIAL_SELECTOR_MOON_GLOW_BLEED_PERCENT,
    );

    return {
      sunStyle: {
        left: `${sun.x}%`,
        top: `${sun.y}%`,
        opacity: 1,
      } as CSSProperties,
      moonStyle: {
        left: `${moon.x}%`,
        top: `${moon.y}%`,
        opacity: moonOpacity,
      } as CSSProperties,
      sunClassName: styles.bodySun,
      moonClassName: styles.bodyMoon,
    };
  }

  return {
    sunStyle: bodyPlacementStyle(buttonStack.sun),
    moonStyle: bodyPlacementStyle(buttonStack.moon),
    sunClassName: styles.bodyStacked,
    moonClassName: styles.bodyStacked,
  };
}

export function CelestialThemeDial({
  layout,
  variant = "panel",
  presentation = "orbit",
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
  const isOrbit = presentation === "orbit";
  const buttonStack = isOrbit
    ? null
    : selectorButtonStackFromPresentation(presentation);
  const arcHidden = backgroundSunVisibilityFromDialY(layout.sun.y) === 0;
  const moonOpacity = arcHidden ? 1 : layout.moon.opacity;
  const layoutEnabled = Boolean(motionLayoutIdPrefix);
  const transition = celestialSelectorTransition(motionInstant);
  const layoutId = (suffix: string) =>
    motionLayoutIdPrefix ? `${motionLayoutIdPrefix}-${suffix}` : undefined;
  const { sunStyle, moonStyle, sunClassName, moonClassName } = getSunMoonStyles(
    isOrbit,
    layout,
    buttonStack,
    moonOpacity,
  );

  const northStarNode = layoutEnabled ? (
    <MotionLayer
      layoutId={layoutId("north-star")}
      layoutEnabled={layoutEnabled}
      transition={transition}
      className={styles.bodyNorthStar}
    >
      <ThemeSelectorNorthStar layout={layout} />
    </MotionLayer>
  ) : (
    <div className={styles.bodyNorthStar}>
      <ThemeSelectorNorthStar layout={layout} />
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
      {isOrbit ? <ThemeSelectorStars opacity={moonOpacity} /> : null}
      {northStarNode}
      <MotionLayer
        layoutId={layoutId("sun")}
        layoutEnabled={layoutEnabled}
        transition={transition}
        className={sunClassName}
        style={sunStyle}
      >
        <ThemeSelectorIcon variant="sun" showGlow={showBodyGlow && isOrbit} />
      </MotionLayer>
      <MotionLayer
        layoutId={layoutId("moon")}
        layoutEnabled={layoutEnabled}
        transition={transition}
        className={moonClassName}
        style={moonStyle}
      >
        <ThemeSelectorIcon variant="moon" />
      </MotionLayer>
      <MotionLayer
        layoutId={layoutId("earth")}
        layoutEnabled={layoutEnabled}
        transition={transition}
        className={styles.earthFrame}
        style={{ transform: `rotate(${layout.earthRotationDeg}deg)` }}
      >
        <ThemeSelectorIcon
          variant="earth"
          className={styles.earth}
          style={
            {
              "--earth-sun-angle": `${earthSunGradientAngleDeg(layout)}deg`,
            } as CSSProperties
          }
        />
      </MotionLayer>
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
