"use client";

import { motion, type Transition } from "motion/react";
import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import { selectorCosmicRotationDeg } from "@/theme/celestialSelectorLayout";
import { celestialSelectorTransition } from "@/components/CelestialThemeSelector/celestialSelectorMotion";
import { ThemeSelectorNorthStar } from "@/components/CelestialThemeDial/ThemeSelectorNorthStar";
import { STYLE_NAVIGATION_WHEEL } from "./styleNavigationWheel.config";
import styles from "./StyleNavigationWheel.module.css";

const MOTION_PERSPECTIVE_PX = 900;

export type StyleNavigationWheelPointerHandlers = {
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerMove?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
};

export type StyleNavigationWheelProps = {
  /** Kept for dial API parity; unused by the dual-SVG wheel visuals. */
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
  const { src, scale, initialRotationDeg } = STYLE_NAVIGATION_WHEEL.compass;
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

function StarsField() {
  const { src, scale, initialRotationDeg, spinDurationSec } =
    STYLE_NAVIGATION_WHEEL.stars;
  return (
    <div
      className={styles.stars}
      style={{
        transform: `rotate(${initialRotationDeg}deg) scale(${scale})`,
      }}
      aria-hidden
    >
      <div
        className={styles.starsSpin}
        style={
          {
            "--stars-spin-duration": `${spinDurationSec}s`,
          } as CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- public SVG field asset */}
        <img src={src} alt="" className={styles.starsImg} draggable={false} />
      </div>
    </div>
  );
}

/**
 * Style navigation wheel: stars + compass on one slot-rotated circle base.
 * Stars also self-spin at a configurable duration.
 */
export function StyleNavigationWheel({
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
  const layoutEnabled = Boolean(motionLayoutIdPrefix);
  const transition = celestialSelectorTransition(motionInstant);
  const layoutId = (suffix: string) =>
    motionLayoutIdPrefix ? `${motionLayoutIdPrefix}-${suffix}` : undefined;

  const circleBaseNode = (
    <MotionLayer
      layoutId={layoutId("circle-base")}
      layoutEnabled={layoutEnabled}
      transition={transition}
      className={styles.circleBase}
      style={{ transform: `rotate(${cosmicRotationDeg}deg)` }}
    >
      <StarsField />
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
        {/* <ThemeSelectorNorthStar slot={slot} /> */}
        {circleBaseNode}
      </MotionLayer>
    </div>
  );
}
