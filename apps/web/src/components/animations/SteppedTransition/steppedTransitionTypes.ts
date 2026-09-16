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

export type SteppedTransitionLayer = {
  pose: TransitionPose;
  opacity: number;
  role: SteppedPoseRole;
  key: string;
};
