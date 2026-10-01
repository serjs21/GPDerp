import type { ReactNode } from "react";

export type PathNavigationValue = {
  /** Right arrow: one step back toward the newest lantern. */
  showBack: boolean;
  /** Left arrow: one step forward toward older lanterns. */
  showForward: boolean;
  onStepBack: () => void;
  onStepForward: () => void;
};

export type PathNavigationArrowsProps = PathNavigationValue & {
  /** Rendered between the arrows (e.g. the lantern actions panel). */
  children: ReactNode;
};

export type PathNavigationProviderProps = {
  /** `null` disables the arrows (e.g. while a haiku is generating). */
  value: PathNavigationValue | null;
  children: ReactNode;
};
