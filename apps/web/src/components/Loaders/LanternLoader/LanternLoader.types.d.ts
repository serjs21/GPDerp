/** One pose of the lantern; the loader eases from each step to the next, then back to the first. */
export type LanternLoaderStep = {
  rotationDeg: number;
  /** Offset in % of the lantern's own width / height (+Y is down). */
  xPercent: number;
  yPercent: number;
  scale: number;
  opacity: number;
};

export type LanternLoaderProps = {
  className?: string;
  /** Rendered lantern width; height follows the SVG's aspect ratio. */
  widthRem?: number;
  steps?: readonly LanternLoaderStep[];
  /** Duration of each step-to-step transition; one loop takes steps.length x stepTransitionMs. */
  stepTransitionMs?: number;
};
