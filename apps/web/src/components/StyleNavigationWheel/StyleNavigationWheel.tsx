"use client";

import { motion, type Transition } from "motion/react";
import type { CSSProperties, PointerEventHandler, ReactNode, Ref } from "react";
import type { SelectorDialLayout } from "@/theme/celestialSelectorLayout";
import {
  complementaryCelestialOpacities,
  selectorCosmicRotationDeg,
} from "@/theme/celestialSelectorLayout";
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

function StarClusters({ nightOpacity }: { nightOpacity: number }) {
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
              opacity: cluster.opacity * nightOpacity,
              "--stars-size": `${cluster.sizePercent}%`,
              transform: `translate(-50%, -50%) rotate(${cluster.rotationDeg}deg)`,
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

function FixedSun({ opacity }: { opacity: number }) {
  const { src, sizePercent, leftPercent, topPercent } = STYLE_NAVIGATION_WHEEL.sun;
  return (
    <div
      className={styles.fixedBody}
      style={
        {
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          opacity,
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

function FixedMoon({ opacity }: { opacity: number }) {
  const { src, sizePercent, leftPercent, topPercent, spinDurationSec } =
    STYLE_NAVIGATION_WHEEL.moon;
  return (
    <div
      className={styles.fixedBody}
      style={
        {
          left: `${leftPercent}%`,
          top: `${topPercent}%`,
          opacity,
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
 * Sun/moon stay fixed on the face; celestial opacities crossfade with slot.
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
  const { sunOpacity, moonOpacity } = complementaryCelestialOpacities(slot, layout);
  const layoutEnabled = Boolean(motionLayoutIdPrefix);
  const transition = celestialSelectorTransition(motionInstant);
  const layoutId = (suffix: string) =>
    motionLayoutIdPrefix ? `${motionLayoutIdPrefix}-${suffix}` : undefined;

  const circleBaseNode = (
    <MotionLayer
      layoutId={layoutId("circle-base")}
      layoutEnabled={layoutEnabled}
      transition={transition}
      className={styles.circleBaseShell}
    >
      {/* Rotate on an inner node so shared-layout Motion does not overwrite slot transform. */}
      <div
        className={styles.circleBase}
        style={{ transform: `rotate(${cosmicRotationDeg}deg)` }}
      >
        <div className={styles.faceClip}>
          <StarClusters nightOpacity={moonOpacity} />
          <CompassRose />
          <EarthIcon />
        </div>
        {/* Sibling of faceClip so half the SVG can render outside the rim. */}
        <StarsField />
      </div>
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
        <div className={styles.faceDisc}>
          <FixedSun opacity={sunOpacity} />
          <FixedMoon opacity={moonOpacity} />
        </div>
        {circleBaseNode}
      </MotionLayer>
    </div>
  );
}
