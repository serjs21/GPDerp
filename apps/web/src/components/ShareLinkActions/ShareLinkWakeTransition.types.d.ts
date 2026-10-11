import type { SteppedTransitionProps } from "@/components/animations/SteppedTransition";

/**
 * Wake-animation segment. `waking` / `sleeping` hold on a mid frame while the
 * start / stop request is in flight; the others play out the request result.
 */
export type ShareLinkWakeSegment =
  | "waking"
  | "wakeConfirmed"
  | "wakeFailed"
  | "sleeping"
  | "sleepConfirmed"
  | "sleepFailed";

export type ShareLinkWakeTransitionProps = {
  /** Haiku subject, used in the accessible label. */
  subject: string;
  segment: ShareLinkWakeSegment;
  holdMs?: SteppedTransitionProps["holdMs"];
  crossfadeMs?: SteppedTransitionProps["crossfadeMs"];
  fadeMode?: SteppedTransitionProps["fadeMode"];
  reducedMotion?: SteppedTransitionProps["reducedMotion"];
  /** Fires when the segment reaches its last frame. */
  onComplete?: SteppedTransitionProps["onComplete"];
};
