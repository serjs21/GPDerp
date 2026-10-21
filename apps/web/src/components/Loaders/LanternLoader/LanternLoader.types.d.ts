/** One still frame of the lantern; the loader cuts from each step to the next, then back to the first. */
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
  /** How long each step holds before cutting to the next; one loop takes steps.length x stepTransitionMs. */
  stepTransitionMs?: number;
  /** Center of the "Loading" text, in % of the lantern's width / height. */
  textXPercent?: number;
  textYPercent?: number;
  /** Skew of the "Loading" text (CSS skew(x, y)). */
  textSkewXDeg?: number;
  textSkewYDeg?: number;
};
