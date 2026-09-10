"use client";

import { motion, type Transition } from "motion/react";
import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import { selectorCosmicRotationDeg } from "@/theme/celestialSelectorLayout";
import { celestialSelectorTransition } from "@/components/CelestialThemeSelector/celestialSelectorMotion";
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
  const {
    src,
    sizePercent,
    initialRotationDeg,
    spinDurationSec,
    leftPercent,
    topPercent,
  } = STYLE_NAVIGATION_WHEEL.stars;
  return (
    <div
      className={styles.stars}
      style={
        {
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          "--stars-size": `${sizePercent}%`,
          transform: `translate(-50%, -50%) rotate(${initialRotationDeg}deg)`,
        } as CSSProperties
      }
      aria-hidden
    >
      <div
        className={styles.selfSpin}
        style={
          {
            "--self-spin-duration": `${spinDurationSec}s`,
          } as CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- public SVG field asset */}
        <img src={src} alt="" className={styles.starsImg} draggable={false} />
      </div>
    </div>
  );
}

function StarClusters() {
  const { src, items } = STYLE_NAVIGATION_WHEEL.starClusters;
  return (
    <>
      {items.map((cluster, index) => (
        <div
          key={`star-cluster-${index}`}
          className={styles.starCluster}
          style={
            {
              left: `${cluster.leftPercent}%`,
              top: `${cluster.topPercent}%`,
              "--stars-size": `${cluster.sizePercent}%`,
            } as CSSProperties
          }
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- public SVG cluster asset */}
          <img src={src} alt="" className={styles.starClusterImg} draggable={false} />
        </div>
      ))}
    </>
  );
}

function EarthIcon() {
  const { src, sizePercent } = STYLE_NAVIGATION_WHEEL.earth;
  return (
    <div className={styles.earth} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- public SVG body asset */}
      <img
        src={src}
        alt=""
        className={styles.earthImg}
        style={{ width: `${sizePercent}%`, height: "auto" }}
        draggable={false}
      />
    </div>
  );
}

function FixedSun() {
  const { src, sizePercent, leftPercent, topPercent } = STYLE_NAVIGATION_WHEEL.sun;
  return (
    <div
      className={styles.fixedBody}
      style={
        {
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          "--body-size": `${sizePercent}%`,
        } as CSSProperties
      }
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- public SVG body asset */}
      <img src={src} alt="" className={styles.fixedBodyImg} draggable={false} />
    </div>
  );
}

function FixedMoon() {
  const { src, sizePercent, leftPercent, topPercent, spinDurationSec } =
    STYLE_NAVIGATION_WHEEL.moon;
  return (
    <div
      className={styles.fixedBody}
      style={
        {
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          "--body-size": `${sizePercent}%`,
        } as CSSProperties
      }
      aria-hidden
    >
      <div
        className={styles.fixedBodySpin}
        style={
          {
            "--body-spin-duration": `${spinDurationSec}s`,
          } as CSSProperties
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- public SVG body asset */}
        <img src={src} alt="" className={styles.fixedBodyImg} draggable={false} />
      </div>
    </div>
  );
}

/**
 * Style navigation wheel: stars + compass + earth on one slot-rotated circle base.
 * Sun/moon stay fixed on the face; moon also self-spins.
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
      <StarClusters />
      <StarsField />
      <CompassRose />
      <EarthIcon />
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
        {circleBaseNode}
        <FixedSun />
        <FixedMoon />
      </MotionLayer>
    </div>
  );
}
