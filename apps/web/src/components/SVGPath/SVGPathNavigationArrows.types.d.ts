export type SVGPathNavigationArrowsProps = {
  /** Right arrow: one step back toward the newest lantern. */
  showBack: boolean;
  /** Left arrow: one step forward toward older lanterns. */
  showForward: boolean;
  onStepBack: () => void;
  onStepForward: () => void;
};
