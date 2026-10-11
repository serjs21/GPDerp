import type { SteppedTransitionProps } from "@/components/animations/SteppedTransition";

export type ShareLinkWakeTransitionProps = {
  /** Haiku subject, used in the accessible label. */
  subject: string;
  /** Plays the wake-up sequence; while false the not-started frame is shown. */
  playing: boolean;
  holdMs?: SteppedTransitionProps["holdMs"];
  crossfadeMs?: SteppedTransitionProps["crossfadeMs"];
  fadeMode?: SteppedTransitionProps["fadeMode"];
  reducedMotion?: SteppedTransitionProps["reducedMotion"];
  onComplete?: SteppedTransitionProps["onComplete"];
};
