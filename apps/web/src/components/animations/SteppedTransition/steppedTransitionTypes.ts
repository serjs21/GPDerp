export type TransitionPose = {
  /** 0–1 position along the source trajectory. */
  progress: number;
  x: number;
  y: number;
  rotation: number;
  scale?: number;
  opacity?: number;
};

export type SteppedPoseRole = "outgoing" | "incoming" | "smear" | "solo";

/** How pose intervals blend when crossfadeMs > 0. */
export type SteppedFadeMode =
  /** Overlap outgoing 1→0 with incoming 0→1 (delete flight ghosting). */
  | "crossfade"
  /** Fade outgoing 1→0, then hard-cut to the next pose at full opacity. */
  | "outThenCut";

export type SteppedTransitionLayer = {
  pose: TransitionPose;
  opacity: number;
  role: SteppedPoseRole;
  key: string;
};
