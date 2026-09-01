import type { Transition, Variants } from "motion/react";
import { PAPER_COLORS } from "./paperTokens";

export type PaperMotionPreset =
  | "dropSettle"
  | "accordion"
  | "pageCurl"
  | "windBlown"
  | "inkReveal";

export type PaperMotionBundle = {
  overlay: Variants;
  paper: Variants;
  reducedPaper: Variants;
  reducedOverlay: Variants;
};

/** Soft ease-out — decelerates into rest (zen settle). */
const easeOutSoft = [0.22, 1, 0.36, 1] as const;
/** Gentle ease-in-out for lifts. */
const easeInOutSoft = [0.45, 0.05, 0.25, 1] as const;

const overlayTransition: Transition = { duration: 0.55, ease: easeOutSoft };

const dropSettleShadowRest = `0 0.85rem 2rem ${PAPER_COLORS.shadow}, 0 0.2rem 0.45rem rgba(40, 30, 20, 0.12)`;
const dropSettleShadowLift = `0 1.4rem 2.6rem rgba(40, 30, 20, 0.22), 0 0.3rem 0.6rem rgba(40, 30, 20, 0.12)`;
const dropSettleShadowExit = `0 0.5rem 1.2rem rgba(40, 30, 20, 0.14)`;

const paperEnterTransition: Transition = {
  duration: 1.05,
  ease: easeOutSoft,
};

const paperExitTransition: Transition = {
  duration: 0.55,
  ease: easeInOutSoft,
};

const dropSettle: PaperMotionBundle = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: overlayTransition },
    exit: { opacity: 0, transition: { duration: 0.45, ease: easeInOutSoft } },
  },
  paper: {
    initial: {
      y: -28,
      rotate: -1.2,
      scale: 0.985,
      opacity: 0,
      boxShadow: dropSettleShadowLift,
    },
    animate: {
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      boxShadow: dropSettleShadowRest,
      transition: paperEnterTransition,
    },
    exit: {
      y: -18,
      rotate: 0.8,
      scale: 0.99,
      opacity: 0,
      boxShadow: dropSettleShadowExit,
      transition: paperExitTransition,
    },
  },
  reducedOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.16 } },
  },
  reducedPaper: {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeOutSoft } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.2 } },
  },
};

/** Implemented presets. Unimplemented ids resolve to dropSettle. */
const PAPER_MOTION_PRESETS: Record<"dropSettle", PaperMotionBundle> = {
  dropSettle,
};

export function resolvePaperMotion(preset: PaperMotionPreset = "dropSettle"): PaperMotionBundle {
  if (preset === "dropSettle") return PAPER_MOTION_PRESETS.dropSettle;
  // accordion | pageCurl | windBlown | inkReveal — reserved; fall back for now
  return PAPER_MOTION_PRESETS.dropSettle;
}
