"use client";

import { motion } from "motion/react";
import type { AuthNavYinHovered, AuthNavYinSegment } from "./authNavYinMotion";
import { authNavYinHitOpacity, authNavYinSegmentFlex } from "./authNavYinMotion";
import styles from "./style.module.css";

const MotionSegment = motion.div;
const MotionHitButton = motion.button;

type AuthNavYinSegmentProps = {
  segment: AuthNavYinSegment;
  hovered: AuthNavYinHovered;
  onHover: (segment: AuthNavYinSegment) => void;
  onClick: () => void;
  segmentTransition: { duration: number } | { type: "tween"; duration: number; ease: readonly number[] };
  hitTransition:
    | { duration: number }
    | { type: "tween"; duration: number; ease: "easeOut" }
    | { type: "tween"; duration: number; ease: readonly number[] };
  tapScale: { scale: number } | undefined;
};

export const AuthNavYinSegmentControl = ({
  segment,
  hovered,
  onHover,
  onClick,
  segmentTransition,
  hitTransition,
  tapScale,
}: AuthNavYinSegmentProps) => {
  const isLogin = segment === "login";
  const label = isLogin ? "Login" : "Register";
  const className = isLogin ? styles.authNavYinLinkLogin : styles.authNavYinLinkRegister;
  const otherHovered = isLogin ? hovered === "register" : hovered === "login";

  return (
    <MotionSegment
      className={styles.authNavYinSegment}
      initial={false}
      animate={{ flexGrow: authNavYinSegmentFlex(hovered, segment) }}
      transition={segmentTransition}
      onPointerEnter={() => onHover(segment)}
    >
      <MotionHitButton
        type="button"
        className={`${styles.authNavYinHitButton} ${className}`}
        initial={false}
        animate={{ opacity: authNavYinHitOpacity(hovered, segment) }}
        transition={hitTransition}
        whileTap={tapScale}
        style={{ pointerEvents: otherHovered ? "none" : "auto" }}
        onClick={onClick}
        tabIndex={otherHovered ? -1 : 0}
      >
        {label}
      </MotionHitButton>
    </MotionSegment>
  );
};

