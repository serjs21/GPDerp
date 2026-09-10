"use client";

import { motion, type Transition } from "motion/react";
import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import {
  complementaryCelestialOpacities,
  selectorCosmicRotationDeg,
} from "@/theme/celestialSelectorLayout";
import { celestialSelectorTransition } from "@/components/CelestialThemeSelector/celestialSelectorMotion";
import { ThemeSelectorNorthStar } from "@/components/CelestialThemeDial/ThemeSelectorNorthStar";
import { ThemeSelectorStars } from "@/components/CelestialThemeDial/ThemeSelectorStars";
import { STYLE_NAVIGATION_COMPASS } from "./styleNavigationCompass.config";
import styles from "./StyleNavigationWheel.module.css";

const MOTION_PERSPECTIVE_PX = 900;

export type StyleNavigationWheelPointerHandlers = {
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export type StyleNavigationWheelProps = {
  layout: SelectorDialLayout;
  slot: number;
  variant?: "panel" | "trigger";
  motionLayoutIdPrefix?: string;
  motionInstant?: boolean;
  className?: string;
  faceRef?: Ref<HTMLDivElement>;
  pointerHandlers?: StyleNavigationWheelPointerHandlers;
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
  pointerHandlers?: StyleNavigationWheelPointerHandlers;
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

function CompassRose() {
  const { src, scale, initialRotationDeg } = STYLE_NAVIGATION_COMPASS;
  return (
    <div
      className={styles.compass}
      style={{
        transform: `rotate(${initialRotationDeg}deg) scale(${scale})`,
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- public SVG controller asset */}
      <img src={src} alt="" className={styles.compassImg} draggable={false} />
    </div>
  );
}

/**
 * Style navigation wheel: star field + centered compass rose that rotates with slot.
 * Adapted from CelestialThemeDial without sun/moon/earth bodies.
 */
export function StyleNavigationWheel({
  layout,
  slot,
  variant = "panel",
  motionLayoutIdPrefix,
  motionInstant = false,
  className,
  faceRef,
  pointerHandlers,
  interactive = false,
}: StyleNavigationWheelProps) {
  const variantClass = variant === "trigger" ? styles.trigger : styles.panel;
  const interactiveClass = interactive ? styles.interactive : "";
  const cosmicRotationDeg = selectorCosmicRotationDeg(slot);
  const { moonOpacity } = complementaryCelestialOpacities(slot, layout);
  const layoutEnabled = Boolean(motionLayoutIdPrefix);
  const transition = celestialSelectorTransition(motionInstant);
  const layoutId = (suffix: string) =>
    motionLayoutIdPrefix ? `${motionLayoutIdPrefix}-${suffix}` : undefined;

  const cosmicFrameNode = (
    <MotionLayer
      layoutId={layoutId("cosmic-frame")}
      layoutEnabled={layoutEnabled}
      transition={transition}
      className={styles.cosmicFrame}
      style={{ transform: `rotate(${cosmicRotationDeg}deg)` }}
    >
      <ThemeSelectorStars opacity={moonOpacity} />
      <CompassRose />
    </MotionLayer>
  );

  return (
    <div
      className={`${styles.root} ${variantClass}${className ? ` ${className}` : ""}`}
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
