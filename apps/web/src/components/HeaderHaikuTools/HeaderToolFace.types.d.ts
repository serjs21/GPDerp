import type { ReactNode } from "react";

export type HeaderToolFaceProps = {
  hidden?: boolean;
  /** Horizontal slide origin for hover text (over the icon). */
  enterFrom?: "left" | "right";
  children: ReactNode;
};
