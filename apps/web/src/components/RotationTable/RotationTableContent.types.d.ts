import type { ReactNode, RefObject } from "react";

export type RotationTableContentProps = {
  /** Content carries the rotate transform and is the rotation origin. */
  applyTransform: boolean;
  originRef: RefObject<HTMLDivElement | null>;
  degrees: number;
  transformOrigin: string;
  contentClassName?: string;
  /** Control element with rotation pointer handlers already attached. */
  control: ReactNode;
  children: ReactNode;
};
