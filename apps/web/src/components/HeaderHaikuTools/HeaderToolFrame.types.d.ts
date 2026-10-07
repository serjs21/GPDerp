import type { ReactNode } from "react";

export type HeaderToolFrameProps = {
  /** Extra class on the interactive panel (background color per tool). */
  panelClassName?: string;
  role?: string;
  "aria-label"?: string;
  children: ReactNode;
};
